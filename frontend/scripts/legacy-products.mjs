// Rebuilds src/site/legacyProducts.json (old store product address -> product id) from the product snapshot.
// Run it after refreshing ../products/all-products.json: node scripts/legacy-products.mjs
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const products = JSON.parse(await readFile(path.join(root, "..", "..", "products", "all-products.json"), "utf8"));
const map = {};
for (const p of products) {
  const slug = decodeURIComponent(new URL(p.permalink).pathname.split("/product/")[1].replace(/\/$/, ""));
  map[slug] = p.id;
}
await writeFile(path.join(root, "..", "src", "site", "legacyProducts.json"), JSON.stringify(map));
console.log(`legacy products: ${Object.keys(map).length}`);
