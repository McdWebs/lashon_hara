import seo from "../site/seo.json";

type Lang = "he" | "en";
export type SeoInput = {
  title: string;
  description?: string;
  /** Absolute or site-relative image for link previews. */
  image?: string;
  /** Keeps the page out of search results: carts, checkout, admin, missing pages. */
  noindex?: boolean;
  type?: "website" | "product";
  /** Structured data for this page; replaces the previous page's. */
  jsonLd?: Record<string, unknown>;
};

export const SITE_ORIGIN = seo.site.origin;
const ORIGIN = SITE_ORIGIN;

function stripLocale(pathname: string) {
  return pathname.replace(/^\/en(?=\/|$)/, "") || "/";
}

function absolute(url: string) {
  return /^https?:\/\//.test(url) ? url : ORIGIN + (url.startsWith("/") ? url : `/${url}`);
}

/** Title and description the site table holds for a path, in the page's language. */
export function seoFor(pathname: string, lang: Lang) {
  const entry = (seo.pages as Record<string, { title: string; description: string; en?: { title: string; description: string } }>)[stripLocale(pathname)];
  if (!entry) return null;
  return lang === "en" && entry.en ? entry.en : { title: entry.title, description: entry.description };
}

export function isPrivatePath(pathname: string) {
  const path = stripLocale(pathname);
  return seo.private.some((p) => path === p || path.startsWith(`${p}/`));
}

function setMeta(attr: "name" | "property", key: string, content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (content === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string | null, extra: Record<string, string> = {}) {
  const sel = `link[rel="${rel}"]${extra.hreflang ? `[hreflang="${extra.hreflang}"]` : ""}`;
  let el = document.head.querySelector<HTMLLinkElement>(sel);
  if (href === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    for (const [k, v] of Object.entries(extra)) el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  el.href = href;
}

const LD_ID = "page-jsonld";

/** Sets everything a search engine or a link preview reads, for the page now showing. */
export function applySeo(input: SeoInput, pathname: string, lang: Lang, englishOn: boolean) {
  const path = stripLocale(pathname);
  const isEn = lang === "en";
  const brand = isEn ? seo.site.nameEn : seo.site.name;
  const home = path === "/" ? seoFor(pathname, lang)?.title : undefined;
  const title = home ?? (input.title === brand ? brand : `${input.title} · ${brand}`);
  const description = input.description ?? seoFor(pathname, lang)?.description ?? "";
  const canonical = ORIGIN + (isEn ? (path === "/" ? "/en" : `/en${path}`) : path);
  const image = absolute(input.image ?? seo.site.image);
  const noindex = input.noindex ?? isPrivatePath(pathname);

  document.title = title;
  document.documentElement.lang = lang;
  setMeta("name", "description", description || null);
  setMeta("name", "robots", noindex ? "noindex, nofollow" : null);
  setLink("canonical", canonical);

  setMeta("property", "og:type", input.type ?? "website");
  setMeta("property", "og:site_name", brand);
  setMeta("property", "og:locale", isEn ? "en_US" : "he_IL");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description || null);
  setMeta("property", "og:url", canonical);
  setMeta("property", "og:image", image);
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description || null);
  setMeta("name", "twitter:image", image);

  // Language alternates only while the English version is switched on.
  const alt = (hreflang: string, href: string | null) => setLink("alternate", href, { hreflang });
  if (englishOn && !noindex) {
    alt("he", ORIGIN + path);
    alt("en", ORIGIN + (path === "/" ? "/en" : `/en${path}`));
    alt("x-default", ORIGIN + path);
  } else {
    alt("he", null);
    alt("en", null);
    alt("x-default", null);
  }

  document.getElementById(LD_ID)?.remove();
  if (input.jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = LD_ID;
    script.textContent = JSON.stringify(input.jsonLd);
    document.head.appendChild(script);
  }
}
