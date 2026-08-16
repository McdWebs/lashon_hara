# Technical audit — lashonhara.co.il

**Date:** 16 August 2026  
**Method:** Public HTTP, HTML, WordPress REST, WooCommerce Store API. No admin access.  
**Source of truth for later implementation:** this document + `lashon_hara_website_redesign_plan.md`.

---

## 1. Existing stack

| Layer | What we found | Confidence |
| --- | --- | --- |
| CMS | WordPress (REST `wp/v2`, XML-RPC, Yoast) | High |
| Frontend (current) | Theme `boutique-starter` + child `lashon-hara`; Bootstrap 4; Elementor 4.2.0 + Elementor Pro | High |
| Page builder | Elementor (homepage `pages/36466`; many pages have empty `content.rendered` because layout lives in Elementor) | High |
| Ecommerce | WooCommerce **10.9.4** | High |
| Database | Typical WP/MySQL on Kinsta (not directly inspectable) | High (inferred) |
| Hosting | **Kinsta** (`x-kinsta-cache`, `ki-edge`) + **Cloudflare** | High |
| Language / dir | `lang="he-IL"` `dir="rtl"` timezone `Asia/Jerusalem` | High |
| Search | YITH WooCommerce Ajax Search Premium | High |
| Forms | Contact Form 7 6.1.6; Elementor Pro forms | High |
| Mail | WP Mail SMTP (REST namespace `wp-mail-smtp/v1`) | High |
| Shipping | HFD / Betanet e-post (`hfd-epost-integration`); WooCommerce Table Rate Shipping | High |
| Cart extras | Min/max quantities; Israel cities; product bundles | High |
| Auth / accounts | WooCommerce My Account; WooCommerce Social Login 2.18.1 | High |
| Payments | REST namespaces: `paypal/v1`, `wc/v3/wc_paypal`. Checkout HTML does not expose a named Israeli gateway without completing checkout. **Client: payment integration on hold; build foundation only.** | Medium |
| Analytics / ads | PixelYourSite PRO 12.5.6 (Facebook + TikTok namespaces); HandL UTM Grabber; Facebook catalog (`wc-facebook`); Jetpack | High |
| SEO | Yoast SEO **28.1**; Redirection plugin; 404-to-301 | High |
| Automation | AutomateWoo; WooCommerce Zapier | High |
| Social feed | Elfsight Instagram Feed (site must not depend on this in the new product) | High |
| POS | `wc/pos/v1/catalog` present (in-store POS possible) | Medium |
| Legacy | `enable-jquery-migrate-helper` | High |

**Logo (keep):** `https://lashonhara.co.il/wp-content/uploads/2019/01/lh-logo.png` (2000×311). Sampled colors: black `#000000`, red ≈ `#ED1B24`.

**Social (from Yoast schema):**

- Facebook: `https://www.facebook.com/Lashon.Hara.Lo.Medaber.Elai/`
- Instagram: `https://www.instagram.com/lashonhara/`
- YouTube / WhatsApp also linked in footer chrome

**Client-supplied support (not invented):** WhatsApp `0543644512`, hours 09:00–18:00, six days a week. One inbox (env var).

---

## 2. Existing pages / routes

Public WP pages (27). Nav on the live site is **store-heavy**.

### Primary public pages

| URL | Role | Keep / change |
| --- | --- | --- |
| `/` | Homepage (Elementor) | Redesign; preserve URL |
| `/about-us/` | About | Redesign; preserve URL |
| `/our-activity/` | Activities | Redesign; preserve URL |
| `/join-us/` | Join (Elementor; REST body empty) | Redesign; preserve URL |
| `/contact-us/` | Contact | Preserve URL; merge UX with `/contact/` |
| `/contact/` | Customer service | Redirect or alias after IA |
| `/donate/` | Donation | Preserve as canonical donate |
| `/shop/` | Catalog | Preserve |
| `/shop-m/` | Second shop page | Redirect to `/shop/` (or mobile equivalent) |
| `/cart/` `/checkout/` `/my-account/` | WooCommerce | Preserve until payment work is unblocked |
| `/wholesale/` | Bulk / wholesale | Preserve; improve as org ordering |
| `/custom/` | Custom event products | Preserve |
| `/request-a-quote/` | Quote | Preserve as bulk/org path |
| `/terms/` | Terms + privacy | Preserve |
| `/החזון-שלנו/` | Vision | Merge into about/message; 301 |
| `/חנויות-שניתן-להשיג/` | Retail stockists | Keep content; possibly footer |
| `/shabbat/` `/2019-bak-to-school/` `/rimon/` `/rimon-en/` | Campaign / partner landings | Preserve URLs; do not delete |
| Duplicate donate URLs | `/תרומה/`, `/תרומה-donate/`, `/תרומה-לדוגמה/` | Canonicalize to `/donate/` |

