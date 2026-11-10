import { Router } from "express";
import { env } from "../config/env.js";
import { clearProductIndex, refreshProductIndex, searchIndex, startProductIndex } from "../services/productIndex.js";
import { getProduct, listCategories, listProducts, listProductsByIds } from "../services/woocommerce.js";

export const catalogRouter = Router();

const FRESH_MS = 60_000;
const STALE_MS = 6 * 60 * 60_000;
const WARM_EVERY_MS = 50_000;
const MAX_ENTRIES = 500;

type Entry = { at: number; value: Promise<unknown> };
const cache = new Map<string, Entry>();

/**
 * Display data only: the live store takes 1-2s per request. A recent answer is served at once and
 * refreshed in the background. Cart and checkout never read from here, so they always see live prices.
 */
function remember(key: string, load: () => Promise<unknown>) {
  const hit = cache.get(key);
  const age = hit ? Date.now() - hit.at : Infinity;
  if (hit && age < FRESH_MS) return hit.value;
  if (hit && age < STALE_MS) {
    hit.at = Date.now();
    load()
      .then((value) => cache.set(key, { at: Date.now(), value: Promise.resolve(value) }))
      .catch((err) => console.error(err));
    return hit.value;
  }
  if (cache.size >= MAX_ENTRIES) cache.clear();
  const value = load();
  cache.set(key, { at: Date.now(), value });
  value.catch(() => cache.delete(key));
  return value;
}

const EDGE_CACHE = "public, max-age=30, s-maxage=60, stale-while-revalidate=600";

/** The shop's category tabs, as the storefront sends them: first page, default order. */
const SHOP_CATEGORIES = ["", "20,166,282", "35,135", "146,19", "26", "48,29,31,18"];
/** Sorts a visitor can pick on the full shop. */
const SHOP_SORTS = ["orderby=date&order=desc", "orderby=popularity", "orderby=price&order=asc", "orderby=price&order=desc"];

function shopQuery(parts: Record<string, string>) {
  return new URLSearchParams(parts).toString();
}

/** Queries the storefront asks for on first paint or a click; kept hot so no visitor waits on the live store. */
const WARM: Array<[string, () => Promise<unknown>]> = [
  ["categories", () => listCategories()],
  ...[
    "per_page=8&orderby=popularity",
    "per_page=8&orderby=date&order=desc",
    "per_page=24",
    "per_page=12&page=2",
    "per_page=12&page=3",
    ...SHOP_CATEGORIES.map((category) => shopQuery({ ...(category ? { category } : {}), per_page: "12", page: "1" })),
    ...SHOP_SORTS.map((sort) => `${sort}&per_page=12&page=1`),
  ].map((q): [string, () => Promise<unknown>] => [`list:${q}`, () => listProducts(new URLSearchParams(q))]),
];

function warmCache() {
  for (const [key, load] of WARM) {
    load()
      .then((value) => cache.set(key, { at: Date.now(), value: Promise.resolve(value) }))
      .catch((err) => console.error("catalog warm failed", key, err.message));
  }
}

export function startCatalogWarmup() {
  warmCache();
  setInterval(warmCache, WARM_EVERY_MS).unref();
  startProductIndex();
}

/** WooCommerce webhook (product created/updated/deleted): drop cached answers so edits show up at once. */
catalogRouter.post("/purge", (req, res) => {
  if (!env.catalogPurgeSecret || req.query.secret !== env.catalogPurgeSecret) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  cache.clear();
  clearProductIndex();
  warmCache();
  void refreshProductIndex();
  res.json({ ok: true });
});

catalogRouter.use((req, res, next) => {
  if (req.method === "GET") res.set("Cache-Control", EDGE_CACHE);
  next();
});

catalogRouter.get("/products", async (req, res) => {
  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string") params.set(key, value);
    }
    const include = params.get("include");
    if (include) {
      res.json(await remember(`ids:${include}`, () => listProductsByIds(include.split(","))));
      return;
    }
    // Typed searches are answered from the product list kept in memory, so they do not wait on the live store.
    const found = params.has("search") ? searchIndex(params) : null;
    if (found) {
      res.json(found);
      return;
    }
    const data = await remember(`list:${params.toString()}`, () => listProducts(params));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "catalog_unavailable" });
  }
});

catalogRouter.get("/products/:id", async (req, res) => {
  try {
    const product = await remember(`product:${req.params.id}`, () => getProduct(req.params.id));
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "product_not_found" });
  }
});

catalogRouter.get("/categories", async (_req, res) => {
  try {
    res.json(await remember("categories", () => listCategories()));
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "categories_unavailable" });
  }
});
