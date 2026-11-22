import { env } from "../config/env.js";
import { isHiddenProduct } from "./woocommerce.js";

/** The store's own (write) API. Needs a WooCommerce key with Read/Write permission. */
const auth = () => Buffer.from(`${process.env.WC_CONSUMER_KEY ?? ""}:${process.env.WC_CONSUMER_SECRET ?? ""}`).toString("base64");

export class WcAdminError extends Error {
  constructor(public code: string, public status = 502) {
    super(code);
  }
}

type Raw = Record<string, any>;

async function wc(path: string, init: RequestInit = {}) {
  const res = await fetch(`${env.wcOrigin}/wp-json/wc/v3${path}`, {
    ...init,
    headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "lashon-hara-bff", Authorization: `Basic ${auth()}` },
  });
  const data = (await res.json().catch(() => ({}))) as Raw;
  if (!res.ok) {
    const code = String(data.code ?? "");
    if (res.status === 401 || res.status === 403) {
      // Reading works with any key; these codes mean the key cannot change products.
      throw new WcAdminError(/cannot_(create|edit|delete|batch)|authentication_error/.test(code) ? "store_read_only" : "store_unauthorized", 502);
    }
    if (res.status === 404) throw new WcAdminError("product_not_found", 404);
    if (res.status === 400) throw new WcAdminError("invalid_payload", 400);
    throw new WcAdminError("store_unavailable", 502);
  }
  return { data, headers: res.headers };
}

/** What the admin list and form need from a product. */
function adminProduct(p: Raw) {
  return {
    id: p.id as number,
    name: String(p.name ?? ""),
    status: String(p.status ?? "publish"),
    type: String(p.type ?? "simple"),
    sku: String(p.sku ?? ""),
    regularPrice: String(p.regular_price ?? ""),
    salePrice: String(p.sale_price ?? ""),
    stockStatus: String(p.stock_status ?? "instock"),
    shortDescription: String(p.short_description ?? ""),
    description: String(p.description ?? ""),
    categories: ((p.categories as Raw[]) ?? []).map((c) => ({ id: c.id as number, name: String(c.name ?? "") })),
    images: ((p.images as Raw[]) ?? []).map((i) => ({ id: i.id as number, src: String(i.src ?? ""), alt: String(i.alt ?? "") })),
    link: String(p.permalink ?? ""),
    /** False for products the store keeps out of its catalogue, or this site hides on purpose. */
    onSite: p.catalog_visibility !== "hidden" && !isHiddenProduct(p.id),
  };
}
export type AdminProduct = ReturnType<typeof adminProduct>;

export async function adminListProducts(query: { search?: string; status?: string; page: number; perPage: number }) {
  const params = new URLSearchParams({ per_page: String(query.perPage), page: String(query.page), status: query.status || "any", orderby: "date", order: "desc" });
  if (query.search) params.set("search", query.search);
  const { data, headers } = await wc(`/products?${params}`);
  return {
    items: (data as unknown as Raw[]).map(adminProduct),
    total: Number(headers.get("x-wp-total") ?? 0),
    totalPages: Number(headers.get("x-wp-totalpages") ?? 1),
  };
}

export async function adminGetProduct(id: string) {
  return adminProduct((await wc(`/products/${encodeURIComponent(id)}`)).data);
}

/** The fields the form can change, in the shape the store expects. */
export type ProductInput = {
  name: string;
  status: "publish" | "draft";
  regularPrice: string;
  salePrice: string;
  stockStatus: "instock" | "outofstock";
  sku: string;
  shortDescription: string;
  description: string;
  categories: number[];
  images: Array<{ id?: number; src?: string; alt?: string }>;
};

function toStore(input: ProductInput) {
  return {
    name: input.name,
    status: input.status,
    // Left out when empty so a product priced per variation keeps its prices.
    ...(input.regularPrice ? { regular_price: input.regularPrice, sale_price: input.salePrice } : {}),
    stock_status: input.stockStatus,
    sku: input.sku,
    short_description: input.shortDescription,
    description: input.description,
    categories: input.categories.map((id) => ({ id })),
    // Photos already in the store keep their id; a new link is fetched by the store.
    images: input.images.map((i) => (i.id ? { id: i.id } : { src: i.src, alt: i.alt ?? "" })),
  };
}

export async function adminCreateProduct(input: ProductInput) {
  return adminProduct((await wc("/products", { method: "POST", body: JSON.stringify({ type: "simple", ...toStore(input) }) })).data);
}

export async function adminUpdateProduct(id: string, input: ProductInput) {
  return adminProduct((await wc(`/products/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(toStore(input)) })).data);
}

/** To the store's trash, where it can still be restored. */
export async function adminTrashProduct(id: string) {
  await wc(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}
