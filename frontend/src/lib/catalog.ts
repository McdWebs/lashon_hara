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

export async function fetchProducts(search: string): Promise<CatalogPage> {
  const res = await fetch(`${base}/products?${search}`);
  if (!res.ok) throw new Error("catalog_unavailable");
  return res.json() as Promise<CatalogPage>;
}

export async function fetchProduct(id: string): Promise<WcProduct> {
  const res = await fetch(`${base}/products/${id}`);
  if (!res.ok) throw new Error("product_not_found");
  return res.json() as Promise<WcProduct>;
}

export async function fetchCategories(): Promise<WcCategory[]> {
  const res = await fetch(`${base}/categories`);
  if (!res.ok) throw new Error("categories_unavailable");
  return res.json() as Promise<WcCategory[]>;
}
