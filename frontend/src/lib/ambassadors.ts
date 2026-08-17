import type { Lang } from "../i18n/locale";

export type MockAmbassador = {
  id: string;
  name: string;
  city: string;
  role: Record<Lang, string>;
  quote: Record<Lang, string>;
  joined: Record<Lang, string>;
  activity: Record<Lang, string>;
};

/** Mock profiles for layout preview — replace with approved ambassadors from the org. */
export const MOCK_AMBASSADORS: MockAmbassador[] = [
  {
    id: "noa",
    name: "נועה כ.",
    city: "תל אביב",
    role: { he: "מורה לחינוך", en: "Education teacher" },
    quote: {
      he: "אחרי חלוקת הצמידים בכיתה, תלמידה אחת אמרה לי: 'עכשיו אני חושבת פעמיים לפני שאני מעבירה שמועה.' זה שווה הכול.",
      en: "After we handed out bracelets in class, one student told me: 'Now I think twice before passing on a rumor.' That made it all worth it.",
    },
    joined: {
      he: "רציתי להביא את המסר לכיתה שלי, לא רק בשיעור חד־פעמי.",
      en: "I wanted the message in my classroom — not just as a one-off lesson.",
    },
    activity: {
      he: "חלוקות בבית הספר, ליווי תלמידים אחרי סדנאות",
      en: "School distributions, supporting students after workshops",
    },
  },
  {
    id: "yosef",
    name: "יוסף מ.",
    city: "ירושלים",
    role: { he: "תלמיד / מתנדב", en: "Student volunteer" },
    quote: {
      he: "בקבוצות WhatsApp של הכיתה קל לאבד שליטה. הצמיד והמשפט נותנים משפט אחד שאפשר להזכיר בלי להטיף.",
      en: "Class WhatsApp groups get out of hand fast. The bracelet gives us one sentence we can repeat without preaching.",
    },
    joined: {
      he: "ראיתי חלוקה בבית הספר ורציתי לעזור גם בכיתה שלי.",
      en: "I saw a distribution at school and wanted to help in my class too.",
    },
    activity: {
      he: "סיוע בחלוקות, שיח ברשת בקבוצות גיל צעיר",
      en: "Distribution help, healthier tone in youth group chats",
    },
  },
  {
    id: "shira",
    name: "שירה ל.",
    city: "חיפה",
    role: { he: "יוצרת תוכן", en: "Content creator" },
    quote: {
      he: "כשאני מעלה סטורי עם המשפט, אנשים שואלים 'מה זה?' — ופתאום יש שיחה על לשון הרע במקום עוד ביוש.",
      en: "When I post the slogan in a story, people ask what it means — and suddenly we're talking about lashon hara instead of more gossip.",
    },
    joined: {
      he: "הרגשתי שאני יכולה להשפיע על השיח ברשת בצורה חיובית.",
      en: "I felt I could influence online discourse in a positive way.",
    },
    activity: {
      he: "תוכן ברשת, הפצת המסר בקהילה מקומית",
      en: "Social content, spreading the message locally",
    },
  },
  {
    id: "david",
    name: "דוד א.",
    city: "באר שבע",
    role: { he: "מארגן אירועים קהילתיים", en: "Community event organizer" },
    quote: {
      he: "באירוע קהילתי חילקנו מדבקות וצמידים. הורים באו אלינו אחר כך לבקש עוד לילדים השניים.",
      en: "At a community event we handed out stickers and bracelets. Parents came back afterward asking for more for their other kids.",
    },
    joined: {
      he: "חיפשתי דרך לחבר בין אנשים סביב ערך משותף, לא רק עוד הרצאה.",
      en: "I wanted to connect people around a shared value — not just another lecture.",
    },
    activity: {
      he: "ארגון חלוקות, שיתופי פעולה עם מוסדות בדרום",
      en: "Organizing distributions, partnerships with southern institutions",
    },
  },
];