WooCommerce products use `/product/{slug}/` (280 entries). Categories use `/product-category/...`.

**Blog posts via REST:** `X-WP-Total: 0`. There is **no magazine/article engine** today. SEO content in the plan is new, not a migration.

---

## 3. Existing features

- Commitment form on homepage (first name, phone, email, mailing consent) — **keep copy; upgrade UX in Phase 2**
- Partner paths: ambassadors, donate, schools, personal story
- Educational explainer “מה זה לשון הרע?”
- Shop, cart, checkout, accounts, social login
- Wholesale + request a quote + custom print
- Free shipping messaging (see ecommerce)
- Newsletter-style CF7 in footer (“צמיד ציפוי זהב במתנה”)
- Instagram widget (Elfsight)
- UTM capture (HandL)
- Search (YITH)

Missing vs plan (not on the current site as first-class products): interactive “האם זה לשון הרע?”, stories CMS, ambassador profiles as a system, resource center, magazine, movement map, shareable commitment card.

---

## 4. Ecommerce (public Store API)

| Fact | Value |
| --- | --- |
| Product count | **280** |
| Types | 168 variable, 112 simple |
| On sale (API flag) | 0 in sample of all 280 |
| Currency | ILS (minor units, e.g. `15000` = ₪150) |
| Categories | **41–42** overlapping categories (bracelets dominate: 120 in “צמידי סיליקון”) |
| Bundles plugin | Installed (`woocommerce-product-bundles`) — catalog of predefined kits still needs a content pass |
| Bulk | `/wholesale/`, `/request-a-quote/`, min/max quantities |
| Inventory / orders / customers | **Not visible** without admin |
| Shipping (on-site copy only) | “משלוח חינם בקניה מעל 100 ש״ח” to **pickup points** nationwide; HFD e-post + table rates |
| Store purpose copy | Sales fund free distribution to schools |

**Do not rebuild WooCommerce.** Integrate via Store API / authenticated WC REST from the Node BFF.

**Do not invent prices.** Read them from WooCommerce.

---

## 5. Existing content we may reuse (published only)

From `/about-us/` (verbatim substance, not new claims):

- Association promoting respectful speech; against lashon hara and shaming
- Founded **2007** by **דוד הלפרין**
- Billboards, millions of stickers and bracelets, hospitals, IDF bases, art exhibitions
- Slogan became common language
- Later formalized as an amutah after ~14 years of “guerrilla” activity
- Education programs for the next generation

Homepage: definition of lashon hara; four partner cards; commitment oath text; activity pillars (distributions, ambassadors, school workshops, exhibitions/campaigns).

**Impact numbers:** do not put “millions” in animated counters unless we treat them as about-page narrative, not a live KPI. No ambassador count, school count, or commitment count is published as a dashboard.

Media library (REST): **959** attachments — reuse; do not replace with stock.

---

## 6. SEO

| Item | Status |
| --- | --- |
| Canonical homepage | `https://lashonhara.co.il/` |
| robots.txt | Yoast; sitemap advertised as `http://lashonhara.co.il/sitemap_index.xml` (http) |
| sitemap_index | Pages, products, product_cat, one product-attribute sitemap |
| Mixed scheme | Sitemap `<loc>` uses **http** while the site is **https** — P1 |
| Posts sitemap | None (zero posts) |
| Important URLs | `/`, `/shop/`, `/product/*`, `/about-us/`, `/donate/`, category URLs |
| Hebrew slugs | Percent-encoded in many links; preserve exact paths in redirect map |
| Homepage `article:modified_time` | 2023-03-28 (stale) |

**Rule:** export full URL list before any slug change; 301 everything that moves.

---

## 7. Problems (ranked)

