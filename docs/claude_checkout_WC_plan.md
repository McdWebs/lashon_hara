# On-site checkout backed by WooCommerce's headless Store API

## Context

Right now "checkout" on the new site is a dead end: `CheckoutPageEditorial` just shows the cart total and a "Complete on WhatsApp" button — no address form, no payment, no real order. The old WordPress/WooCommerce site (`lashonhara.co.il`) is where products, stock, and orders actually live and get managed.

The goal: make the *entire* shopping flow — browse, cart, checkout, pay, confirm — feel native to the new site (fast, on-brand, no jarring redirects to a WordPress page) while WooCommerce keeps being the system of record for catalog and orders, so nothing new has to be built to manage products or fulfill orders. WhatsApp checkout is being fully replaced, not kept as a fallback.

This is possible because WooCommerce exposes a public, purpose-built **Store API** for exactly this ("headless commerce"): the same API already used for product browsing (`frontend/src/lib/catalog.ts`) also has `/cart`, `/cart/add-item`, `/checkout`, etc. I confirmed all of this live against `lashonhara.co.il` today:

- Session mechanics: `GET /cart` returns a `Cart-Token` (JWT) + a rotating `Nonce` as response headers; every subsequent cart/checkout call must send them back as request headers.
- Cross-origin: a `GET /cart` with a foreign `Origin` header gets no `Access-Control-Allow-Origin` back — the Store API does **not** allow arbitrary browser-to-WC calls. Cart/checkout must be proxied through our own backend, same as products already are.
- Endpoints confirmed to exist via route introspection: `cart`, `cart/add-item`, `cart/update-item`, `cart/remove-item`, `cart/items` (GET/POST/DELETE), `cart/items/{key}` (GET/POST/DELETE), `cart/update-customer`, `cart/select-shipping-rate`, `cart/apply-coupon`/`remove-coupon`, `checkout` (GET/POST), `checkout/{id}`, `order/{id}`.
- Checkout's `POST` body accepts `billing_address`, `shipping_address`, `payment_method`, `customer_note`, `payment_data`. Address sub-schema fields (`first_name`, `last_name`, `company`, `address_1`, `address_2`, `city`, `state`, `postcode`, `country`, `phone`, `email`) are all flagged `required: true` in the schema, but WooCommerce's real-world validation is typically looser than that (e.g. `company` is rarely actually enforced) — the practically-required subset needs confirming empirically while wiring this up, not assumed from the schema alone.
- Active payment gateway on the store: **YaadPay** — a hosted, redirect-based Israeli gateway (`payment_methods: ["yaadpay"]`). Card entry happens on YaadPay's page, not ours — good, it keeps PCI scope off this site entirely.
- Product detail responses for `type: "variable"` products already embed `attributes` (with `terms`) and `variations` (`{id, attributes: [{name, value: <term slug>}]}`) — no extra call needed to build a picker. **60% of the catalog (168/280) is `type: "variable"`**, so a variation picker is required, not optional, for most add-to-carts to even be valid against the real WC cart.
- `/order/{id}` exists for confirmation-page polling, but its access-control behavior (does it need the same `Cart-Token` session, an `order_key`, or both?) is unverified — flagged as a spike below.

## Key architectural decision: where does the Cart-Token/Nonce live?

**The frontend holds `Cart-Token`/`Nonce` in `localStorage`** (new keys, alongside the existing `lh-cart` convention in `frontend/src/lib/cart.ts`) and sends them back as request headers on every `/api/cart/*` / `/api/checkout/*` call. The backend stays stateless with respect to cart identity — no new DB dependency, no session library.

Why: `frontend/vite.config.ts` proxies `/api` to the backend in dev, and `frontend/vercel.json` rewrites `/api/:path*` to the Render backend in prod — so `/api/*` is **same-origin from the browser's perspective in both environments**. The actual cross-origin hop (backend → `lashonhara.co.il`) is server-to-server and never touches browser CORS at all. So there's no real need for cookies or server-side session storage; it's the same "frontend owns its own persistence" pattern already used for the cart (`localStorage["lh-cart"]`). A cookie-based alternative was considered and rejected — it would need a new dependency (`cookie-parser`) and adds state to an otherwise stateless backend for no real security benefit (the WC cart token is a low-sensitivity guest-session id, not a credential).

Still add `exposedHeaders: ["Cart-Token", "Nonce", "Nonce-Timestamp"]` to the existing `cors()` config in `backend/src/index.ts` as cheap future-proofing. The new cart client must always call **relative** `/api/cart`, `/api/checkout` paths (never an absolute cross-origin URL) to keep the same-origin guarantee intentional.

This has zero dependency on MongoDB — consistent with `routes/forms.ts`/`routes/stats.ts` already treating the DB as optional.

## Phase 0 — Decisions

