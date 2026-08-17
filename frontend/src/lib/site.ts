function resolveSiteUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL;
  const fromEnv = typeof raw === "string" ? raw.trim().replace(/\/$/, "") : "";
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    return fromEnv;
  }

  if (typeof window !== "undefined") {
    const { origin, protocol, hostname } = window.location;
    if (protocol.startsWith("http") && hostname) {
      return origin.replace(/\/$/, "");
    }
  }

  return "https://lashonhara.co.il";
}

export const SITE = {
  name: "לשון הרע לא מדבר אליי",
  logoSrc: "/lh-logo.png",
  get siteUrl() {
    return resolveSiteUrl();
  },
  apiUrl: import.meta.env.VITE_API_URL ?? "",
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER ?? "972543644512",
  supportHours: "09:00–18:00, שישה ימים בשבוע",
  facebook: "https://www.facebook.com/Lashon.Hara.Lo.Medaber.Elai/",
  instagram: "https://www.instagram.com/lashonhara/",
} as const;

/** Toggle unfinished or seasonal UI without deleting routes/components. */
export const FEATURES = {
  accountPage: false,
} as const;

export function joinCommitmentUrl() {
  return `${resolveSiteUrl()}/join/commitment`;
}

export const SHARE_INVITE =
  "גם אני חתמתי. גם את/ה?" as const;

/** WooCommerce product: חלוקת צמידים לבתי ספר */
export const SCHOOLS_PRODUCT_ID = 355;

export function waLink(text?: string) {
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${SITE.whatsapp}${q}`;
}

export function formatIls(minor: string | number, minorUnit = 2) {
  const n = Number(minor) / 10 ** minorUnit;
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(n);
}
