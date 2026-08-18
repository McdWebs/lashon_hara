export const STORE_MAX_WIDTH = 1320;

export const STORE_HERO_IMAGE = "/images/metal_bracelet/3_color_bracelets.jpeg";
export const STORE_FEATURED_IMAGE = "/images/fabric_bracelet/all_bracelet.jpeg";

export type StoreCategoryTileVariant = "overlay" | "hero" | "inset" | "band";

export type StoreCategoryTile = {
  category: string;
  variant: StoreCategoryTileVariant;
  image: string;
  hoverImage?: string;
  objectPosition?: string;
  accent: string;
  label: { he: string; en: string };
  note: { he: string; en: string };
};

export const STORE_CATEGORY_TILES: readonly StoreCategoryTile[] = [
  {
    category: "146",
    variant: "overlay",
    image: "/images/shirts/shirt_preview.jpg",
    hoverImage: "/images/shirts/black_shirt.jpg",
    objectPosition: "center 20%",
    accent: "#1a1a1a",
    label: { he: "לבוש", en: "Apparel" },
    note: { he: "המסר, כחלק מהיום־יום", en: "The message, worn every day" },
  },
  {
    category: "20",
    variant: "hero",
    image: "/images/metal_bracelet/gold_bracelet.jpeg",
    hoverImage: "/images/metal_bracelet/silver_bracelet.png",
    objectPosition: "center 55%",
    accent: "#b8922a",
    label: { he: "צמידים", en: "Bracelets" },
    note: { he: "הפריט שממנו הכול התחיל", en: "Where the movement began" },
  },
  {
    category: "48",
    variant: "inset",
    image: "/images/04_Rings/rose-gold-pair-1.jpeg",
    hoverImage: "/images/04_Rings/silver-pair-1.jpeg",
    objectPosition: "center",
    accent: "#9a6b5c",
    label: { he: "טבעות", en: "Rings" },
    note: { he: "פרטים קטנים עם נוכחות", en: "Small details with presence" },
  },
  {
    category: "23",
    variant: "band",
    image: "/images/fabric_bracelet/blue_white_bracelet.jpeg",
    hoverImage: "/images/fabric_bracelet/pink_bracelet.jpeg",
    objectPosition: "center",
    accent: "#123e3e",
    label: { he: "מתנות", en: "Gifts" },
    note: { he: "לתת למילים מקום", en: "Give words a place" },
  },
] as const;

export const STORE_EDITORIAL_IMAGES = [
  {
    src: "/images/metal_bracelet/black_bracelet.jpeg",
    alt: { he: "צמיד מתכת שחור עם המסר", en: "Black metal bracelet with the message" },
  },
  {
    src: "/images/metal_bracelet/gold_color_bracelet.png",
    alt: { he: "צמיד מתכת בגוון זהב עם חריטה צבעונית", en: "Gold-tone metal bracelet with colored engraving" },
  },
  {
    src: "/images/metal_bracelet/thin_gold_bracelet.png",
    alt: { he: "צמיד מתכת זהב דק עם חריטה", en: "Thin engraved gold-tone bracelet" },
  },
  {
    src: "/images/metal_bracelet/silver_bracelet.png",
    alt: { he: "צמיד מתכת כסוף עם המסר", en: "Silver metal bracelet with the message" },
  },
] as const;

export const STORE_HOMEPAGE_PRODUCT_IMAGES = [
  {
    productId: 42537,
    src: "/images/fabric_bracelet/black_bracelet.jpeg",
    hoverSrc: "/images/fabric_bracelet/black_barcelet_bg.jpeg",
    alt: { he: "צמיד בד שחור", en: "Black fabric bracelet" },
  },
  {
    productId: 6081,
    src: "/images/fabric_bracelet/pink_bracelet.jpeg",
    hoverSrc: "/images/fabric_bracelet/blue_white_bracelet.jpeg",
    alt: { he: "צמיד בד ורוד", en: "Pink fabric bracelet" },
  },
  {
    productId: 740,
    src: "/images/metal_bracelet/gold_bracelet.jpeg",
    hoverSrc: "/images/metal_bracelet/gold_color_bracelet.png",
    alt: { he: "צמיד מתכת זהב", en: "Gold-tone metal bracelet" },
  },
  {
    productId: 713,
    src: "/images/metal_bracelet/black_bracelet.jpeg",
    hoverSrc: "/images/metal_bracelet/silver_bracelet.png",
    alt: { he: "צמיד מתכת שחור", en: "Black metal bracelet" },
  },
  {
    productId: 6080,
    src: "/images/fabric_bracelet/beige_bracelet.jpeg",
    hoverSrc: "/images/fabric_bracelet/beige_bracelet_bg.jpg",
    alt: { he: "צמיד בד בז׳", en: "Beige fabric bracelet" },
  },
  {
    productId: 48402,
    src: "/images/metal_bracelet/thin_gold_bracelet.png",
    hoverSrc: "/images/metal_bracelet/gold_bracelet.jpeg",
    alt: { he: "צמיד מתכת זהב דק", en: "Thin gold-tone bracelet" },
  },
  {
    productId: 6065,
    src: "/images/fabric_bracelet/blue_white_bracelet.jpeg",
    hoverSrc: "/images/fabric_bracelet/blue_white_bracelet_bg.jpg",
    alt: { he: "צמיד בד כחול-לבן", en: "Blue-white fabric bracelet" },
  },
  {
    productId: 584,
    src: "/images/metal_bracelet/thin_silver_metal_bracelet.jpeg",
    hoverSrc: "/images/metal_bracelet/black_bracelet.jpeg",
    alt: { he: "צמיד מתכת כסף דק", en: "Thin silver bracelet" },
  },
] as const;

