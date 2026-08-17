import { Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { DonateFormSection } from "./CommercePages";
import { PageHeader, Section } from "../components/Section";

export function DonatePage() {
  return (
    <>
      <PageHeader title="תרומה" />
      <Section>
        <Typography sx={{ mb: 2 }}>תרומה לעמותת &quot;לשון הרע לא מדבר אלי&quot;.</Typography>
        <Typography sx={{ mb: 2 }}>
          המכירות בחנות מאפשרות להמשיך ולחלק מוצרים בחינם לבתי ספר. תרומה ישירה תומכת באותה מטרה — בלי לעבור דרך הקטלוג.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          מלאו את הפרטים ונחזור אליכם עם אפשרויות תרומה. סליקה מקוונת תיפתח בהמשך.
        </Typography>
        <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
          <DonateFormSection />
          <Link component={RouterLink} to="/schools" underline="always" sx={{ fontWeight: 600 }}>
            הזמנת פעילות לבית ספר
          </Link>
        </Stack>
      </Section>
    </>
  );
}

export function MagazinePage() {
  return (
    <>
      <PageHeader title="מאמרים" />
      <Section>
        <Typography>
          המגזין יתחיל רק מתוכן אמיתי, לא ממאמרי SEO מומצאים.
        </Typography>
      </Section>
    </>
  );
}

export function FaqPage() {
  return (
    <>
      <PageHeader title="שאלות נפוצות" />
      <Section>
        <Typography sx={{ mb: 2 }}>
          <strong>מה זו העמותה?</strong> עמותה לחיזוק תרבות שיח חיובית ולמניעת לשון הרע ושיימינג, כפי שמופיע בדף האודות.
        </Typography>
        <Typography sx={{ mb: 2 }}>
          <strong>איך קונים?</strong> בוחרים מוצרים בחנות, מוסיפים לסל, ומשלימים את ההזמנה בקופה או ב-WhatsApp עד שהסליקה המקוונת תיפתח.
        </Typography>
        <Typography>
          <strong>איך יוצרים קשר?</strong> WhatsApp 054-3644512, 09:00–18:00, שישה ימים בשבוע.
        </Typography>
      </Section>
    </>
  );
}

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="העמוד לא נמצא" />
      <Section>
        <Typography>בדקו את הכתובת, או חזרו לדף הבית.</Typography>
      </Section>
    </>
  );
}
