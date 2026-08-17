import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { LoadingButton } from "../components/States";
import { useLocale } from "../i18n/useLocale";
import { submitForm } from "../lib/forms";

type OrgVariant = "default" | "wholesale" | "quote" | "custom";

const copy: Record<OrgVariant, { title: string; intro: string }> = {
  default: {
    title: "הזמנה לקבוצה / בית ספר / ארגון",
    intro:
      "הזמנות לקבוצות, סיטונאות ומוצרים בהדפסה אישית. מלאו את הטופס ונחזור עם הצעת מחיר.",
  },
  wholesale: {
    title: "סיטונאות",
    intro: "הזמנות בכמויות לבתי ספר, ארגונים וחברות. נחזור אליכם עם מחירים ולוחות זמנים.",
  },
  quote: {
    title: "בקשת הצעת מחיר",
    intro: "פרטו את הארגון, המוצרים והכמויות — נשלח הצעת מחיר מותאמת.",
  },
  custom: {
    title: "מוצרים לאירוע / הדפסה אישית",
    intro: "צמידים, מדבקות ומוצרים עם לוגו או ניסוח מותאם לאירועים וקמפיינים.",
  },
};

export function OrganizationsPage({ variant = "default" }: { variant?: OrgVariant }) {
  const { loc, t } = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [saved, setSaved] = useState(true);
  const { title, intro } = copy[variant];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    const result = await submitForm("quote", `/${variant === "default" ? "organizations" : variant}`, {
      ...Object.fromEntries(form.entries()),
      variant,
    });
    setSaved(result.saved);
    setStatus("ok");
  }

  return (
    <>
      <PageHeader title={title} />
      <Section>
        <Typography sx={{ mb: 2 }}>{intro}</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: "wrap" }}>
          <Button
            component={RouterLink}
            to={loc("/organizations")}
            variant={variant === "default" ? "contained" : "outlined"}
            size="small"
          >
            הזמנה לקבוצה
          </Button>
          <Button
            component={RouterLink}
            to={loc("/wholesale")}
            variant={variant === "wholesale" ? "contained" : "outlined"}
            size="small"
          >
            {t("navWholesale")}
          </Button>
          <Button
            component={RouterLink}
            to={loc("/request-a-quote")}
            variant={variant === "quote" ? "contained" : "outlined"}
            size="small"
          >
            {t("navQuote")}
          </Button>
          <Button
            component={RouterLink}
            to={loc("/custom")}
            variant={variant === "custom" ? "contained" : "outlined"}
            size="small"
          >
            {t("navCustom")}
          </Button>
        </Stack>
        {status === "ok" ? (
          <Alert severity={saved ? "success" : "warning"}>
            {saved ? "בקשת ההצעה נקלטה." : "השמירה נכשלה — וואטסאפ 054-3644512."}
          </Alert>
        ) : (
          <Stack component="form" spacing={2} sx={{ maxWidth: 520 }} onSubmit={onSubmit}>
            <Typography variant="h3">בקשת הצעת מחיר</Typography>
            <TextField required name="organization" label="ארגון / בית ספר" />
            <TextField required name="name" label="איש קשר" />
            <TextField required name="phone" label="טלפון" />
            <TextField required name="email" type="email" label="אימייל" />
            <TextField name="products" label="אילו מוצרים / כמויות" multiline minRows={3} />
            <TextField name="logo" label="קישור ללוגו (אם יש התאמה אישית)" />
            <LoadingButton type="submit" variant="contained" loading={status === "loading"}>
              שליחת בקשה
            </LoadingButton>
          </Stack>
        )}
      </Section>
    </>
  );
}
