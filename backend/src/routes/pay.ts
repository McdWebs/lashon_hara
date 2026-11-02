import crypto from "node:crypto";
import { Router } from "express";
import { rateLimit } from "../middleware/rateLimit.js";
import { z } from "zod";
import { env } from "../config/env.js";

/**
 * The payment screen's data. A customer arrives with an order id and the order key from the checkout, so the key is
 * checked here before anything about the order is returned. Card details never touch this site: the card form is the
 * payment company's own page, which WooCommerce's payment plugin signs for the order.
 */
export const payRouter = Router();

const PAID = new Set(["processing", "completed"]);
const PAYABLE = new Set(["pending", "failed"]);
const FRAME_HOSTS = new Set(["pay.hyp.co.il", "icom.yaad.net", "pay.yaad.net"]);

type WcOrder = {
  id: number;
  status: string;
  order_key: string;
  currency: string;
  total: string;
  total_tax: string;
  discount_total: string;
  shipping_total: string;
  payment_url: string;
  date_created: string;
  billing: { first_name: string; last_name: string; city: string; address_1: string; address_2: string };
  shipping: { first_name: string; last_name: string; city: string; address_1: string; address_2: string };
  shipping_lines: Array<{ method_title: string }>;
  line_items: Array<{
    name: string;
    quantity: number;
    subtotal: string;
    total: string;
    image?: { src?: string };
    meta_data?: Array<{ display_key?: string; display_value?: unknown; key: string }>;
  }>;
};

function basicAuth() {
  return Buffer.from(`${process.env.WC_CONSUMER_KEY ?? ""}:${process.env.WC_CONSUMER_SECRET ?? ""}`).toString("base64");
}

async function loadOrder(id: string): Promise<WcOrder | null> {
  const res = await fetch(`${env.wcOrigin}/wp-json/wc/v3/orders/${id}`, {
    headers: { Authorization: `Basic ${basicAuth()}`, Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`order_lookup_${res.status}`);
  return (await res.json()) as WcOrder;
}

function sameKey(a: string, b: string) {
  const left = crypto.createHash("sha256").update(a).digest();
  const right = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(left, right);
}

const idSchema = z.string().regex(/^\d{1,10}$/);

/** The order, if the id and the key belong together. Everything else looks the same to the caller: not found. */
async function verified(id: string, key: unknown) {
  if (!idSchema.safeParse(id).success || typeof key !== "string" || key.length < 8 || key.length > 80) return null;
  const order = await loadOrder(id);
  if (!order || !sameKey(order.order_key, key)) return null;
  return order;
}

payRouter.use(rateLimit({ name: "pay", windowMs: 60_000, max: 90 }));

payRouter.get("/:id", async (req, res) => {
  try {
    const order = await verified(req.params.id, req.query.key);
    if (!order) {
      res.status(404).json({ error: "order_not_found" });
      return;
    }
    const subtotal = order.line_items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const to = order.shipping.address_1 ? order.shipping : order.billing;
    res.set("Cache-Control", "no-store");
    res.json({
      id: order.id,
      status: order.status,
      paid: PAID.has(order.status),
      payable: PAYABLE.has(order.status),
      currency: order.currency,
      items: order.line_items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        total: item.total,
        image: item.image?.src || undefined,
        options: (item.meta_data ?? [])
          .filter((m) => !m.key.startsWith("_") && typeof m.display_value === "string")
          .map((m) => `${m.display_key ?? m.key}: ${String(m.display_value).replace(/<[^>]*>/g, "")}`),
      })),
      subtotal: subtotal.toFixed(2),
      discount: order.discount_total,
      shipping: order.shipping_total,
      shippingTitle: order.shipping_lines[0]?.method_title,
      total: order.total,
      shipTo: { name: `${to.first_name} ${to.last_name}`.trim(), city: to.city, address: [to.address_1, to.address_2].filter(Boolean).join(" ") },
    });
  } catch (err) {
    console.error("pay order lookup failed", err instanceof Error ? err.message : err);
    res.status(502).json({ error: "order_unavailable" });
  }
});

/** The payment company's signed card page for this order, as the store's own payment page embeds it. */
payRouter.get("/:id/frame", async (req, res) => {
  try {
    const order = await verified(req.params.id, req.query.key);
    if (!order) {
      res.status(404).json({ error: "order_not_found" });
      return;
    }
    if (!PAYABLE.has(order.status)) {
      res.status(409).json({ error: "not_payable", status: order.status });
      return;
    }
    const pageUrl = new URL(order.payment_url);
    if (pageUrl.origin !== new URL(env.wcOrigin).origin) {
      res.status(502).json({ error: "frame_unavailable" });
      return;
    }
    // Without pay_for_order the store's payment page shows the payment company's card form straight away.
    pageUrl.searchParams.delete("pay_for_order");
    const page = await fetch(pageUrl, { headers: { "User-Agent": "lashon-hara-bff", Accept: "text/html" }, signal: AbortSignal.timeout(20_000) });
    const html = await page.text();
    const match = html.match(/<iframe[^>]*\ssrc="(https:\/\/[^"]+)"/gi)
      ?.map((tag) => tag.match(/src="([^"]+)"/)?.[1] ?? "")
      .map((src) => src.replace(/&#0?38;|&amp;/g, "&"))
      .find((src) => FRAME_HOSTS.has(new URL(src).hostname));
    if (!match) {
      res.status(502).json({ error: "frame_unavailable" });
      return;
    }
    res.set("Cache-Control", "no-store");
    res.json({ src: match });
  } catch (err) {
    console.error("pay frame lookup failed", err instanceof Error ? err.message : err);
    res.status(502).json({ error: "frame_unavailable" });
  }
});
