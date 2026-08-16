import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { PageHeader, Section } from "../components/Section";
import { track } from "../lib/analytics";

export function SchoolsPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track("school_contact_started");
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "school",
          sourcePath: "/schools",
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
      <PageHeader title="הופכים את בית הספר למרחב בטוח יותר" />
      <Section>
        <Typography sx={{ mb: 2 }}>
          אני נציג של בית הספר ורוצה לאמץ תוכנית חינוכית לתלמידים שלי. באתר הקיים מופיעות סדנאות חינוכיות בבתי ספר וחלוקת מוצרים.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          פירוט מחירון, מבנה סדנה ועדויות בתי ספר יופיעו רק כשיסופקו מהעמותה. לא הומצא מודל תמחור.
        </Typography>
        {status === "ok" ? (
          <Alert severity="success">הפנייה נקלטה. נחזור אליכם לתיבת הדואר המשותפת.</Alert>
        ) : (
          <Stack component="form" spacing={2} sx={{ maxWidth: 480 }} onSubmit={onSubmit}>
            <TextField required name="name" label="שם" />
            <TextField required name="role" label="תפקיד" />
            <TextField required name="school" label="בית ספר / רשות" />
            <TextField required name="phone" label="טלפון" />
            <TextField required name="email" type="email" label="אימייל" />
            <TextField name="message" label="פרטים נוספים" multiline minRows={3} />
            {status === "error" && <Alert severity="error">השליחה נכשלה.</Alert>}
            <Button type="submit" variant="contained" disabled={status === "loading"}>
              הזמינו פעילות לבית הספר
            </Button>
          </Stack>
        )}
      </Section>
    </>
  );
}
