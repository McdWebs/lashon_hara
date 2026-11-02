export type PayOrder = {
  id: number;
  status: string;
  paid: boolean;
  /** Still waiting for payment, so the card form can be shown. */
  payable: boolean;
  currency: string;
  items: Array<{ name: string; quantity: number; total: string; image?: string; options: string[] }>;
  subtotal: string;
  discount: string;
  shipping: string;
  shippingTitle?: string;
  total: string;
  shipTo: { name: string; city: string; address: string };
};

/** The order behind a payment link. The key in the link is what proves it is theirs. */
export async function fetchPayOrder(id: string, key: string): Promise<PayOrder> {
  const res = await fetch(`/api/pay/${encodeURIComponent(id)}?key=${encodeURIComponent(key)}`);
  if (res.status === 404) throw new Error("order_not_found");
  if (!res.ok) throw new Error("order_unavailable");
  return (await res.json()) as PayOrder;
}

/** The payment company's secure card page for this order. */
export async function fetchPayFrame(id: string, key: string): Promise<string> {
  const res = await fetch(`/api/pay/${encodeURIComponent(id)}/frame?key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error("frame_unavailable");
  return ((await res.json()) as { src: string }).src;
}
