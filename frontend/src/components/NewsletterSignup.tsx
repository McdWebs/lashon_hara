import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { submitForm } from "../lib/forms";

export function NewsletterSignup() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [saved, setSaved] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    const result = await submitForm("newsletter", "/", Object.fromEntries(form.entries()));
    setSaved(result.saved);
    setStatus("ok");
  }

  if (status === "ok") {
    return <Alert severity={saved ? "success" : "warning"}>{saved ? "נרשמתם לעדכונים." : "השמירה נכשלה — וואטסאפ 054-3644512."}</Alert>;
  }

  return (
    <Stack component="form" spacing={2} sx={{ maxWidth: 420 }} onSubmit={onSubmit}>
      <Typography variant="h2">רוצים להתעדכן?</Typography>
      <Typography color="text.secondary">
        באתר הקיים יש הרשמה לקבלת עדכונים. אותה מטרה: קשר עם העמותה, בלי המצאת מבצע חדש.
      </Typography>
      <TextField required name="name" label="שם" />
      <TextField required name="email" type="email" label="אימייל" />
      <TextField name="phone" label="טלפון" />
      <Button type="submit" variant="contained" disabled={status === "loading"}>
        הרשמה
      </Button>
    </Stack>
  );
}
