import { Button, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { track } from "../lib/analytics";
import { SITE } from "../lib/site";

export function DonatePage() {
  return (
    <>
      <PageHeader title="תרומה" />
      <Section>
        <Typography sx={{ mb: 2 }}>תרומה לעמותת &quot;לשון הרע לא מדבר אלי&quot;.</Typography>
        <Typography sx={{ mb: 2 }}>
          באתר הקיים נכתב שהמכירות מאפשרות להמשיך ולחלק מוצרים בחינם לבתי ספר. תרומה ישירה תומכת באותה מטרה — בלי לעבור דרך הקטלוג.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          הסליקה באתר החדש בהמתנה. התשלום עצמו נשאר בדף התרומה הקיים.
        </Typography>
        <Button
          variant="contained"
          href={`${SITE.wcOrigin}/donate/`}
          onClick={() => track("donation_started")}
        >
          לתרומה בדף הקיים
        </Button>
        <Card variant="outlined" sx={{ mt: 4, maxWidth: 520 }}>
          <CardActionArea component={RouterLink} to="/schools">
            <CardContent>
              <Typography sx={{ fontWeight: 700 }}>רוצים שהכסף יגיע לבית ספר?</Typography>
              <Typography color="text.secondary">אפשר גם להזמין פעילות או חלוקה למוסד חינוכי.</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Section>
    </>
  );
}

export function ResourcesPage() {
  return (
    <>
      <PageHeader title="חומרי הוראה" />
      <Section>
        <Typography>[ממתין לתוכן מאושר] מרכז המשאבים ייבנה כשיהיו קבצים להורדה מהעמותה.</Typography>
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
          באתר הקיים אין פוסטים בבלוג (0 ברשומות WordPress). המגזין יתחיל רק מתוכן אמיתי, לא ממאמרי SEO מומצאים.
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
          <strong>איך קונים?</strong> הקטלוג נטען מהחנות הקיימת. התשלום עדיין בקופה של WooCommerce.
        </Typography>
        <Typography>
          <strong>איך יוצרים קשר?</strong> WhatsApp 054-3644512, {SITE.supportHours}.
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

export function OrganizationsPagePlaceholder() {
  return null;
}