export const STORE_HOMEPAGE_PRODUCT_IDS = STORE_HOMEPAGE_PRODUCT_IMAGES.map((item) => item.productId);

export const STORE_COPY = {
  he: {
    announcement: "משלוח חינם בהזמנות מעל ₪250",
    heroEyebrow: "המהדורה החדשה",
    heroTitle: "מילים שבוחרים ללבוש.",
    heroBody: "פריטים שנכנסים לחיים, ומזכירים בכל יום איך בחרנו לדבר.",
    heroCta: "לקולקציה",
    categoriesEyebrow: "לבחור לפי",
    categoriesTitle: "מה לובשים היום?",
    allCategories: "לכל המוצרים",
    featuredEyebrow: "הבחירה שלנו",
    featuredTitle: "הדברים שנשארים איתנו.",
    featuredBody:
      "מהצמיד הראשון ועד הפריטים החדשים — קולקציה שנועדה לחיות איתכם, לא לחכות בארון.",
    shopEdit: "לצפייה במהדורה",
    popularEyebrow: "הכי אהובים",
    popularTitle: "הפריטים שחוזרים אליהם.",
    viewAll: "לכל החנות",
    storyEyebrow: "יותר ממוצר",
    storyTitle: "משפט אחד.\nתנועה שלמה.",
    storyBody:
      "מאז 2007 המשפט ״לשון הרע לא מדבר אליי״ עובר מאדם לאדם. כל פריט הוא דרך שקטה לקחת בו חלק.",
    storyCta: "למה זה חשוב",
    socialEyebrow: "מהחיים עצמם",
    socialTitle: "לבשו. צילמו. העבירו הלאה.",
    socialCta: "לעקוב באינסטגרם",
    trustShipping: "משלוח מהיר",
    trustShippingBody: "לכל הארץ",
    trustReturns: "שירות אישי",
    trustReturnsBody: "אנחנו כאן לכל שאלה",
    trustPurpose: "קנייה עם משמעות",
    trustPurposeBody: "כל פריט נושא את המסר",
    catalogTitle: "כל המוצרים",
    catalogKicker: "החנות",
    clearFilter: "הצגת הכול",
    search: "חיפוש",
    searchPlaceholder: "מה תרצו למצוא?",
    searchHint: "נסו צמיד, קפוצ׳ון או מתנה",
    noResults: "לא מצאנו פריטים מתאימים.",
    menu: "תפריט",
    why: "הסיפור שלנו",
    cart: "סל",
    addToCart: "הוספה לסל",
    addedToCart: "נוסף לסל",
  },
  en: {
    announcement: "Free shipping on orders over ₪250",
    heroEyebrow: "The new edition",
    heroTitle: "Words worth wearing.",
    heroBody: "Objects that become part of daily life—and a reminder of how we choose to speak.",
    heroCta: "Shop the collection",
    categoriesEyebrow: "Shop by",
    categoriesTitle: "What are you wearing today?",
    allCategories: "All products",
    featuredEyebrow: "Our edit",
    featuredTitle: "The pieces that stay with us.",
    featuredBody:
      "From the first bracelet to the newest pieces—a collection made to live with you, not wait in a wardrobe.",
    shopEdit: "Shop the edit",
    popularEyebrow: "Most loved",
    popularTitle: "The pieces people return to.",
    viewAll: "Shop all",
    storyEyebrow: "More than a product",
    storyTitle: "One sentence.\nA whole movement.",
    storyBody:
      "Since 2007, “Lashon hara doesn't speak to me” has passed from person to person. Every piece is a quiet way to take part.",
    storyCta: "Why it matters",
    socialEyebrow: "Out in the world",
    socialTitle: "Wear it. Share it. Pass it on.",
    socialCta: "Follow on Instagram",
    trustShipping: "Fast delivery",
    trustShippingBody: "Across Israel",
    trustReturns: "Personal service",
    trustReturnsBody: "Here for every question",
    trustPurpose: "A meaningful purchase",
    trustPurposeBody: "Every piece carries the message",
    catalogTitle: "All products",
    catalogKicker: "The shop",
    clearFilter: "Show everything",
    search: "Search",
    searchPlaceholder: "What are you looking for?",
    searchHint: "Try bracelet, hoodie, or gift",
    noResults: "We couldn't find matching products.",
    menu: "Menu",
    why: "Our story",
    cart: "Cart",
    addToCart: "Add to cart",
    addedToCart: "Added",
  },
} as const;
