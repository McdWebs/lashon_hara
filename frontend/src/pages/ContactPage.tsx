import { Alert, Box, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { LoadingButton } from "../components/States";
import { NewsletterSignup } from "../components/NewsletterSignup";
import { PageHeader, Section } from "../components/Section";
import { SITE } from "../lib/site";

export function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );

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
        <Box sx={{ maxWidth: 480, mx: "auto", textAlign: "center" }}>
          <Typography>שעות מענה: {SITE.supportHours}.</Typography>
          {status === "ok" ? (
            <Alert sx={{ mt: 3, textAlign: "start" }} severity="success">
              ההודעה נשלחה לתיבה המשותפת.
            </Alert>
          ) : (
            <Stack
              component="form"
              spacing={2}
              sx={{ width: "100%", mt: 3, textAlign: "start" }}
              onSubmit={onSubmit}
            >
              <TextField required name="name" label="שם" />
              <TextField required name="email" type="email" label="אימייל" />
              <TextField name="phone" label="טלפון" />
              <TextField
                required
                name="message"
                label="הודעה"
                multiline
                minRows={4}
              />
              {status === "error" && (
                <Alert severity="error">השליחה נכשלה.</Alert>
              )}
              <LoadingButton
                type="submit"
                variant="outlined"
                loading={status === "loading"}
                fullWidth
              >
                שליחה למייל
              </LoadingButton>
            </Stack>
          )}
        </Box>
      </Section>
      <Section muted>
        <NewsletterSignup />
      </Section>
    </>
  );
}
