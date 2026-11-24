import { useSiteConfig } from "./siteConfig";

/**
 * Every picture on the site that the team can replace from the admin (the "תמונות" tab).
 * `fallback` is the picture the site shipped with; it shows until a replacement is uploaded.
 * `width` is the widest the picture is ever shown (in pixels, doubled for sharp phone screens), so uploads are shrunk to it.
 */
export type ImageSlot = { key: string; label: string; group: string; fallback: string; width: number; shape: "wide" | "tall" | "square" | "strip"; /** Slots with the same `set` are shown together in the admin (a person's photo and signature), and `part` names each one. */ set?: string; part?: string };

const HERO = "קרוסלת עמוד הבית ושגרירים";
const hero = (key: string, who: string): ImageSlot[] => [
  { key: `hero-${key}`, label: `${who} · תמונה`, group: HERO, fallback: `/images/site/${key}.jpg`, width: 1600, shape: "tall", set: who, part: "תמונה" },
  { key: `hero-${key}-sig`, label: `${who} · חתימה`, group: HERO, fallback: `/images/site/${key}_sig.jpg`, width: 600, shape: "strip", set: who, part: "חתימה" },
];

const TILES = "אריחי הקטגוריות בעמוד הבית";
const JOIN = "עמוד ההצטרפות";
const OTHER = "עמודים נוספים";

export const IMAGE_SLOTS: ImageSlot[] = [
  ...hero("omer", "עומר אדם"),
  ...hero("static", "סטטיק"),
  ...hero("q1", "אתי אפינגר"),
  ...hero("q2", "לירן דנינו"),
  ...hero("q3", "עדן בחרי"),
  ...hero("q4", "עידן דה כהן"),
  ...hero("q5", "שחר חיון"),
  { key: "tile-bracelets", label: "צמידים", group: TILES, fallback: "/images/site/cat_bracelets.jpg", width: 700, shape: "square" },
  { key: "tile-shirts", label: "חולצות", group: TILES, fallback: "/images/site/cat_shirts.jpg", width: 700, shape: "square" },
  { key: "tile-caps", label: "כובעים", group: TILES, fallback: "/images/site/cat_caps.jpg", width: 700, shape: "square" },
  { key: "tile-sport", label: "ספורט", group: TILES, fallback: "/images/site/cat_sport.jpg", width: 700, shape: "square" },
  { key: "tile-mixed", label: "מיוחדים", group: TILES, fallback: "/images/site/cat_mixed.jpg", width: 700, shape: "square" },
  { key: "tile-mixed-wide", label: "מיוחדים · לטלפון (רחב)", group: TILES, fallback: "/images/site/cat_mixed_wide.jpg", width: 1000, shape: "wide" },
  { key: "join-bracelets", label: "לחלק צמידים בעצמכם", group: JOIN, fallback: "/images/fabric_bracelet/black_bracelet.jpeg", width: 900, shape: "wide" },
  { key: "join-school", label: "להביא את זה לבית הספר", group: JOIN, fallback: "/images/store_images/hands_heart_sign.jpg", width: 900, shape: "wide" },
  { key: "join-story", label: "לשתף את הסיפור שלכם", group: JOIN, fallback: "/images/fabric_bracelet/all_bracelet.jpeg", width: 900, shape: "wide" },
  { key: "join-contact", label: "צרו קשר", group: JOIN, fallback: "/images/site/contact.jpg", width: 900, shape: "wide" },
  { key: "founder", label: "דוד הלפרין, המייסד (אודות וסיפורים)", group: OTHER, fallback: "/images/site/founder.jpg", width: 900, shape: "tall" },
  { key: "activity-schools", label: "בתי ספר והרצאות (עמוד הפעילות)", group: OTHER, fallback: "/images/activity/schools.jpg", width: 1200, shape: "wide" },
];

const BY_KEY = new Map(IMAGE_SLOTS.map((s) => [s.key, s]));

/** The picture for a slot: the team's upload if there is one, otherwise the one the site shipped with. */
export function slotImage(images: Record<string, string> | undefined, key: string): string {
  return images?.[key] ?? BY_KEY.get(key)?.fallback ?? "";
}

/**
 * Looks up pictures by slot name. Returns an empty address until the site's settings have loaded, so the page never
 * downloads the shipped picture first and then switches to the uploaded one.
 */
export function useSlotImages(): (key: string) => string {
  const { config, ready } = useSiteConfig();
  return (key) => (ready ? slotImage(config.images, key) : "");
}
