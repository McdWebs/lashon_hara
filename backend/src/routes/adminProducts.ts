import { Router } from "express";
import { z } from "zod";
import { adminCreateProduct, adminGetProduct, adminListProducts, adminTrashProduct, adminUpdateProduct, WcAdminError } from "../services/wcAdmin.js";
import { getOrders } from "../services/productOrder.js";
import { orderedItems } from "../services/productIndex.js";
import { purgeCatalog } from "./catalog.js";

/** Product management for the team. Mounted under the admin router, after it checks the login. */
export const adminProductsRouter = Router();
adminProductsRouter.use("/products", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

const price = z.string().trim().regex(/^(\d+(\.\d{1,2})?)?$/);

const body = z.object({
  name: z.string().trim().min(1).max(200),
  status: z.enum(["publish", "draft"]),
  regularPrice: price,
  salePrice: price,
  stockStatus: z.enum(["instock", "outofstock"]),
  sku: z.string().trim().max(80),
  shortDescription: z.string().max(5000),
  description: z.string().max(20000),
  categories: z.array(z.number().int().positive()).max(30),
  images: z
    .array(z.object({ id: z.number().int().positive().optional(), src: z.string().url().max(1000).optional(), alt: z.string().max(200).optional() }).refine((i) => i.id || i.src))
    .max(12),
});

function fail(res: import("express").Response, err: unknown) {
  if (err instanceof WcAdminError) {
    res.status(err.status).json({ error: err.code });
    return;
  }
  console.error(err);
  res.status(502).json({ error: "store_unavailable" });
}

adminProductsRouter.get("/products", async (req, res) => {
  const q = z
    .object({ search: z.string().max(100).optional(), status: z.enum(["any", "publish", "draft", "private"]).optional(), page: z.coerce.number().int().min(1).max(500).default(1) })
    .safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  try {
    res.json(await adminListProducts({ ...q.data, perPage: 20 }));
  } catch (err) {
    fail(res, err);
  }
});

adminProductsRouter.get("/products/:id", async (req, res) => {
  try {
    res.json(await adminGetProduct(req.params.id));
  } catch (err) {
    fail(res, err);
  }
});

adminProductsRouter.post("/products", async (req, res) => {
  const parsed = body.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  try {
    const product = await adminCreateProduct(parsed.data);
    purgeCatalog();
    res.json(product);
  } catch (err) {
    fail(res, err);
  }
});

adminProductsRouter.put("/products/:id", async (req, res) => {
  const parsed = body.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  try {
    const product = await adminUpdateProduct(req.params.id, parsed.data);
    purgeCatalog();
    res.json(product);
  } catch (err) {
    fail(res, err);
  }
});

adminProductsRouter.delete("/products/:id", async (req, res) => {
  try {
    await adminTrashProduct(req.params.id);
    purgeCatalog();
    res.json({ ok: true });
  } catch (err) {
    fail(res, err);
  }
});

/** The products of one shop tab, in the order the shop shows them by default (the team's order applied). */
adminProductsRouter.get("/shop-order", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const q = z.object({ collection: z.string().regex(/^[a-z0-9-]{1,30}$/), category: z.string().regex(/^[\d,]{0,300}$/).default("") }).safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  const order = (await getOrders())[q.data.collection] ?? [];
  const items = await orderedItems(q.data.category.split(",").filter(Boolean).map(Number), order);
  if (!items) {
    res.status(502).json({ error: "store_unavailable" });
    return;
  }
  res.json({
    custom: order.length > 0,
    items: items.map((p) => {
      const prices = p.prices as { price: string; currency_minor_unit?: number };
      const image = (p.images as Array<{ thumbnail?: string; src?: string }>)[0];
      return { id: p.id as number, name: String(p.name), image: image?.thumbnail || image?.src || "", price: Number(prices.price) / 10 ** (prices.currency_minor_unit ?? 2) };
    }),
  });
});
