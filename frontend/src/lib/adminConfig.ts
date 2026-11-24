import { adminRequest } from "./media";
import type { CalendarSettings, Flags, LectureConfig, NewCollectionConfig, ShopConfig } from "./siteConfig";

/** What the admin has saved so far. A section that was never saved is missing, and the built-in default applies. */
export type StoredConfig = Partial<{
  flags: Partial<Flags>;
  counter: { value: number | null };
  calendar: CalendarSettings;
  shop: ShopConfig;
  lectures: { items: LectureConfig[] };
  newCollection: NewCollectionConfig;
  productOrder: { orders: Record<string, number[]> };
  images: { slots: Record<string, string> };
}>;

export type Section = "counter" | "calendar" | "shop" | "lectures" | "flags" | "newCollection" | "productOrder" | "images";

export type CalendarTest = { ok: true; events: number; days: string[]; totalDays: number };

export const adminConfig = {
  get: () => adminRequest<StoredConfig>("/config"),
  save: (section: Section, body: unknown) => adminRequest(`/config/${section}`, { method: "PUT", body: JSON.stringify(body) }),
  reset: (section: Section) => adminRequest(`/config/${section}`, { method: "DELETE" }),
  testCalendar: (icsUrl: string) => adminRequest<CalendarTest>("/calendar/test", { method: "POST", body: JSON.stringify({ icsUrl }) }),
};

/** A store product as the admin sees it. Prices are plain numbers in shekels, as text. */
export type AdminProduct = {
  id: number;
  name: string;
  status: string;
  type: string;
  sku: string;
  regularPrice: string;
  salePrice: string;
  stockStatus: string;
  shortDescription: string;
  description: string;
  categories: Array<{ id: number; name: string }>;
  images: Array<{ id?: number; src: string; alt: string; /** Kept in the product but not shown on the site. */ hidden?: boolean }>;
  link: string;
  onSite: boolean;
  /** For a product with options (colors, sizes): each option and the photo it shows now. */
  variations?: Array<{ id: number; label: string; imageId: number; imageSrc: string }>;
};
export type ProductInput = Omit<AdminProduct, "id" | "type" | "categories" | "link" | "onSite" | "variations"> & {
  categories: number[];
  /** Which photo (by its place in `images`) each option should show; null leaves the option without one. */
  variationLinks?: Array<{ variationId: number; imageIndex: number | null }>;
};
export type ProductList = { items: AdminProduct[]; total: number; totalPages: number };

export const adminProducts = {
  list: (params: { search: string; status: string; page: number }) => {
    const q = new URLSearchParams({ page: String(params.page), status: params.status });
    if (params.search) q.set("search", params.search);
    return adminRequest<ProductList>(`/products?${q}`);
  },
  get: (id: number) => adminRequest<AdminProduct>(`/products/${id}`),
  create: (body: ProductInput) => adminRequest<AdminProduct>("/products", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: ProductInput) => adminRequest<AdminProduct>(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number) => adminRequest(`/products/${id}`, { method: "DELETE" }),
};

export type ShopOrderItem = { id: number; name: string; image: string; price: number };
export const adminShopOrder = {
  get: (collection: string, categories: number[]) => adminRequest<{ custom: boolean; items: ShopOrderItem[] }>(`/shop-order?collection=${encodeURIComponent(collection)}&category=${categories.join(",")}`),
};

export type AdminCategory = { id: number; name: string; parent: number; count: number; hiddenOnSite: boolean };
export type CategoryInput = { name: string; parent: number };
export const adminCategories = {
  list: () => adminRequest<{ items: AdminCategory[] }>("/categories"),
  create: (body: CategoryInput) => adminRequest<AdminCategory>("/categories", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: CategoryInput) => adminRequest<AdminCategory>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number) => adminRequest(`/categories/${id}`, { method: "DELETE" }),
};
