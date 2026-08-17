/** Decode HTML entities (e.g. &quot; → ") from WooCommerce / WordPress text fields. */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text;
  const doc = new DOMParser().parseFromString(text, "text/html");
  return doc.documentElement.textContent ?? text;
}
