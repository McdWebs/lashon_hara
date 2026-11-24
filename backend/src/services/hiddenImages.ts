import mongoose from "mongoose";
import { Setting } from "../models/Setting.js";

/**
 * Photos the team hid on a product: they stay in the product (and in the store), but the site does not show them,
 * neither in the gallery nor inside the product's text. Kept here, because the store has no such switch.
 * Stored as product id to the hidden photos' ids and file names (an older version stored only the ids).
 */
const KEY = "hiddenImages";
type Entry = { ids: number[]; keys: string[] };
type Store = Record<string, Entry | number[]>;
export type Hidden = { ids: Set<number>; keys: string[] };

let cache: { at: number; data: Store } | null = null;
const TTL_MS = 30_000;

export async function hiddenImages(): Promise<Store> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  let data: Store = {};
  if (mongoose.connection.readyState === 1) {
    const doc = await Setting.findOne({ key: KEY }).lean();
    data = (doc?.value as Store | undefined) ?? {};
  }
  cache = { at: Date.now(), data };
  return data;
}

/** A photo's file name without its size suffix, so the full photo and its resized copies match (name-300x300.jpg is name.jpg). */
export function imageKey(src: string): string {
  let name = src.split("?")[0].split("/").pop() ?? "";
  try {
    name = decodeURIComponent(name);
  } catch {
    /* keep the raw name */
  }
  return name.replace(/\.[a-z0-9]+$/i, "").replace(/-(scaled|\d+x\d+)$/i, "").toLowerCase();
}

export function hiddenSet(store: Store, productId: unknown): Hidden {
  const entry = store[String(productId)];
  if (!entry) return { ids: new Set(), keys: [] };
  return Array.isArray(entry) ? { ids: new Set(entry), keys: [] } : { ids: new Set(entry.ids), keys: entry.keys };
}

type Shaped = { images?: Array<{ id?: number }>; description?: string; short_description?: string };

/** Takes a product's hidden photos out of the product as the store returned it: the gallery, and any picture of them inside the texts. */
export function withoutHidden<T extends Shaped>(product: T, hidden: Hidden): T {
  if (hidden.ids.size === 0 && hidden.keys.length === 0) return product;
  const stripText = (html: string | undefined) =>
    html === undefined || hidden.keys.length === 0
      ? html
      : html
          .replace(/<img\b[^>]*>/gi, (tag) => (hidden.keys.some((k) => tag.toLowerCase().includes(k)) ? "" : tag))
          // a link or figure that was only wrapping the removed picture
          .replace(/<a\b[^>]*>\s*<\/a>/gi, "")
          .replace(/<figure\b[^>]*>\s*<\/figure>/gi, "");
  return {
    ...product,
    ...(product.images ? { images: product.images.filter((i) => !(i.id !== undefined && hidden.ids.has(i.id))) } : {}),
    ...(product.description !== undefined ? { description: stripText(product.description) } : {}),
    ...(product.short_description !== undefined ? { short_description: stripText(product.short_description) } : {}),
  };
}

export async function saveHiddenImages(productId: number, photos: Array<{ id: number; src: string }>) {
  if (mongoose.connection.readyState !== 1) return;
  const store = { ...(await hiddenImages()) };
  if (photos.length > 0) store[String(productId)] = { ids: photos.map((p) => p.id), keys: photos.map((p) => imageKey(p.src)).filter(Boolean) };
  else delete store[String(productId)];
  await Setting.updateOne({ key: KEY }, { value: store }, { upsert: true });
  cache = { at: Date.now(), data: store };
}
