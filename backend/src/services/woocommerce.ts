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

type Raw = Record<string, any>;

/** Products that stay in WooCommerce but are not shown on this site. */
const HIDDEN_PRODUCT_IDS = new Set<number>([
  50061, // שמירת מקום להרצאה
]);
export const isHiddenProduct = (id: unknown) => HIDDEN_PRODUCT_IDS.has(Number(id));

/** The grid only needs a card's worth of each product; descriptions, attributes and variations stay on the product page. */
function slimProduct(p: Raw) {
  const atc = p.add_to_cart as Raw | undefined;
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    is_in_stock: p.is_in_stock,
    is_purchasable: p.is_purchasable,
    prices: p.prices,
    categories: p.categories,
    images: ((p.images as Raw[]) ?? []).slice(0, 1).map((i) => ({ src: i.src, thumbnail: i.thumbnail, srcset: i.srcset, alt: i.alt })),
    add_to_cart: atc ? { minimum: atc.minimum, maximum: atc.maximum, multiple_of: atc.multiple_of } : undefined,
  };
}

export async function listProducts(query: URLSearchParams) {
  const params = new URLSearchParams(query);
  if (!params.has("per_page")) params.set("per_page", "24");
  const res = await wcFetch("/products", `?${params.toString()}`);
  const all = (await res.json()) as Raw[];
  const items = all.filter((p) => !isHiddenProduct(p.id)).map(slimProduct);
  const removed = all.length - items.length;
  return {
    items,
    total: Math.max(0, Number(res.headers.get("x-wp-total") ?? all.length) - removed),
    totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
  };
}

export async function getProduct(id: string) {
  if (isHiddenProduct(id)) throw new Error("hidden product");
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
