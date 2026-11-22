import { listProducts } from "./woocommerce.js";

type Item = Awaited<ReturnType<typeof listProducts>>["items"][number];
type Page = { items: Item[]; total: number; totalPages: number };

const REFRESH_MS = 5 * 60_000;
let index: { at: number; items: Item[]; haystacks: string[] } | null = null;
let loading: Promise<void> | null = null;

/** Params the in-memory search understands; anything else goes to the live store. */
const SUPPORTED = new Set(["search", "per_page", "page", "category", "orderby", "order", "min_price", "max_price"]);

const fold = (s: string) => s.toLocaleLowerCase("he").replace(/\s+/g, " ").trim();

export async function refreshProductIndex() {
  if (loading) return loading;
  loading = (async () => {
    const all: Item[] = [];
    for (let page = 1; page <= 20; page += 1) {
      const res = await listProducts(new URLSearchParams({ per_page: "100", page: String(page), orderby: "date", order: "desc" }));
      all.push(...res.items);
      if (page >= res.totalPages) break;
    }
    index = {
      at: Date.now(),
      items: all,
      haystacks: all.map((p) => fold([p.name, ...((p.categories as Array<{ name: string }>) ?? []).map((c) => c.name)].join(" "))),
    };
  })()
    .catch((err) => console.error("product index failed", err.message))
    .finally(() => {
      loading = null;
    });
  return loading;
}

/** Marks the list out of date (searches then go to the live store) but keeps it, so the shop's manual order still has products to work with. */
export function clearProductIndex() {
  if (index) index.at = 0;
}

const idsOf = (param: string | null) => (param ?? "").split(",").filter(Boolean).map(Number);

/** Products the team has not placed yet come first (newest first, as in the list), then the placed ones in their order. */
export function applyOrder<T extends { id: unknown }>(items: T[], order: number[]): T[] {
  const place = new Map(order.map((id, i) => [id, i]));
  const unplaced = items.filter((p) => !place.has(Number(p.id)));
  const placed = items.filter((p) => place.has(Number(p.id))).sort((a, b) => place.get(Number(a.id))! - place.get(Number(b.id))!);
  return [...unplaced, ...placed];
}

/** Every shop product in a tab's categories (all of them when none are given), newest first, with the team's order applied. */
export async function orderedItems(categories: number[], order: number[], min?: number, max?: number): Promise<Item[] | null> {
  if (!index) await refreshProductIndex();
  if (!index) return null;
  const found = index.items.filter((p) => {
    if (categories.length && !(p.categories as Array<{ id: number }>).some((c) => categories.includes(c.id))) return false;
    const price = Number((p.prices as { price: string }).price);
    return !(min !== undefined && price < min) && !(max !== undefined && price > max);
  });
  return applyOrder(found, order);
}

/** One page of a tab in the team's order, as the shop asks for it. Null when the product list is not available. */
export async function orderedPage(params: URLSearchParams, order: number[]): Promise<Page | null> {
  const items = await orderedItems(
    idsOf(params.get("category")),
    order,
    params.has("min_price") ? Number(params.get("min_price")) : undefined,
    params.has("max_price") ? Number(params.get("max_price")) : undefined,
  );
  if (!items) return null;
  const perPage = Math.min(100, Math.max(1, Number(params.get("per_page")) || 24));
  const page = Math.max(1, Number(params.get("page")) || 1);
  return { items: items.slice((page - 1) * perPage, page * perPage), total: items.length, totalPages: Math.max(1, Math.ceil(items.length / perPage)) };
}

/** Answers a shop search from memory, or returns null when it should go to the live store instead. */
export function searchIndex(params: URLSearchParams): Page | null {
  if (!index || Date.now() - index.at > 3 * REFRESH_MS) return null;
  for (const key of params.keys()) if (!SUPPORTED.has(key)) return null;
  const orderby = params.get("orderby") ?? "";
  if (orderby && !["date", "price", "title"].includes(orderby)) return null;
  const term = fold(params.get("search") ?? "");
  if (!term) return null;

  const words = term.split(" ");
  const categories = (params.get("category") ?? "").split(",").filter(Boolean).map(Number);
  const min = params.has("min_price") ? Number(params.get("min_price")) : undefined;
  const max = params.has("max_price") ? Number(params.get("max_price")) : undefined;

  let items = index.items.filter((p, i) => {
    if (!words.every((w) => index!.haystacks[i].includes(w))) return false;
    if (categories.length && !(p.categories as Array<{ id: number }>).some((c) => categories.includes(c.id))) return false;
    const price = Number((p.prices as { price: string }).price);
    if (min !== undefined && price < min) return false;
    if (max !== undefined && price > max) return false;
    return true;
  });

  const dir = params.get("order") === "asc" ? 1 : -1;
  if (orderby === "price") items = [...items].sort((a, b) => dir * (Number((a.prices as { price: string }).price) - Number((b.prices as { price: string }).price)));
  else if (orderby === "title") items = [...items].sort((a, b) => dir * String(a.name).localeCompare(String(b.name), "he"));

  const perPage = Math.min(100, Math.max(1, Number(params.get("per_page")) || 24));
  const page = Math.max(1, Number(params.get("page")) || 1);
  return { items: items.slice((page - 1) * perPage, page * perPage), total: items.length, totalPages: Math.max(1, Math.ceil(items.length / perPage)) };
}

export function startProductIndex() {
  void refreshProductIndex();
  setInterval(() => void refreshProductIndex(), REFRESH_MS).unref();
}
