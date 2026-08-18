import { decodeHtmlEntities } from "./html";

const TOKEN_KEY = "lh-cart-token";
const NONCE_KEY = "lh-cart-nonce";

export type WcCartItem = {
  key: string;
  id: number;
  type: string;
  quantity: number;
  name: string;
  images: Array<{ src: string; thumbnail: string; alt: string }>;
  variation: Array<{ attribute: string; value: string }>;
  prices: { price: string; regular_price: string; currency_minor_unit: number; currency_code: string };
  totals: { line_total: string; line_subtotal: string; currency_minor_unit: number };
};

export type WcShippingRate = {
  rate_id: string;
  name: string;
  price: string;
  currency_minor_unit: number;
  selected: boolean;
  delivery_time?: string;
};

export type WcShippingPackage = {
  package_id: number | string;
  name: string;
  shipping_rates: WcShippingRate[];
};

export type WcCart = {
  items: WcCartItem[];
  totals: {
    total_price: string;
    total_items: string;
    total_shipping: string | null;
    currency_minor_unit: number;
  };
  needs_shipping: boolean;
  needs_payment: boolean;
  shipping_rates: WcShippingPackage[];
  shipping_address: Record<string, string>;
  billing_address: Record<string, string>;
  errors: Array<{ code: string; message: string }>;
};

export type WcCheckoutResult = {
  order_id: number;
  order_key: string;
  status: string;
  payment_result: {
    payment_status: string;
    payment_details: Array<{ key: string; value: string }>;
    redirect_url?: string;
  };
};

function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

function getNonce() {
  return localStorage.getItem(NONCE_KEY) ?? undefined;
}

function persistSession(res: Response) {
  const token = res.headers.get("Cart-Token");
  const nonce = res.headers.get("Nonce");
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (nonce) localStorage.setItem(NONCE_KEY, nonce);
}

export function clearCartSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NONCE_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.body) headers["Content-Type"] = "application/json";
  const token = getToken();
  const nonce = getNonce();
  if (token) headers["Cart-Token"] = token;
  if (nonce) headers["Nonce"] = nonce;

  const res = await fetch(path, { ...init, headers });
  persistSession(res);
  const data = (await res.json()) as T & { code?: string; message?: string };
  if (!res.ok) {
    const message =
      typeof data?.message === "string" && data.message
        ? decodeHtmlEntities(data.message)
        : typeof data?.code === "string"
          ? data.code
          : "cart_request_failed";
    throw new Error(message);
  }
  return data;
}

export const cartApi = {
  get: () => request<WcCart>("/api/cart"),
  addItem: (id: number, quantity: number) =>
    request<WcCart>("/api/cart/add-item", { method: "POST", body: JSON.stringify({ id, quantity }) }),
  updateItem: (key: string, quantity: number) =>
    request<WcCart>("/api/cart/update-item", { method: "POST", body: JSON.stringify({ key, quantity }) }),
  removeItem: (key: string) => request<WcCart>(`/api/cart/items/${encodeURIComponent(key)}`, { method: "DELETE" }),
  clear: () => request<WcCart>("/api/cart/items", { method: "DELETE" }),
  updateCustomer: (body: { billing_address?: Record<string, string>; shipping_address?: Record<string, string> }) =>
    request<WcCart>("/api/cart/update-customer", { method: "POST", body: JSON.stringify(body) }),
  selectShippingRate: (body: { package_id: number | string; rate_id: string }) =>
    request<WcCart>("/api/cart/select-shipping-rate", { method: "POST", body: JSON.stringify(body) }),
};

export function checkoutRequest(body: {
  billing_address: Record<string, string>;
  shipping_address?: Record<string, string>;
  customer_note?: string;
}) {
  return request<WcCheckoutResult>("/api/checkout", { method: "POST", body: JSON.stringify(body) });
}

export function getOrder(id: string, key?: string) {
  const qs = key ? `?key=${encodeURIComponent(key)}` : "";
  return request<{ id: number; status: string; billing_address: Record<string, string> }>(
    `/api/checkout/order/${encodeURIComponent(id)}${qs}`,
  );
}
