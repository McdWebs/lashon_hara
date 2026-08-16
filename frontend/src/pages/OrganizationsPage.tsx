import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { PageHeader, Section } from "../components/Section";
import { submitForm } from "../lib/forms";
import { SITE } from "../lib/site";

export function OrganizationsPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [saved, setSaved] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    const result = await submitForm("quote", "/organizations", Object.fromEntries(form.entries()));
    setSaved(result.saved);
    setStatus("ok");
  }

  return (
    <>
      <PageHeader title="הזמנה לקבוצה / בית ספר / ארגון" />
      <Section>
        <Typography sx={{ mb: 2 }}>
          באתר הקיים יש דפי סיטונאות, בקשת הצעת מחיר ומוצרים בהדפסה אישית. לא מעבירים ארגון בקופה הרגילה אם התהליך אצלכם אחר.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 4 }}>
          <Button href={`${SITE.wcOrigin}/wholesale/`} variant="outlined">
            סיטונאות
          </Button>
          <Button href={`${SITE.wcOrigin}/request-a-quote/`} variant="outlined">
            בקשת הצעת מחיר באתר הקיים
          </Button>
          <Button href={`${SITE.wcOrigin}/custom/`} variant="outlined">
            מוצרים לאירוע
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
            <Button type="submit" variant="contained" disabled={status === "loading"}>
              שליחת בקשה
            </Button>
          </Stack>
        )}
      </Section>
    </>
  );
}
