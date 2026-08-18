import { env } from "../config/env.js";

const STORE_API = `${env.wcOrigin}/wp-json/wc/store/v1`;

export type SessionHeaders = {
  cartToken?: string;
  nonce?: string;
};

export type StoreApiResult<T> = {
  status: number;
  data: T;
  cartToken?: string;
  nonce?: string;
  nonceTimestamp?: string;
};

async function storeApiRequest<T>(
  path: string,
  { method = "GET", body, cartToken, nonce }: { method?: string; body?: unknown } & SessionHeaders = {},
): Promise<StoreApiResult<T>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "lashon-hara-bff",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (cartToken) headers["Cart-Token"] = cartToken;
  if (nonce) headers["Nonce"] = nonce;

  const res = await fetch(`${STORE_API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json()) as T;
  return {
    status: res.status,
    data,
    cartToken: res.headers.get("Cart-Token") ?? undefined,
    nonce: res.headers.get("Nonce") ?? undefined,
    nonceTimestamp: res.headers.get("Nonce-Timestamp") ?? undefined,
  };
}

export function getCart(session: SessionHeaders) {
  return storeApiRequest("/cart", { ...session });
}

export function addItem(
  session: SessionHeaders,
  item: { id: number; quantity: number; variation?: Array<{ attribute: string; value: string }> },
) {
  return storeApiRequest("/cart/add-item", { method: "POST", body: item, ...session });
}

export function updateItem(session: SessionHeaders, key: string, quantity: number) {
  return storeApiRequest("/cart/update-item", { method: "POST", body: { key, quantity }, ...session });
}

export function removeItem(session: SessionHeaders, key: string) {
  return storeApiRequest(`/cart/items/${encodeURIComponent(key)}`, { method: "DELETE", ...session });
}

export function clearCart(session: SessionHeaders) {
  return storeApiRequest("/cart/items", { method: "DELETE", ...session });
}

export function updateCustomer(
  session: SessionHeaders,
  body: { billing_address?: Record<string, unknown>; shipping_address?: Record<string, unknown> },
) {
  return storeApiRequest("/cart/update-customer", { method: "POST", body, ...session });
}

export function selectShippingRate(
  session: SessionHeaders,
  body: { package_id: number | string; rate_id: string },
) {
  return storeApiRequest("/cart/select-shipping-rate", { method: "POST", body, ...session });
}

export function checkout(
  session: SessionHeaders,
  body: {
    billing_address: Record<string, unknown>;
    shipping_address?: Record<string, unknown>;
    customer_note?: string;
    payment_method: string;
    payment_data?: Array<{ key: string; value: string }>;
  },
) {
  return storeApiRequest("/checkout", { method: "POST", body, ...session });
}

export function getOrder(session: SessionHeaders, id: string, key?: string) {
  const qs = key ? `?key=${encodeURIComponent(key)}` : "";
  return storeApiRequest(`/order/${encodeURIComponent(id)}${qs}`, { ...session });
}
