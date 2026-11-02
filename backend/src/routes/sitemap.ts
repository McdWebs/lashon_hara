import { Router } from "express";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { Setting } from "../models/Setting.js";
import { listProducts } from "../services/woocommerce.js";

export const sitemapRouter = Router();

const PAGES = ["/", "/who-we-are", "/activity", "/activity/idf", "/activity/ambassadors", "/shop", "/join", "/terms", "/accessibility"];

async function englishOn() {
  if (mongoose.connection.readyState !== 1) return false;
  const doc = await Setting.findOne({ key: "flags" }).lean();
  return Boolean((doc?.value as { english?: boolean } | undefined)?.english);
}

/** Product pages, so they can be found by search. A store hiccup just leaves them out this time. */
async function productPaths(): Promise<string[]> {
  try {
    const { items } = await listProducts(new URLSearchParams({ per_page: "100" }));
    return (items as Array<{ id?: number }>).flatMap((p) => (p.id ? [`/shop/product/${p.id}`] : []));
  } catch {
    return [];
  }
}

/** The sitemap lists the English pages only while the English version is switched on. */
sitemapRouter.get("/", async (_req, res) => {
  const english = await englishOn();
  const base = env.siteUrl;
  const url = (path: string, lang: "he" | "en") => base + (lang === "he" ? path : path === "/" ? "/en" : `/en${path}`);

  const paths = [...PAGES, ...(await productPaths())];
  const entries = paths.flatMap((path) =>
    (english ? (["he", "en"] as const) : (["he"] as const)).map((lang) => {
      const alternates = english
        ? [
            `<xhtml:link rel="alternate" hreflang="he" href="${url(path, "he")}"/>`,
            `<xhtml:link rel="alternate" hreflang="en" href="${url(path, "en")}"/>`,
            `<xhtml:link rel="alternate" hreflang="x-default" href="${url(path, "he")}"/>`,
          ].join("\n    ")
        : "";
      return `  <url>\n    <loc>${url(path, lang)}</loc>${alternates ? `\n    ${alternates}` : ""}\n  </url>`;
    }),
  );

  res.set("Content-Type", "application/xml; charset=utf-8");
  res.set("Cache-Control", "public, max-age=300, s-maxage=600");
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`,
  );
});
