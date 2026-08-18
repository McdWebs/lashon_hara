type Category = {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
};

/**
 * WooCommerce has duplicate and nested categories (parent + subcategory with
 * overlapping products). Hide redundant entries from store filter chips.
 */
const HIDDEN_CATEGORY_IDS = new Set([
  // Top-level duplicates of subcategories under צמידי סיליקון (20)
  92, 88, 159,
  // Subcategories of צמידי סיליקון — use parent id=20 instead
  172, 165, 170, 161, 160, 164, 173, 162, 169, 163, 167,
  // Subcategories of טבעות — use parent id=48 instead
  89, 49,
  // Subcategories of חולצות ופריטי לבוש — use parent id=146 instead
  147, 148, 149, 150, 153, 243,
]);

export function dedupeCategories<T extends Category>(categories: T[]): T[] {
  return categories.filter((c) => !HIDDEN_CATEGORY_IDS.has(c.id));
}
