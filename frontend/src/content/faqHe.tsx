import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { ReactNode } from "react";
import { SITE, SCHOOLS_PRODUCT_ID, waLink } from "../lib/site";

type FaqItem = {
  q: string;
  a: ReactNode;
};

type FaqSection = {
  title: string;
  items: FaqItem[];
};

function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Stack spacing={1}>
      {items.map(({ q, a }) => (
        <Accordion
          key={q}
          disableGutters
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px !important",
            "&::before": { display: "none" },
            "&.Mui-expanded": { mb: 0 },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 2.5,
              py: 0.5,
              "& .MuiAccordionSummary-content": { my: 1.25 },
            }}
          >
            <Typography sx={{ fontWeight: 600, lineHeight: 1.45 }}>{q}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
            <Typography component="div" sx={{ color: "text.secondary", lineHeight: 1.75, fontSize: "0.98rem" }}>
              {a}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}

function faqSections(loc: (path: string) => string): FaqSection[] {
  return [
    {
      title: "על העמותה",
      items: [
        {
          q: "מה זו העמותה?",
          a: (
            <>
              &quot;לשון הרע לא מדבר אליי&quot; היא עמותה הפועלת לחיזוק תרבות שיח חיובית בישראל ולמניעת
              לשון הרע, רכילות ושיימינג — בחינוך, בקהילה ובמרחב המקוון.{" "}
              <Link component={RouterLink} to={loc("/about")}>
                קראו עוד בדף האודות
              </Link>
              .
            </>
          ),
        },
        {
          q: "מה זה לשון הרע?",
          a: (
            <>
              דיבור שלילי שנאמר לאחר או על אחר. המבחן הפשוט: אם לא הייתם אומרים את זה בפני האדם — אל
              תגידו מאחורי גבו. נכללים גם השמצות, לעג, רכילות, ביוש (שיימינג) והסתה.{" "}
              <Link component={RouterLink} to={loc("/message/quiz")}>
                תרגול: האם זה לשון הרע?
              </Link>
            </>
          ),
        },
        {
          q: "איך אפשר להצטרף לתנועה?",
          a: (
            <>
              אפשר לחתום על{" "}
              <Link component={RouterLink} to={loc("/join/commitment")}>
                התחייבות אישית
              </Link>
              , להפוך ל
              <Link component={RouterLink} to={loc("/join/ambassadors")}>
                שגריר/ה
              </Link>
              , להזמין פעילות ל
              <Link component={RouterLink} to={loc("/schools")}>
                בית ספר
              </Link>
              , או לתרום דרך{" "}
              <Link component={RouterLink} to={loc("/donate")}>
                דף התרומות
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      title: "רכישה ומשלוחים",
      items: [
        {
          q: "איך קונים?",
          a: "בוחרים מוצרים בחנות, מוסיפים לסל, ומשלימים את ההזמנה בקופה. בינתיים, אפשר גם להשלים הזמנה ב-WhatsApp עד שהסליקה המקוונת תיפתח במלואה.",
        },
        {
          q: "מהן עלויות המשלוח?",
          a: (
            <>
              איסוף בנקודות Epost: 10 ₪ (עד 8 ימי עסקים, כולל מספר מעקב).
              <br />
              שליח עד הבית: 35 ₪ (עד 8 ימי עסקים).
              <br />
              משלוח חינם בקנייה מעל 100 ₪.
            </>
          ),
        },
        {
          q: "כמה זמן לוקח למשלוח להגיע?",
          a: "עד 8 ימי עסקים — בין אם בחרתם איסוף בנקודה או שליח עד הבית.",
        },
      ],
    },
    {
      title: "תשלום",
      items: [
        {
          q: "אילו אמצעי תשלום זמינים?",
          a: "באתר: ויזה, ישראכרט, מאסטרקארד, אמריקן אקספרס ודיינרס. בינתיים ניתן גם להשלים הזמנה ב-WhatsApp.",
        },
        {
          q: "האם התשלום באתר מאובטח?",
          a: "כן. התשלום מתבצע דרך מערכת סליקה העומדת בתקן PCI.",
        },
        {
          q: "האם מקבלים חשבונית?",
          a: 'כן. לאחר ההזמנה תישלח חשבונית לכתובת האימייל שהזנתם.',
        },
      ],
    },
    {
      title: "בתי ספר וארגונים",
      items: [
        {
          q: "איך מקבלים צמידים חינם לבית הספר?",
          a: (
            <>
              מוסדות חינוך ממלאים{" "}
              <Link component={RouterLink} to={loc(`/shop/product/${SCHOOLS_PRODUCT_ID}`)}>
                בקשת חלוקה
              </Link>{" "}
              עם פרטים מלאים מטעם נציגות בית הספר — כמות תלמידים, כיתות ומסגרת החלוקה. בקשה ללא
              פרטים מלאים לא תיענה.
            </>
          ),
        },
        {
          q: "איך מזמינים בכמויות גדולות או בהדפסה אישית?",
          a: (
            <>
              לסיטונאות, הצעות מחיר והדפסות מותאמות —{" "}
              <Link component={RouterLink} to={loc("/wholesale")}>
                סיטונאות
              </Link>
              ,{" "}
              <Link component={RouterLink} to={loc("/request-a-quote")}>
                הצעת מחיר
              </Link>{" "}
              או{" "}
              <Link component={RouterLink} to={loc("/custom")}>
                הדפסה אישית
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      title: "יצירת קשר",
      items: [
        {
          q: "איך יוצרים קשר?",
          a: (
            <>
              הדרך המהירה: WhatsApp ב-{SITE.supportHours}. מספר: 054-3644512. אפשר גם{" "}
              <Link component={RouterLink} to={loc("/contact")}>
                לשלוח הודעה
              </Link>{" "}
              דרך האתר.
            </>
          ),
        },
        {
          q: "איפה המשרד?",
          a: "זבוטינסקי 168, בני ברק.",
        },
      ],
    },
  ];
}

export function FaqHeContent({ loc }: { loc: (path: string) => string }) {
  const sections = faqSections(loc);

  return (
    <>
      <Typography sx={{ mb: 4, lineHeight: 1.75, color: "text.secondary", maxWidth: 640 }}>
        תשובות לשאלות נפוצות על העמותה, הרכישה בחנות, משלוחים, תשלום ובתי ספר.
      </Typography>

      <Stack spacing={4}>
        {sections.map(({ title, items }) => (
          <Box key={title}>
            <Typography
              component="h2"
              sx={{ mb: 2, fontWeight: 700, fontSize: { xs: "1.15rem", md: "1.3rem" } }}
            >
              {title}
            </Typography>
            <FaqAccordion items={items} />
          </Box>
        ))}
      </Stack>

      <Box
        sx={{
          mt: 5,
          p: 3,
          borderRadius: 2,
          bgcolor: "background.default",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography sx={{ fontWeight: 600, mb: 1 }}>לא מצאתם תשובה?</Typography>
        <Typography sx={{ mb: 2, color: "text.secondary", lineHeight: 1.7 }}>
          נשמח לעזור ב-WhatsApp או דרך טופס יצירת הקשר.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button variant="contained" href={waLink()} target="_blank" rel="noreferrer">
            דברו איתנו ב-WhatsApp
          </Button>
          <Button component={RouterLink} to={loc("/contact")} variant="outlined">
            טופס יצירת קשר
          </Button>
        </Stack>
      </Box>
    </>
  );
}
