import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { PageHeader, Section } from "../components/Section";
import { track } from "../lib/analytics";

export function AmbassadorsPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track("ambassador_application_started");
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "ambassador",
          sourcePath: "/join/ambassadors",
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
      <PageHeader title="הצטרפו לנבחרת השגרירים" />
      <Section>
        <Typography sx={{ mb: 2 }}>אני רוצה להיות בנבחרת השגרירים לעזור בחלוקות ולנקות את השיח ברשת.</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          פרופילי שגרירים ותמונות יופיעו רק כשיהיה תוכן מאושר מהאתר או מהעמותה. לא הומצאו שמות.
        </Typography>
        {status === "ok" ? (
          <Alert severity="success">הפנייה נשלחה לתיבה המשותפת.</Alert>
        ) : (
          <Stack component="form" spacing={2} sx={{ maxWidth: 480 }} onSubmit={onSubmit}>
            <TextField required name="name" label="שם" />
            <TextField required name="phone" label="טלפון" />
            <TextField required name="email" type="email" label="אימייל" />
            <TextField name="note" label="כמה מילים (לא חובה)" multiline minRows={3} />
            {status === "error" && <Alert severity="error">השליחה נכשלה. נסו שוב או WhatsApp.</Alert>}
            <Button type="submit" variant="contained" disabled={status === "loading"}>
              אני רוצה להיות שגריר/ה
            </Button>
          </Stack>
        )}
      </Section>
    </>
  );
}
