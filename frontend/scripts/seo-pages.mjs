// After the build: write one index.html per public page with that page's own title, description and
// link-preview tags already in it, so crawlers and chat apps that don't run scripts still read them.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, "..", "dist");
const seo = JSON.parse(await readFile(path.join(root, "..", "src", "site", "seo.json"), "utf8"));
const base = await readFile(path.join(dist, "index.html"), "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const brand = seo.site.name;

function page(route, entry) {
  const title = route === "/" ? entry.title : `${entry.title} · ${brand}`;
  const url = seo.site.origin + route;
  const image = seo.site.origin + seo.site.image;
  let html = base;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(entry.description)}$2`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  const set = (attr, key, value) => {
    const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
    html = html.replace(re, `$1${esc(value)}$2`);
  };
  set("property", "og:title", title);
  set("property", "og:description", entry.description);
  set("property", "og:url", url);
  set("property", "og:image", image);
  set("name", "twitter:title", title);
  set("name", "twitter:description", entry.description);
  set("name", "twitter:image", image);
  return html;
}

let count = 0;
for (const [route, entry] of Object.entries(seo.pages)) {
  if (route === "/") continue; // index.html already carries the home page's tags
  const dir = path.join(dist, route);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), page(route, entry));
  count++;
}
console.log(`seo: wrote ${count} page shells`);
