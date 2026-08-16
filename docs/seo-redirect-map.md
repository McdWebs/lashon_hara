# SEO redirect map (Phase 1)

New app uses cleaner paths. Until the domain cutover, these are in-app `Navigate` aliases. At cutover, implement **301** at Cloudflare/Kinsta for the same pairs.

| Current | New (canonical in the React app) | Action |
| --- | --- | --- |
| `/` | `/` | Keep |
| `/about-us/` | `/about` | Alias now; 301 at cutover |
| `/our-activity/` | `/activities` | Alias now; 301 at cutover |
| `/join-us/` | `/join` | Alias now; 301 at cutover |
| `/contact-us/` | `/contact` | Alias now; 301 at cutover |
| `/contact/` | `/contact` | Keep meaning |
| `/donate/` | `/donate` (UI) then existing WC donate for payment | Keep `/donate/` live on WP until payments |
| `/תרומה/` `/תרומה-donate/` `/תרומה-לדוגמה/` | `/donate/` | 301 to `/donate/` at cutover |
| `/shop/` | `/shop` | Keep |
| `/shop-m/` | `/shop` | Alias now; 301 at cutover |
| `/product/{slug}/` | Woo URLs stay canonical for SEO | New UI uses `/shop/product/:id` as extra; do not drop WC product URLs |
| `/cart/` `/checkout/` `/my-account/` | unchanged on Woo | Keep |
| `/wholesale/` `/request-a-quote/` `/custom/` `/terms/` | unchanged | Keep |
| Campaign pages (`/rimon/`, `/shabbat/`, …) | unchanged | Do not delete |

Yoast sitemap currently lists `http://` locs. Fix scheme to `https` on WordPress when you have admin access.

Homepage canonical remains `https://lashonhara.co.il/`.
