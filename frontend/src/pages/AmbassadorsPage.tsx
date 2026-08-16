import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { PageHeader, Section } from "../components/Section";
import { track } from "../lib/analytics";
import { submitForm } from "../lib/forms";

export function AmbassadorsPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [saved, setSaved] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track("ambassador_application_started");
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    const result = await submitForm("ambassador", "/join/ambassadors", Object.fromEntries(form.entries()));
    setSaved(result.saved);
    track("ambassador_application_completed", { saved: result.saved });
    setStatus("ok");
  }

  return (
    <>
      <PageHeader title="הצטרפו לנבחרת השגרירים" />
      <Section>
        <Typography sx={{ mb: 2 }}>לעזור בחלוקות ולנקות את השיח ברשת — כך מתוארת נבחרת השגרירים באתר הקיים.</Typography>
        <Typography sx={{ mb: 1, fontWeight: 700 }}>מה שגרירים עושים (מהאתר הקיים)</Typography>
        <Typography sx={{ mb: 2 }}>חלוקות, סיוע בניקיון השיח ברשת, והפצת המסר.</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          הטבות, הכשרות ופרופילים עם שמות ותמונות יופיעו רק כשהעמותה תאשר אותם. לא הומצאו שגרירים.
        </Typography>
        {status === "ok" ? (
          <Alert severity={saved ? "success" : "warning"}>
            {saved ? "הפנייה נשלחה." : "השמירה נכשלה — כתבו ב-WhatsApp 054-3644512."}
          </Alert>
        ) : (
          <Stack component="form" spacing={2} sx={{ maxWidth: 480 }} onSubmit={onSubmit}>
            <TextField required name="name" label="שם" />
            <TextField required name="phone" label="טלפון" />
            <TextField required name="email" type="email" label="אימייל" />
            <TextField name="city" label="יישוב" />
            <TextField name="note" label="למה אני רוצה להצטרף" multiline minRows={3} />
            <Button type="submit" variant="contained" disabled={status === "loading"}>
              אני רוצה להיות שגריר/ה
            </Button>
          </Stack>
        )}
      </Section>
    </>
  );
}
