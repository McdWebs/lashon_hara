import { Typography } from "@mui/material";
import { PageHeader, Section } from "../components/Section";
import { FaqHeContent } from "../content/faqHe";
import { useLocale } from "../i18n/useLocale";

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
  const { loc } = useLocale();

  return (
    <>
      <PageHeader title="שאלות נפוצות" />
      <Section>
        <FaqHeContent loc={loc} />
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
