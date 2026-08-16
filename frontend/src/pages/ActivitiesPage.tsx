import { Card, CardContent, Grid, Typography } from "@mui/material";
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
        <Typography sx={{ mb: 2 }}>
          יחד מחזקים מודעות לשיח מכבד בין אחד לשני, מזכירים שמילים יכולות לפגוע, ומובילים שינוי חברתי דרך חינוך, חלוקת מוצרים עם המסר, וניקיון הרשת החברתית מלשון הרע.
        </Typography>
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid key={item.title} size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h3">{item.title}</Typography>
                  <Typography sx={{ mt: 1 }}>{item.body}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>
    </>
  );
}