1. **`backend/src/routes/payments.ts`** is an unrelated, never-wired stub (empty `PAYMENT_PROVIDER`/keys, hardcoded `"on_hold"`). Recommend removing it and its mount in `backend/src/index.ts` — the new `/api/checkout` supersedes it, and leaving a stub claiming payment is on hold would be misleading. Flagging this rather than doing it silently.
2. `cartWhatsAppText` (`frontend/src/lib/cart.ts`) is used by the live checkout page (being replaced) and by the dead, unrouted `frontend/src/pages/CommercePages.tsx` (out of scope, not to be touched). Keep it exported but stop calling it from the new checkout — avoids touching the out-of-scope file.
3. `frontend/src/pages/ProductPage.tsx` is only reachable for one hardcoded product (`SCHOOLS_PRODUCT_ID = 355`), confirmed live to be `type: "simple"` — it needs the cart-shape update (Phase 2) but no variation picker.
4. Coupons (`cart/apply-coupon`, `cart/remove-coupon` exist on the API) are out of scope for this pass.

## Phase 1 — Backend cart/checkout proxy

New `backend/src/services/wcCart.ts`, mirroring the style of `backend/src/services/woocommerce.ts` but forwarding `Cart-Token`/`Nonce` both ways, and **not** collapsing WooCommerce's real error codes into a generic 502 (cart/checkout errors like out-of-stock or invalid nonce need to reach the UI).

New `backend/src/routes/cart.ts` (mounted at `/api/cart`), same try/catch + JSON-error pattern as `backend/src/routes/catalog.ts`:
- `GET /` (get cart), `POST /add-item` (`{id, quantity, variation_id?}`), `POST /update-item`, `DELETE /items/:key`, `DELETE /items` (clear), `POST /update-customer`, `POST /select-shipping-rate`.
- Every handler relays `Cart-Token`/`Nonce`/`Nonce-Timestamp` back as response headers.

