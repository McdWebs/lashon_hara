import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { NewsletterSignup } from "../components/NewsletterSignup";
import { PageHeader, Section } from "../components/Section";
import { SITE, waLink } from "../lib/site";

export function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "contact",
          sourcePath: "/contact",
          payload: Object.fromEntries(form.entries()),
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <PageHeader title="צור קשר" />
      <Section>
        <Typography sx={{ mb: 2 }}>הדרך המהירה: WhatsApp.</Typography>
        <Button variant="contained" href={waLink()} target="_blank" rel="noreferrer" sx={{ mb: 3 }}>
          דברו איתנו ב-WhatsApp
        </Button>
        <Typography>
          שעות מענה: {SITE.supportHours}. מספר: 054-3644512.
        </Typography>
        {status === "ok" ? (
          <Alert sx={{ mt: 3 }} severity="success">
            ההודעה נשלחה לתיבה המשותפת.
          </Alert>
        ) : (
          <Stack component="form" spacing={2} sx={{ maxWidth: 480, mt: 3 }} onSubmit={onSubmit}>
            <TextField required name="name" label="שם" />
            <TextField required name="email" type="email" label="אימייל" />
            <TextField name="phone" label="טלפון" />
            <TextField required name="message" label="הודעה" multiline minRows={4} />
            {status === "error" && <Alert severity="error">השליחה נכשלה.</Alert>}
            <Button type="submit" variant="outlined" disabled={status === "loading"}>
              שליחה למייל
            </Button>
          </Stack>
        )}
      </Section>
      <Section muted>
        <NewsletterSignup />
      </Section>
    </>
  );
}
