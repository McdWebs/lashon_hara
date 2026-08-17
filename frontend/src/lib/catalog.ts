import { decodeHtmlEntities } from "./html";

export type WcPrices = {
  price: string;
  regular_price: string;
  currency_minor_unit: number;
  currency_code: string;
};

export type WcProduct = {
  id: number;
  name: string;
  permalink: string;
  type: string;
  prices: WcPrices;
  images: Array<{ src: string; alt: string; thumbnail: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  short_description?: string;
  description?: string;
  add_to_cart?: { url?: string };
};

export type WcCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
};

export type CatalogPage = {
  items: WcProduct[];
  total: number;
  totalPages: number;
};

const base = "/api/catalog";

function normalizeProduct(p: WcProduct): WcProduct {
  return {
    ...p,
    name: decodeHtmlEntities(p.name),
    categories: p.categories.map((c) => ({
      ...c,
      name: decodeHtmlEntities(c.name),
    })),
    images: p.images.map((img) => ({
      ...img,
      alt: decodeHtmlEntities(img.alt),
    })),
  };
}

function normalizeCategory(c: WcCategory): WcCategory {
  return { ...c, name: decodeHtmlEntities(c.name) };
}

function normalizePage(page: CatalogPage): CatalogPage {
  return { ...page, items: page.items.map(normalizeProduct) };
}

export async function fetchProducts(search: string): Promise<CatalogPage> {
  const res = await fetch(`${base}/products?${search}`);
  if (!res.ok) throw new Error("catalog_unavailable");
  return normalizePage((await res.json()) as CatalogPage);
}

export async function fetchProduct(id: string): Promise<WcProduct> {
  const res = await fetch(`${base}/products/${id}`);
  if (!res.ok) throw new Error("product_not_found");
  return normalizeProduct((await res.json()) as WcProduct);
}

export async function fetchCategories(): Promise<WcCategory[]> {
  const res = await fetch(`${base}/categories`);
  if (!res.ok) throw new Error("categories_unavailable");
  return ((await res.json()) as WcCategory[]).map(normalizeCategory);
}

export async function fetchProductsByIds(ids: number[]): Promise<CatalogPage> {
  if (ids.length === 0) return { items: [], total: 0, totalPages: 1 };
  const res = await fetch(`${base}/products?include=${ids.join(",")}`);
  if (!res.ok) throw new Error("catalog_unavailable");
  return normalizePage((await res.json()) as CatalogPage);
}

export async function fetchPopularProducts(limit = 8): Promise<CatalogPage> {
  const s = new URLSearchParams({ per_page: String(limit), orderby: "popularity" });
  return fetchProducts(s.toString());
}

export async function fetchRelatedProducts(categoryId: number, excludeId: number, limit = 4): Promise<CatalogPage> {
  const s = new URLSearchParams({
    category: String(categoryId),
    per_page: String(limit + 1),
  });
  const page = await fetchProducts(s.toString());
  return {
    ...page,
    items: page.items.filter((p) => p.id !== excludeId).slice(0, limit),
  };
}
