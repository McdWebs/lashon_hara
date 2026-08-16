export type Story = {
  slug: string;
  title: string;
  kind: "ארגון" | "קמפיין";
  person: string;
  situation: string;
  problem: string;
  happened: string;
  changed: string;
  lesson: string;
  source: string;
};

/** Only facts already published on lashonhara.co.il (about + shop). */
export const stories: Story[] = [
  {
    slug: "2007-halperin",
    title: "איך נולד המסר",
    kind: "ארגון",
    person: "דוד הלפרין והעמותה",
    situation: "ישראל, אמצע העשור הראשון של שנות ה־2000.",
    problem: "לשון הרע ושיימינג פוגעים באנשים, גם כשהדובר מרגיש שרק נזרקה עוד מילה.",
    happened:
      "בשנת 2007 הקים איש העסקים דוד הלפרין את המיזם. המסר הופץ בשלטי חוצות, בחלוקת סטיקרים וצמידים, בביקורים בבתי חולים ובבסיסי צה״ל ובתערוכות.",
    changed: "בתוך זמן קצר הפך המשפט למטבע לשון שגור, חוצה מגזרים ותרבויות.",
    lesson: "תזכורת יום־יומית על הגוף וברחוב יכולה לשנות שיח.",
    source: "דף אודות, lashonhara.co.il/about-us",
  },
  {
    slug: "from-guerrilla-to-amutah",
    title: "מפעילות גרילה לעמותה",
    kind: "ארגון",
    person: "העמותה",
    situation: "אחרי כ־14 שנות פעילות שהתחילה מתוך עשייה וללא תכנון מוסדי.",
    problem: "השיח הציבורי והדיגיטלי החריף: שיימינג, אלימות מילולית וירידה בהכלת האחר.",
    happened: "הוחלט למסד את הפעילות במסגרת עמותה, כדי להרחיב אותה באופן שיטתי ולהגדיל את ההשפעה על חינוך דור העתיד.",
    changed: "המיקוד עבר לחינוך ולתוכניות מקצועיות, מתוך אמונה ששינוי תרבותי נעשה בדוגמה אישית ובהוראה.",
    lesson: "תנועה חיה צריכה גם מבנה שמאפשר להגיע לבתי ספר באופן קבוע.",
    source: "דף אודות, lashonhara.co.il/about-us",
  },
  {
    slug: "shop-funds-schools",
    title: "למה יש חנות",
    kind: "קמפיין",
    person: "העמותה והקונים",
    situation: "צריך לממן חלוקה חינם לבתי ספר ומוסדות חינוך.",
    problem: "חלוקת צמידים ומוצרים למוסדות דורשת משאבים מתמשכים.",
    happened: "נפתחה חנות מקוונת למוצרים עם המסר.",
    changed: "כפי שנכתב בחנות: המכירות מאפשרות להמשיך ולחלק את המוצרים בחינם לבתי ספר ומוסדות חינוך.",
    lesson: "קנייה היא גם דרך להפיץ את המסר וגם תמיכה בחלוקה החינוכית.",
    source: "תיאור חנות, lashonhara.co.il/shop",
  },
];

export function getStory(slug: string) {
  return stories.find((s) => s.slug === slug);
}
