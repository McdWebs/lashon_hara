import { Alert, Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { useLocale } from "../i18n/useLocale";

const regions = [
  { he: "צפון", en: "North" },
  { he: "חיפה והקריות", en: "Haifa" },
  { he: "מרכז", en: "Center" },
  { he: "תל אביב", en: "Tel Aviv" },
  { he: "ירושלים", en: "Jerusalem" },
  { he: "דרום", en: "South" },
];

export function MapPage() {
  const { lang, loc, t } = useLocale();
  return (
    <>
      <PageHeader title={t("mapTitle")} />
      <Section>
        <Typography sx={{ mb: 2 }}>{t("mapIntro")}</Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          {t("mapEmpty")}
        </Alert>
        <Stack spacing={1} sx={{ mb: 3 }}>
          {regions.map((r) => (
            <Typography key={r.en} color="text.secondary">
              {lang === "en" ? r.en : r.he} — 0
            </Typography>
          ))}
        </Stack>
        <Button component={RouterLink} to={loc("/schools")} variant="contained">
          {t("ctaSchool")}
        </Button>
      </Section>
    </>
  );
}