New `backend/src/routes/checkout.ts` (mounted at `/api/checkout`):
- `POST /` — zod-validated body (mirroring the existing schema style in `backend/src/utils/schemas.ts`), server hardcodes `payment_method: "yaadpay"` (the only configured gateway — don't trust the client to pick), forwards to WC, relays token/nonce, returns `order_id`, `order_key`, `payment_result`.
- `GET /order/:id` — proxy to `GET /wc/store/v1/order/:id` for the confirmation-page spike in Phase 5.

`backend/src/index.ts`: mount both new routers, add `exposedHeaders` to `cors()`, remove the `paymentsRouter` import/mount per Phase 0.

## Phase 2 — Frontend cart data-layer rewrite

New `frontend/src/lib/cartSession.ts`: `localStorage` keys `lh-cart-token`/`lh-cart-nonce`; a `cartRequest()` helper that attaches stored token/nonce, calls relative `/api/cart*`/`/api/checkout*`, captures fresh token/nonce from every response, and throws `new Error(code)` using WC's relayed error code — matching the `throw new Error("snake_case_code")` convention already used in `lib/catalog.ts`.

Rewrite `frontend/src/lib/cart.ts`:
- Re-key cart items by WooCommerce's own cart-item `key` (not product `id`) — this also fixes a real latent bug where two different variations of the same product currently collide into one cart line, since today's store keys purely on `id`.
- Store shape becomes server-backed: actions call `cartSession`, apply an optimistic local patch for instant feedback, then reconcile with WC's authoritative response (items + `totals`). Prefer WC's own `totals` over the current local `price × qty` math (`lib/cart.ts`, `StoreCommerceEditorial.tsx`'s `lineTotal`) since only WC's totals correctly reflect tax/shipping/discounts.
- Update call sites for the new key (`item.id` → `item.key`), no visual restructuring: `frontend/src/components/StoreCartDrawer.tsx`, `CartPageEditorial`/`OrderTotal` in `frontend/src/pages/StoreCommerceEditorial.tsx`, `addToCart`/`handleAddToCart` in `ProductPageEditorial.tsx` and `ProductPage.tsx`. `CartButton.tsx`'s quantity-sum logic is unaffected.

## Phase 3 — Variation picker

Confirmed shape: `attributes: [{id, name, taxonomy, terms: [{id, name, slug}]}]`, `variations: [{id, attributes: [{name, value: <term slug>}]}]` — matching must be done on `{attribute display name, term slug}` pairs (not term ids). No per-variation price/stock is embedded — keep it minimal and let the real `add-item` call surface stock errors, rather than pre-fetching every variation.

- Extend `WcProduct` in `frontend/src/lib/catalog.ts` with optional `attributes?`/`variations?` fields (additive, doesn't disturb existing callers that don't need them).
- New `frontend/src/components/VariationPicker.tsx`: one `Select` per attribute, resolves to a `variation_id` once every attribute is chosen; auto-selects single-option attributes.
- `ProductPageEditorial.tsx`: for `type === "variable"`, render the picker above the quantity/add-to-cart controls (both the desktop layout and the mobile sticky bar), disable "Add to cart" until a valid variation resolves.

## Phase 4 — Real checkout form

Extract checkout into its own new file, `frontend/src/pages/CheckoutPageEditorial.tsx` (out of `StoreCommerceEditorial.tsx`, which currently bundles `CartPageEditorial` + `OrderTotal` + the old checkout) — the new form (react-hook-form + address fields + shipping-rate selection + submit/loading/error states) is a different order of complexity and deserves its own file. Update the import in `frontend/src/App.tsx`. `CartPageEditorial`/`OrderTotal` stay in `StoreCommerceEditorial.tsx`, only re-keyed per Phase 2.

- Form via `react-hook-form` (already used elsewhere in the project) + zod resolver.
- Fields: first/last name, phone, email, address line 1 (+ optional line 2), city (reuse the existing `frontend/src/components/CityAutocomplete.tsx` + `frontend/src/lib/israeliLocalities.ts` — already built for this), postcode, country fixed to `IL`, optional "ship to a different address," optional order note. Confirm the actually-enforced-required subset against WooCommerce's live validation errors while building, since the schema over-declares `required: true`.
- Flow: validate address → `POST /api/cart/update-customer` → if `needs_shipping`, show `shipping_rates` from the refreshed cart, `POST /api/cart/select-shipping-rate` on selection → recompute total from cart `totals` → submit → `POST /api/checkout` → on success, stash `order_id`/`order_key` in `sessionStorage` (resilience for Phase 5) → `window.location.href = payment_result.redirect_url`.
- Remove the WhatsApp button/copy entirely (explicit "fully replace" requirement). Move `track("checkout_started")` to a sensible new trigger (e.g. first field interaction).
- Handle an expired/invalid token/nonce (long-idle tab) by clearing `cartSession` state and re-hydrating, rather than showing a hard failure.

## Phase 5 — Order confirmation + YaadPay redirect spike

New `frontend/src/pages/OrderConfirmationPage.tsx` at `/order-confirmation` (added to `App.tsx`): reads `order_id`/`key` from the query string, falling back to the `sessionStorage` stash; calls `GET /api/checkout/order/:id`; polls briefly if not yet marked paid (gateway IPN can lag the browser redirect); shows success/pending/failed; clears the local cart on confirmed payment.

**Mandatory validation step, not optional polish**: once the backend + a minimal checkout form exist, place one real test order and observe exactly where YaadPay's hosted page returns the browser. You mentioned you have WP admin access, which is what this depends on:
- Best case: WooCommerce → Settings → Payments → YaadPay (or similar) has a configurable return/thank-you URL — point it at `/order-confirmation` on the new site, no code changes needed beyond what's already built.
- If it hardcodes a return to WooCommerce's own order-received page: add a small redirect (via a snippet plugin or `functions.php`, if you have code-editing access in WP admin) that 302s `is_order_received_page()` requests to the new site's `/order-confirmation?order_id={id}&key={key}`.
- Either way, `/order-confirmation`'s own polling + the `sessionStorage` stash are a resilience layer independent of exactly how the redirect resolves.
- Also verify empirically during this spike whether `GET /order/:id` needs the *same* `Cart-Token` session that placed the order, an `order_key`, or both — this determines whether the frontend is allowed to clear its stored cart token immediately after checkout or must hold onto it until confirmation lands.

## Phase 6 — Analytics

Extend the `AnalyticsEvent` union in `frontend/src/lib/analytics.ts` with `checkout_completed` and `payment_failed`. Fire `checkout_completed` in `OrderConfirmationPage` once status resolves to paid; fire `payment_failed` on checkout submit errors and on confirmation-polling timeout/failure.

## Risks / open questions

1. **YaadPay's redirect destination is unverified** until the Phase 5 spike runs — this is the biggest unknown in the whole plan and the one thing that most affects whether the "feels fully native" goal is fully achievable versus needing a WP-admin-side patch.
2. **`GET /order/{id}` access control is unconfirmed** — verify during the spike rather than assuming.
3. **The variation picker is a real feature, not a small add-on** — 60% of the catalog needs it; budget for multi-attribute products, partial-selection states, and out-of-stock combinations only discoverable at add-to-cart time.
4. **Optimistic cart updates need simple race protection** (e.g. rapid quantity-stepper clicks) — a per-item in-flight guard is enough, no need for a full request queue.
5. Removing `payments.ts` (Phase 0) is a judgment call, not a hard requirement — flagged for your sign-off, not done silently.

## Verification

- Backend: exercise the new `/api/cart/*` and `/api/checkout` routes directly (curl/Postman) against the live WC store before wiring up the UI, to nail down exact request/response shapes and real (not just schema-declared) required fields.
- Frontend: manually walk the full flow in the browser — browse → add a simple product → add a variable product (multi-attribute if possible) → view cart → checkout → address form → shipping selection → submit → YaadPay redirect → the Phase 5 spike's real test order → confirmation page — checking WP Admin after each test order to confirm it actually landed in WooCommerce correctly (customer, address, items, payment status).
- Regression-check the existing product browsing/related-products/bundle flows still work unchanged, since `WcProduct` is being extended (additively) and `lib/cart.ts`'s public shape is changing for its consumers.