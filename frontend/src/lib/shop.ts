import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import WatchOutlinedIcon from "@mui/icons-material/WatchOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import type { Lang } from "../i18n/locale";

type UseCaseBase = {
  icon: SvgIconComponent;
  label: Record<Lang, string>;
  body: Record<Lang, string>;
};

export type ShopUseCase =
  | (UseCaseBase & { kind: "category"; category: string })
  | (UseCaseBase & { kind: "link"; to: string })
  | (UseCaseBase & { kind: "anchor"; anchor: string });

export const SHOP_USE_CASES: ShopUseCase[] = [
  {
    kind: "category",
    category: "26",
    icon: SchoolOutlinedIcon,
    label: { he: "לבית הספר", en: "For school" },
    body: { he: "צמידים, מדבקות וחומרים לכיתה", en: "Bracelets, stickers, classroom materials" },
  },
  {
    kind: "category",
    category: "24",
    icon: BusinessCenterOutlinedIcon,
    label: { he: "למשרד", en: "For the office" },
    body: { he: "שלטים, מדבקות ופריטים לסביבת עבודה", en: "Signs, stickers, workplace items" },
  },
  {
    kind: "category",
    category: "20",
    icon: WatchOutlinedIcon,
    label: { he: "לעצמי", en: "For myself" },
    body: { he: "צמידים ופריטים ללבוש את המשפט", en: "Bracelets and wearables with the slogan" },
  },
  {
    kind: "category",
    category: "23",
    icon: CardGiftcardOutlinedIcon,
    label: { he: "למתנה", en: "As a gift" },
    body: { he: "מוצרים מיוחדים וסטים נבחרים", en: "Curated gifts and special items" },
  },
  {
    kind: "link",
    to: "/wholesale",
    icon: GroupsOutlinedIcon,
    label: { he: "לאירוע / קבוצה", en: "Event / group" },
    body: { he: "הזמנות בכמויות — סיטונאות והצעת מחיר", en: "Bulk orders — wholesale and quotes" },
  },
  {
    kind: "anchor",
    anchor: "bundles",
    icon: Inventory2OutlinedIcon,
    label: { he: "סטים וחבילות", en: "Sets & kits" },
    body: { he: "חבילות מוכנות מהקטלוג", en: "Ready-made kits from the catalog" },
  },
];

export const SHOP_CATEGORY_CHIPS = [
  { category: "18", label: { he: "מדבקות", en: "Stickers" } },
  { category: "146", label: { he: "לבוש", en: "Apparel" } },
  { category: "26", label: { he: "בית ספר", en: "School" } },
  { category: "20", label: { he: "צמידים", en: "Bracelets" } },
] as const;

export const SHOP_COPY = {
  mission: {
    he: "כל רכישה תומכת בחלוקה חינם של מוצרים לבתי ספר ומוסדות חינוך.",
    en: "Every purchase helps fund free product distribution to schools.",
  },
  whyNeed: { he: "לשם מה אתם צריכים את זה?", en: "For what purpose do you need it?" },
  bestSellers: { he: "הכי נמכרים", en: "Best sellers" },
  bundles: { he: "סטים וחבילות", en: "Sets & kits" },
  allProducts: { he: "כל המוצרים", en: "All products" },
  clearFilter: { he: "הצג הכול", en: "Show all" },
  b2bLinks: {
    he: "סיטונאות · הצעת מחיר · לאירוע · צמידים לבתי ספר",
    en: "Wholesale · Quote · Events · School bracelets",
  },
} as const;
