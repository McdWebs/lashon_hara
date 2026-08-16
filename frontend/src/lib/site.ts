export const SITE = {
  name: "לשון הרע לא מדבר אליי",
  logoSrc: "/lh-logo.png",
  wcOrigin: import.meta.env.VITE_WC_STORE_ORIGIN ?? "https://lashonhara.co.il",
  apiUrl: import.meta.env.VITE_API_URL ?? "",
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER ?? "972543644512",
  supportHours: "09:00–18:00, שישה ימים בשבוע",
  facebook: "https://www.facebook.com/Lashon.Hara.Lo.Medaber.Elai/",
  instagram: "https://www.instagram.com/lashonhara/",
} as const;

export const legacyCart = `${SITE.wcOrigin}/cart/`;
export const legacyCheckout = `${SITE.wcOrigin}/checkout/`;
export const legacyAccount = `${SITE.wcOrigin}/my-account/`;

export function waLink(text?: string) {
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${SITE.whatsapp}${q}`;
}

export function formatIls(minor: string | number, minorUnit = 2) {
  const n = Number(minor) / 10 ** minorUnit;
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(n);
}
