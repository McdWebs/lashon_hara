/**
 * Addresses from the old store that people may still have: Google results, shared links, bookmarks, old emails.
 * They open the matching page on this site instead of a dead end. Product addresses are looked up in a list made
 * from the store (scripts/legacy-products.mjs), loaded only when such a link is opened.
 */
const PAGES: Record<string, string> = {
  "about-us": "/who-we-are",
  "our-activity": "/activity",
  "join-us": "/join",
  "contact-us": "/join?panel=contact",
  "contact": "/join?panel=contact",
  "donate": "/join#donate",
  "תרומה": "/join#donate",
  "תרומה-donate": "/join#donate",
  "תרומה-לדוגמה": "/join#donate",
  "shop-m": "/shop",
  "my-account": "/shop",
  "wholesale": "/join?panel=contact",
  "request-a-quote": "/join?panel=contact",
  "custom": "/join?panel=contact",
  "החזון-שלנו": "/who-we-are",
  "חנויות-שניתן-להשיג": "/shop",
  "2019-bak-to-school": "/activity",
  "rimon": "/",
  "rimon-en": "/",
  "shabbat": "/",
  "communication-preferences": "/",
  "af-product-visibility": "/",
};

function clean(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Where an old-store address now lives, or null when it is not an old address. */
export async function legacyTarget(pathname: string): Promise<string | null> {
  const parts = pathname.split("/").filter(Boolean).map(clean);
  if (parts[0] === "en") parts.shift();
  if (parts.length === 0) return null;

  if (parts[0] === "product" && parts[1]) {
    const products = (await import("./legacyProducts.json")).default as Record<string, number>;
    const id = products[parts[1]];
    return id ? `/shop/product/${id}` : "/shop";
  }
  if (parts[0] === "product-category" || parts[0] === "product-tag") return "/shop";
  if (parts.length === 1) return PAGES[parts[0]] ?? null;
  return null;
}
