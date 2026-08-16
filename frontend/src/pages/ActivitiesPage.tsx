import { Box, Typography } from "@mui/material";
import { PageHeader, Section } from "../components/Section";

const items = [
  { title: "חלוקות", body: "הפצת המוצרים עם המסר במרחב הציבורי, בבתי ספר ובקהילות." },
  { title: "שגרירים", body: "מתנדבים שעוזרים בחלוקות ובניקיון השיח ברשת." },
  { title: "סדנאות חינוכיות בבתי ספר", body: "תוכניות לתלמידים לשיח מכבד." },
  { title: "תערוכות וקמפיינים", body: "נוכחות ציבורית שמזכירה את הבחירה איך אנחנו מדברים." },
];

export function ActivitiesPage() {
  return (
    <>
      <PageHeader title="הפעילות" />
      <Section>
        <Typography sx={{ mb: 4 }}>
          יחד מחזקים מודעות לשיח מכבד בין אחד לשני, מזכירים שמילים יכולות לפגוע, ומובילים שינוי חברתי דרך חינוך, חלוקת מוצרים עם המסר, וניקיון הרשת החברתית מלשון הרע.
        </Typography>
        {items.map((item) => (
          <Box key={item.title} sx={{ borderTop: "1px solid", borderColor: "divider", py: 2.5 }}>
            <Typography variant="h3">{item.title}</Typography>
            <Typography sx={{ mt: 0.5 }}>{item.body}</Typography>
          </Box>
        ))}
      </Section>
    </>
  );
}
