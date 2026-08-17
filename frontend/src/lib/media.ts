export const MEDIA = {
  hoodie:
    "https://lashonhara.co.il/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-17-at-07.55.26-1.jpeg",
  heroVideo:
    "https://lashonhara.co.il/wp-content/uploads/2024/05/WhatsApp-Video-2024-05-07-at-15.34.14_1cb4ba69.mp4",
  bracelets: encodeURI(
    "https://lashonhara.co.il/wp-content/uploads/2023/10/צמידי-לשון-הרע.-סט-1-scaled.jpg",
  ),
  fabric: encodeURI("https://lashonhara.co.il/wp-content/uploads/2021/09/צמידי-בד-דסקטופ.jpg"),
  neckWarmer: encodeURI("https://lashonhara.co.il/wp-content/uploads/2025/11/חם-צוואר-scaled.jpg"),
} as const;

export const SHOP_SHOWCASE = [
  {
    src: MEDIA.fabric,
    alt: { he: "צמידי בד עם המשפט", en: "Fabric bracelets with the slogan" },
  },
  {
    src: MEDIA.neckWarmer,
    alt: { he: "חם צוואר עם המשפט", en: "Neck warmer with the slogan" },
  },
  {
    src: MEDIA.bracelets,
    alt: { he: "צמידי סיליקון עם המשפט", en: "Silicone bracelets with the slogan" },
  },
  {
    src: MEDIA.hoodie,
    alt: { he: "קפוצ׳ון עם המשפט", en: "Hoodie with the slogan" },
  },
  {
    src: encodeURI("https://lashonhara.co.il/wp-content/uploads/2025/11/תיק-לבן-גדול.jpg"),
    alt: { he: "תיק גב עם המסר", en: "Backpack with the message" },
  },
  {
    src: encodeURI("https://lashonhara.co.il/wp-content/uploads/2025/11/בובה--scaled.jpg"),
    alt: { he: "בובת שון שומר הלשון", en: "Shon the tongue-guardian doll" },
  },
  {
    src: encodeURI("https://lashonhara.co.il/wp-content/uploads/2025/11/כדורגל-.jpg"),
    alt: { he: "כדורגל עם האייקון של שון", en: "Soccer ball with the Shon icon" },
  },
  {
    src: encodeURI("https://lashonhara.co.il/wp-content/uploads/2025/11/תיק-קטן-לבן-scaled.jpg"),
    alt: { he: "תיק מבד קטן", en: "Small fabric pouch" },
  },
  {
    src: encodeURI("https://lashonhara.co.il/wp-content/uploads/2025/11/גרב-לבן--scaled.jpg"),
    alt: { he: "גרביים לבנות עם האייקון", en: "White socks with the icon" },
  },
  {
    src: encodeURI("https://lashonhara.co.il/wp-content/uploads/2025/11/מדקת-מגנט-scaled.jpg"),
    alt: { he: "מדבקת מגנט לפלאפון", en: "Magnetic phone sticker" },
  },
  {
    src: "https://lashonhara.co.il/wp-content/uploads/2024/11/IMG_4314-scaled.jpg",
    alt: { he: "מחזיק מפתחות שון", en: "Shon keychain" },
  },
  {
    src: encodeURI("https://lashonhara.co.il/wp-content/uploads/2025/07/כובע-ורוד-scaled.jpg"),
    alt: { he: "כובע שמש עם הסלוגן", en: "Sun hat with the slogan" },
  },
  {
    src: "https://lashonhara.co.il/wp-content/uploads/2021/09/IMG-20210913-WA0041.jpg",
    alt: { he: "רביעיית צמידי בד", en: "Set of four fabric bracelets" },
  },
  {
    src: "https://lashonhara.co.il/wp-content/uploads/2020/02/IMG-20200223-WA0006.jpg",
    alt: { he: "קפוצ׳ון לשון הרע לא מדבר אליי", en: "Lashon hara hoodie" },
  },
] as const;
