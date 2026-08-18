import { env } from "../config/env.js";
import { dedupeCategories } from "./categoryDedup.js";

async function wcFetch(path: string, search = ""): Promise<Response> {
  const url = `${env.wcOrigin}/wp-json/wc/store/v1${path}${search}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "lashon-hara-bff" },
  });
  if (!res.ok) {
    throw new Error(`WooCommerce ${res.status} ${url}`);
  }
  return res;
}

export async function listProducts(query: URLSearchParams) {
  const params = new URLSearchParams(query);
  if (!params.has("per_page")) params.set("per_page", "24");
  const res = await wcFetch("/products", `?${params.toString()}`);
  const items = (await res.json()) as unknown[];
  return {
    items,
    total: Number(res.headers.get("x-wp-total") ?? items.length),
    totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
  };
}

export async function getProduct(id: string) {
  const res = await wcFetch(`/products/${id}`);
  return res.json();
}

export async function listProductsByIds(ids: string[]) {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        return await getProduct(id.trim());
      } catch {
        return null;
      }
    }),
  );
  const items = results.filter(Boolean);
  return { items, total: items.length, totalPages: 1 };
}

export async function listCategories() {
  const res = await wcFetch("/products/categories", "?per_page=100");
  const categories = (await res.json()) as Array<{ id: number }>;
  return dedupeCategories(categories);
}
