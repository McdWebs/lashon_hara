import { Button, Typography } from "@mui/material";
import { PageHeader, Section } from "../components/Section";
import { SITE } from "../lib/site";

export function DonatePage() {
  return (
    <>
      <PageHeader title="תרומה" />
      <Section>
        <Typography sx={{ mb: 2 }}>תרומה לעמותת &quot;לשון הרע לא מדבר אלי&quot;.</Typography>
        <Typography sx={{ mb: 2 }}>
          תשלום באתר החדש בהמתנה. בינתיים התרומה מתבצעת בדף הקיים, כדי לא לשבור את התהליך העסקי.
        </Typography>
        <Button variant="contained" href={`${SITE.wcOrigin}/donate/`}>
          למעבר לדף התרומה הקיים
        </Button>
      </Section>
    </>
  );
}

export function StoriesPage() {
  return (
    <>
      <PageHeader title="הסיפורים שלנו" />
      <Section>
        <Typography>
          [ממתין לתוכן מאושר] אין כאן סיפורים מומצאים. כשיועברו עדויות מהאתר או מהעמותה, הן ייכנסו למערכת הסיפורים.
        </Typography>
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

export function OrganizationsPage() {
  return (
    <>
      <PageHeader title="הזמנה לקבוצה / בית ספר / ארגון" />
      <Section>
        <Typography sx={{ mb: 2 }}>באתר הקיים קיימים דפי סיטונאות ובקשת הצעת מחיר.</Typography>
        <Button href={`${SITE.wcOrigin}/wholesale/`} variant="contained" sx={{ mr: 1 }}>
          סיטונאות
        </Button>
        <Button href={`${SITE.wcOrigin}/request-a-quote/`}>בקשת הצעת מחיר</Button>
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
