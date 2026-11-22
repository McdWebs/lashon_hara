import mongoose from "mongoose";
import { Setting } from "../models/Setting.js";

/** The shop's manual product order, per tab: { all: [id, id, ...], bracelets: [...] }. Read often, so kept briefly in memory. */
let cache: { at: number; orders: Record<string, number[]> } | null = null;

export async function getOrders(): Promise<Record<string, number[]>> {
  if (cache && Date.now() - cache.at < 30_000) return cache.orders;
  if (mongoose.connection.readyState !== 1) return cache?.orders ?? {};
  const doc = await Setting.findOne({ key: "productOrder" }).lean();
  const orders = (doc?.value as { orders?: Record<string, number[]> } | undefined)?.orders ?? {};
  cache = { at: Date.now(), orders };
  return orders;
}

export function forgetOrders() {
  cache = null;
}
