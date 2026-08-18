/** @see frontend/src/lib/categoryDedup.ts — keep in sync */
const HIDDEN_CATEGORY_IDS = new Set([
  92, 88, 159,
  172, 165, 170, 161, 160, 164, 173, 162, 169, 163, 167,
  89, 49,
  147, 148, 149, 150, 153, 243,
]);

export function dedupeCategories<T extends { id: number }>(categories: T[]): T[] {
  return categories.filter((c) => !HIDDEN_CATEGORY_IDS.has(c.id));
}
