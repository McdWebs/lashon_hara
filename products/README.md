# Products

This folder is a **snapshot** of the product catalog, pulled from the live store and organized by category for reference. It is not read by the app — the site fetches products live at runtime (see "Where products come from" below). Nothing in this folder is imported by the frontend or backend code.

Snapshot date: 2026-08-18. Re-run the fetch (see bottom) to refresh.

## Where products come from (how the site gets them)

The catalog isn't stored in this repo at all during normal operation — it lives in a **WordPress/WooCommerce store** and is fetched live over the WooCommerce Store API:

1. **Source of truth**: `https://lashonhara.co.il` (a WordPress site running WooCommerce). Configured via `WC_ORIGIN` in [`backend/.env`](../backend/.env) and `VITE_WC_STORE_ORIGIN` in [`frontend/.env`](../frontend/.env).
2. **Backend proxy**: [`backend/src/services/woocommerce.ts`](../backend/src/services/woocommerce.ts) calls `https://lashonhara.co.il/wp-json/wc/store/v1/...` (the public WooCommerce Store API — no auth needed for reads). [`backend/src/routes/catalog.ts`](../backend/src/routes/catalog.ts) exposes this as `/api/catalog/products`, `/api/catalog/products/:id`, and `/api/catalog/categories`.
3. **Frontend client**: [`frontend/src/lib/catalog.ts`](../frontend/src/lib/catalog.ts) calls `/api/catalog/*` in development, or hits the WooCommerce Store API directly from the browser in production if `VITE_WC_STORE_ORIGIN` is set (`useWcDirect`).
4. **Consumers**: `frontend/src/pages/StorePage(Editorial).tsx`, `ProductPage(Editorial).tsx`, `frontend/src/lib/bundles.ts`, `frontend/src/lib/shop.ts`, `HomePage.tsx`, `SchoolsOrderForm.tsx`, etc. all go through `catalog.ts` to render products, popular items, related items, and cart bundles.

So: products are managed in WooCommerce (WordPress admin), not in this git repo. This `products/` folder is just a point-in-time export for browsing/analysis.

## Files

- `all-products.json` — all 280 products, flattened to the fields that matter (id, name, slug, permalink, price, stock status, categories, images, short description).
- `categories.json` — all 42 WooCommerce categories (id, name, slug, parent, product count), sorted by product count.
- `categories-index.md` — human-readable table of categories with links to their per-category file.
- `by-category/*.json` — one file per category, containing that category's product list (a product can appear in more than one category file if it's tagged with multiple categories in WooCommerce).
- `by-category/_uncategorized.json` — the handful of products with no category assigned.

## Regenerating this snapshot

The Store API is public for reads, no credentials needed:

```bash
curl -s "https://lashonhara.co.il/wp-json/wc/store/v1/products/categories?per_page=100"
curl -s "https://lashonhara.co.il/wp-json/wc/store/v1/products?per_page=100&page=1"
```

Page through with `page=2`, `page=3`, ... using the `X-WP-TotalPages` response header until exhausted (280 products / 100 per page = 3 pages as of this snapshot).