| ID | Sev | Issue |
| --- | --- | --- |
| P0 | Critical | Information architecture competes: shop dominates nav vs movement funnel |
| P0 | Critical | WooCommerce is business-critical (280 SKUs, orders, shipping, possible PayPal) — must not be replaced in Phase 1 |
| P0 | Critical | Payment provider not fully identified from public checkout; checkout stays on Woo until unblocked |
| P1 | High | ~42 overlapping categories; two shop URLs; four donate URLs |
| P1 | High | Elementor + many plugins + PYS/GTM/Facebook/TikTok — performance and INP risk |
| P1 | High | Sitemap http vs https; `sitemap.xml` at root has failed in some clients |
| P1 | High | Zero blog posts vs plan’s SEO engine |
| P1 | High | Commitment is a plain form, not a shareable moment |
| P2 | Medium | jQuery migrate; Bootstrap 4 theme age |
| P2 | Medium | Elfsight Instagram as page content |
| P2 | Medium | Duplicate contact URLs |
| P3 | Low | Campaign microsites (`rimon`, `shabbat`) clutter IA but still have SEO/history value |

---

## 8. Opportunities

| Opportunity | Impact | Effort | Confidence |
| --- | --- | --- | --- |
| New IA + homepage funnel | High | Medium | High |
| Keep WC, new React storefront via Store API | High | High | High |
| Use-case shop nav instead of 42 categories | High | Medium | High |
| School + wholesale as dedicated funnels (pages already exist) | High | Medium | High |
| Commitment experience + share card | High | Medium | High |
| Redirect cleanup (shop-m, donate dupes) | Medium | Low | High |
| Magazine / resources | Medium | High | Medium (needs writers) |
| English | Lower now | High | Plan Phase 4 |

---

## 9. Preservation plan

**Remain (do not throw away):**

- WooCommerce catalog, orders, customers, coupons, shipping, bundles, wholesale
- All current public URLs until mapped
- About/history copy, commitment oath, product images, logo
- Kinsta WordPress as commerce + CMS origin until a deliberate cutover
- Legal page `/terms/`

**Redesign:** theme/Elementor UI, homepage hierarchy, nav, product listing UX, school/join/donate presentation.

**Refactor:** expose WC Store API through Express; do not call Woo secrets from the browser.

**Migrate later (not Phase 1):** products into Mongo — **no**.

**Remove only after redirects:** duplicate shop/donate/contact URLs; Instagram as a required widget.

**Needs approval:** any live checkout change; deleting campaign pages; publishing unpublished stats.

---

## 10. Proposed architecture (locked stack)

```text
React + Vite + TS + MUI + React Router + TanStack Query
                    │
                    ▼
         Express + TS (BFF)
           │            │
           ▼            ▼
     MongoDB Atlas    WooCommerce (Kinsta)
     commitments      products, cart, checkout,
     school leads     orders, shipping, accounts
     ambassadors      (payment when unblocked)
     stories (later)
     CMS-ish content
```

**Phase 1 (after this audit is confirmed):**

- Repo: `frontend/` + `backend/` + `docs/`
- Design system (RTL, logo red/black)
- Homepage + core IA pages with **published copy only**
- Shop browse UI reading public Store API (read-only catalog)
- Cart/checkout: **link to existing WooCommerce** (`/cart/`, `/checkout/`) until payment is unblocked — “foundation” = types, routes, cart context stub, env vars
- `.env.example`: `CONTACT_INBOX`, SMTP, `WC_*`, `MONGODB_URI`, WhatsApp
- Analytics event names from the plan (no fake dashboards)
- SEO: keep legacy paths; document redirect map

**Not in Phase 1:** replacing Kinsta, rebuilding checkout, English, map, inventing kits/prices.

**Hosting (when you deploy):** Vercel (frontend), Render (backend), Atlas (Mongo). WordPress stays on Kinsta until cutover of the domain’s frontend.

**Domain:** same `lashonhara.co.il`. Cutover is DNS/proxy later; you own deployment.

---

## 11. Client decisions captured

1. Same domain  
2. Follow plan phases (Hebrew first; i18n later)  
3. One inbox via `.env`  
4. WhatsApp 0543644512, 09:00–18:00, 6 days  
5. Payment on hold; payment **foundation** only  
6. Placeholders if unpublished  
7. Commit incrementally; wait for confirm only between phases  

---

## 12. Gaps remaining (cannot know without admin)

- Exact payment gateway credentials and whether PayPal is the only method  
- Order volume, inventory accuracy, tax  
- CF7 / Elementor form destination emails (we will use `CONTACT_INBOX`)  
- GA4 vs PYS-only  
- Whether POS and AutomateWoo are in active use  

These do not block Phase 1 UI + BFF + catalog read.
