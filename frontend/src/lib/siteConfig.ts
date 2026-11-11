import { useQuery } from "@tanstack/react-query";
import type { Program } from "../site/about";
import { PROGRAMS as PROGRAMS_HE } from "../site/about";
import { PROGRAMS as PROGRAMS_EN } from "../site/about.en";

/* ---------- shapes ---------- */

export type ShopCollection = { key: string; he: string; en: string; categories: number[]; hidden?: boolean };
export type PriceRange = { min?: number; max?: number };
export type ShopConfig = { collections: ShopCollection[]; sorts: string[]; prices: PriceRange[] };
export type CalendarConfig = { closedWeekdays: number[]; monthsAhead: number; takenDates: string[] };
export type LectureConfig = { id: string; he: Program; en?: Program };

/** What the admin saves for the calendar, which also holds the link and the dates blocked by hand. */
export type CalendarSettings = { icsUrl: string; closedWeekdays: number[]; monthsAhead: number; blockedDates: string[] };

/** Switches the team can turn on and off in the admin. */
export type Flags = { english: boolean; shopMission: boolean; newSearch: boolean; aboutVideo: boolean };

export const DEFAULT_FLAGS: Flags = {
  // The site starts in Hebrew only; English is switched on from the admin when it is ready.
  english: false,
  // The line under the shop title about handing products out for free to schools stays hidden until it is switched on.
  shopMission: false,
  // The upgraded shop search (suggestions, and a modal on computers). Off brings back the plain search.
  newSearch: true,
  // The founder's photo on the About page gets a play button that opens the video. Off shows the plain photo.
  aboutVideo: false,
};

export type SiteConfig = {
  flags: Flags;
  counter: number | null;
  calendar: CalendarConfig;
  shop: ShopConfig;
  lectures: LectureConfig[];
};

/* ---------- built-in defaults: what the site shows until the team changes it ---------- */

/** The shop's sorts. The team picks which to show and in what order; the queries are fixed. */
export const SORT_CATALOG: Array<{ key: string; he: string; en: string; query: Record<string, string> }> = [
  { key: "", he: "ברירת מחדל", en: "Default", query: {} },
  { key: "new", he: "החדשים ביותר", en: "Newest", query: { orderby: "date", order: "desc" } },
  { key: "best", he: "הנמכרים ביותר", en: "Best sellers", query: { orderby: "popularity" } },
  { key: "price-asc", he: "מחיר: מהנמוך לגבוה", en: "Price: low to high", query: { orderby: "price", order: "asc" } },
  { key: "price-desc", he: "מחיר: מהגבוה לנמוך", en: "Price: high to low", query: { orderby: "price", order: "desc" } },
  { key: "title", he: "לפי שם (א–ת)", en: "By name (A–Z)", query: { orderby: "title", order: "asc" } },
];

export const DEFAULT_SHOP: ShopConfig = {
  collections: [
    { key: "all", he: "הכול", en: "All", categories: [] },
    { key: "bracelets", he: "צמידים", en: "Bracelets", categories: [20, 166, 282] },
    { key: "metal-fabric", he: "צמידי מתכת ובד", en: "Metal and fabric bracelets", categories: [35, 135] },
    { key: "clothing", he: "לבוש וספורט", en: "Clothing and sport", categories: [146, 19] },
    { key: "kids", he: "ילדים ובית ספר", en: "Kids and school", categories: [26] },
    { key: "accessories", he: "אביזרים", en: "Accessories", categories: [48, 29, 31, 18] },
    // Reached from the home page tiles only.
    { key: "sport", he: "ספורט", en: "Sport", categories: [19], hidden: true },
    { key: "special", he: "מיוחדים", en: "Special", categories: [23], hidden: true },
  ],
  sorts: SORT_CATALOG.map((s) => s.key),
  prices: [{ max: 50 }, { min: 50, max: 100 }, { min: 100, max: 200 }, { min: 200 }],
};

export const DEFAULT_CALENDAR: CalendarConfig = {
  // Friday and Saturday.
  closedWeekdays: [5, 6],
  monthsAhead: 3,
  takenDates: [],
};

export const DEFAULT_COUNTER = 2885026;

export const DEFAULT_LECTURES: LectureConfig[] = PROGRAMS_HE.map((he, i) => ({ id: `default-${i}`, he, en: PROGRAMS_EN[i] }));

export const DEFAULTS: SiteConfig = {
  flags: DEFAULT_FLAGS,
  counter: DEFAULT_COUNTER,
  calendar: DEFAULT_CALENDAR,
  shop: DEFAULT_SHOP,
  lectures: DEFAULT_LECTURES,
};

/* ---------- price ranges ---------- */

/** The same key the address bar has always used: 0-50, 50-100, 100-200, 200. */
export function priceKey(p: PriceRange) {
  if (p.min === undefined) return `0-${p.max}`;
  if (p.max === undefined) return String(p.min);
  return `${p.min}-${p.max}`;
}

/** The store takes prices in agorot. */
export function priceQuery(p: PriceRange): Record<string, string> {
  return {
    ...(p.min !== undefined ? { min_price: String(p.min * 100 + 1) } : {}),
    ...(p.max !== undefined ? { max_price: String(p.max * 100) } : {}),
  };
}

export function priceLabel(p: PriceRange, lang: "he" | "en") {
  if (p.min === undefined) return lang === "en" ? `Up to ₪${p.max}` : `עד ₪${p.max}`;
  if (p.max === undefined) return lang === "en" ? `Over ₪${p.min}` : `מעל ₪${p.min}`;
  return `₪${p.min} – ₪${p.max}`;
}

/* ---------- loading ---------- */

type Stored = Partial<{ flags: Partial<Flags>; counter: number | null; calendar: CalendarConfig; shop: ShopConfig; lectures: LectureConfig[] }>;

async function fetchStored(): Promise<Stored> {
  // Ask the server each time whether the answer changed (cheap when it did not), so an admin change is not hidden by the browser's own copy.
  const early = (window as unknown as { __early?: { config?: Promise<Response> } }).__early;
  const taken = early?.config;
  if (early) early.config = undefined;
  const res = await (taken ?? fetch("/api/site-config", { cache: "no-cache" }));
  if (!res.ok) throw new Error("config_unavailable");
  return (await res.json()) as Stored;
}

function merge(stored: Stored | undefined): SiteConfig {
  if (!stored) return DEFAULTS;
  return {
    flags: { ...DEFAULT_FLAGS, ...stored.flags },
    counter: stored.counter !== undefined ? stored.counter : DEFAULTS.counter,
    calendar: stored.calendar ?? DEFAULTS.calendar,
    shop: stored.shop ?? DEFAULTS.shop,
    lectures: stored.lectures ?? DEFAULTS.lectures,
  };
}

/**
 * The editable parts of the site. `ready` turns true once the answer is in (or has failed), so a page can hold back
 * the parts that depend on it instead of showing the defaults for a moment and then switching.
 */
export function useSiteConfig(): { config: SiteConfig; ready: boolean } {
  const query = useQuery({ queryKey: ["site-config"], queryFn: fetchStored, staleTime: 10_000, retry: 1 });
  return { config: merge(query.data), ready: !query.isLoading };
}
