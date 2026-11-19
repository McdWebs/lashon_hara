# Old addresses → new site

People still have links to the old store (Google results, shares, bookmarks, old emails). Every old address opens its
matching page here instead of a dead end.

**Two layers**

1. `frontend/vercel.json` — real 301s for the old pages with plain-letter addresses (with and without the trailing slash).
2. `frontend/src/site/legacyUrls.ts` (opened through `LegacyGate`, the site's catch-all) — everything else:
   Hebrew-letter addresses and every `/product/{slug}/`. This one moves the visitor in the browser, not with a 301.

| Old address | Opens |
| --- | --- |
| `/product/{slug}/` | `/shop/product/{id}` (unknown slug → `/shop`) |
| `/product-category/…`, `/product-tag/…` | `/shop` |
| `/about-us/` | `/who-we-are` |
| `/our-activity/`, `/2019-bak-to-school/` | `/activity` |
| `/join-us/` | `/join` |
| `/contact-us/`, `/contact/`, `/wholesale/`, `/request-a-quote/`, `/custom/` | `/join?panel=contact` |
| `/donate/`, `/תרומה/`, `/תרומה-donate/`, `/תרומה-לדוגמה/` | `/join#donate` |
| `/shop-m/`, `/my-account/`, `/חנויות-שניתן-להשיג/` | `/shop` |
| `/החזון-שלנו/` | `/who-we-are` |
| `/rimon/`, `/rimon-en/`, `/shabbat/`, `/communication-preferences/`, `/af-product-visibility/` | `/` |

`/en/…` versions of the same addresses work too. `/cart/` and `/checkout/` are real pages here.

**Choices to review:** where `/wholesale/`, `/request-a-quote/`, `/custom/` and the campaign pages land is a guess
(the new site has no matching page). Change them in `legacyUrls.ts` and `vercel.json`.

**Keeping the product list current.** Slugs come from `products/all-products.json`. After refreshing that snapshot run
`node frontend/scripts/legacy-products.mjs`. A product added to the store after the snapshot has no old link to keep.
