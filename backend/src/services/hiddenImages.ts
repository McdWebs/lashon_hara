import mongoose from "mongoose";
import { Setting } from "../models/Setting.js";

/**
 * Photos the team hid on a product: they stay in the product (and in the store), but the site does not show them.
 * Kept here, because the store has no such switch. Stored as product id to the hidden photo ids.
 */
const KEY = "hiddenImages";
type Store = Record<string, number[]>;

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

export const hiddenSet = (store: Store, productId: unknown) => new Set(store[String(productId)] ?? []);

/** Drops the hidden photos from a product as the store returned it. */
export function withoutHidden<T extends { images?: Array<{ id?: number }> }>(product: T, hidden: Set<number>): T {
  if (hidden.size === 0 || !product.images) return product;
  return { ...product, images: product.images.filter((i) => !(i.id !== undefined && hidden.has(i.id))) };
}

export async function saveHiddenImages(productId: number, ids: number[]) {
  if (mongoose.connection.readyState !== 1) return;
  const store = { ...(await hiddenImages()) };
  if (ids.length > 0) store[String(productId)] = ids;
  else delete store[String(productId)];
  await Setting.updateOne({ key: KEY }, { value: store }, { upsert: true });
  cache = { at: Date.now(), data: store };
}
