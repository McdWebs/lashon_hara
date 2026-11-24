import { Router } from "express";
import { z } from "zod";
import { adminCreateCategory, adminCreateProduct, adminDeleteCategory, adminGetProduct, adminListCategories, adminListProducts, adminTrashProduct, adminUpdateCategory, adminUpdateProduct, WcAdminError } from "../services/wcAdmin.js";
import { getOrders } from "../services/productOrder.js";
import { orderedItems } from "../services/productIndex.js";
import crypto from "node:crypto";
import { publicUrlFor, r2Configured, signUpload } from "../services/r2.js";
import { purgeCatalog } from "./catalog.js";
import { hiddenImages, hiddenSet, saveHiddenImages } from "../services/hiddenImages.js";

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
    .array(z.object({ id: z.number().int().positive().optional(), src: z.string().url().max(1000).optional(), alt: z.string().max(200).optional(), hidden: z.boolean().optional() }).refine((i) => i.id || i.src))
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

/** The product as the form shows it: each photo says whether the team hid it from the site. */
async function withHiddenFlags<T extends { id: number; images: Array<{ id?: number }> }>(product: T) {
  const hidden = hiddenSet(await hiddenImages(), product.id);
  return { ...product, images: product.images.map((i) => ({ ...i, hidden: i.id !== undefined && hidden.has(i.id) })) };
}

/** After a save: the photos marked hidden, found in the saved product by their place in the list (the store keeps the order sent). */
async function rememberHidden(saved: { id: number; images: Array<{ id?: number }> }, sent: Array<{ hidden?: boolean }>) {
  const ids = saved.images.flatMap((img, i) => (sent[i]?.hidden && img.id !== undefined ? [img.id] : []));
  await saveHiddenImages(saved.id, ids);
}

adminProductsRouter.get("/products/:id", async (req, res) => {
  try {
    res.json(await withHiddenFlags(await adminGetProduct(req.params.id)));
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
    await rememberHidden(product, parsed.data.images);
    purgeCatalog();
    res.json(await withHiddenFlags(product));
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
    await rememberHidden(product, parsed.data.images);
    purgeCatalog();
    res.json(await withHiddenFlags(product));
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

const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_IMAGE = 10 * 1024 * 1024;

/**
 * A product photo uploaded from the team's computer goes to the site's image storage first; the store then copies it
 * into its own library from the returned link when the product is saved.
 */
adminProductsRouter.post("/product-images/sign", async (req, res) => {
  if (!r2Configured()) {
    res.status(503).json({ error: "storage_not_configured" });
    return;
  }
  const parsed = z.object({ contentType: z.string(), size: z.number().int().positive() }).safeParse(req.body);
  const ext = parsed.success ? IMAGE_TYPES[parsed.data.contentType] : undefined;
  if (!parsed.success || !ext) {
    res.status(400).json({ error: "unsupported_type" });
    return;
  }
  if (parsed.data.size > MAX_IMAGE) {
    res.status(400).json({ error: "too_large" });
    return;
  }
  const key = `products/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  res.json({ uploadUrl: await signUpload(key, parsed.data.contentType, parsed.data.size), url: publicUrlFor(key) });
});

/* ---------- categories ---------- */

const categoryBody = z.object({ name: z.string().trim().min(1).max(80), parent: z.number().int().min(0) });

adminProductsRouter.get("/categories", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    res.json({ items: await adminListCategories() });
  } catch (err) {
    fail(res, err);
  }
});

adminProductsRouter.post("/categories", async (req, res) => {
  const parsed = categoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  try {
    const category = await adminCreateCategory(parsed.data);
    purgeCatalog();
    res.json(category);
  } catch (err) {
    fail(res, err);
  }
});

adminProductsRouter.put("/categories/:id", async (req, res) => {
  const parsed = categoryBody.safeParse(req.body);
  if (!parsed.success || String(parsed.data.parent) === req.params.id) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  try {
    const category = await adminUpdateCategory(req.params.id, parsed.data);
    purgeCatalog();
    res.json(category);
  } catch (err) {
    fail(res, err);
  }
});

adminProductsRouter.delete("/categories/:id", async (req, res) => {
  try {
    await adminDeleteCategory(req.params.id);
    purgeCatalog();
    res.json({ ok: true });
  } catch (err) {
    fail(res, err);
  }
});
