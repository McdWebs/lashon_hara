import { Alert, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { PageHeader, Section } from "../components/Section";
import { track } from "../lib/analytics";

const oath = [
  "אני מתחייב/ת בזאת להימנע מהפצת לשון הרע ודברי רכילות.",
  "אני מתחייב/ת לשמור על שיח סובלני ומכבד, לדון בדרכי נועם, להביע התנגדות בצורה עניינית שאינה פוגענית.",
  "אני מתחייב/ת להפיץ את המסר בסביבתי, לעצור שיחות שעלולות להגיע ללשון הרע, בפני ומאחורי גבו של אחר.",
  "אני מתחייב/ת לעשות כל שביכולתי כדי לנקות את החברה שלנו מביוש (שיימינג), בריונות, אלימות, הסתה, הכללה (סטריאוטיפים), החרמות והלבנת פני אחר.",
];

export function CommitmentPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track("commitment_started");
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "commitment",
          sourcePath: "/join/commitment",
          payload: {
            firstName: form.get("firstName"),
            phone: form.get("phone"),
            email: form.get("email"),
            consent: form.get("consent") === "on",
          },
        }),
      });
      if (!res.ok) throw new Error("fail");
      track("commitment_completed");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <PageHeader title="השינוי מתחיל בי" />
      <Section>
        {oath.map((line) => (
          <Typography key={line} sx={{ mb: 2 }}>
            {line}
          </Typography>
        ))}
        {status === "ok" ? (
          <Alert severity="success">ההתחייבות נקלטה. כרטיס שיתוף מעוצב יגיע בשלב הבא של המוצר.</Alert>
        ) : (
          <Stack component="form" spacing={2} sx={{ maxWidth: 480 }} onSubmit={onSubmit}>
            <TextField required name="firstName" label="שם פרטי" autoComplete="given-name" />
            <TextField required name="phone" label="מספר טלפון" autoComplete="tel" />
            <TextField required name="email" type="email" label="כתובת אימייל" autoComplete="email" />
            <FormControlLabel
              control={<Checkbox name="consent" />}
              label="אני מאשר/ת קבלת מידע ודיוורים מהעמותה. מטרת ההרשמה היא שמירה על קשר, תזכורת ההתחייבות והפצת פעילות העמותה, ללא תשלום."
            />
            {status === "error" && (
              <Alert severity="error">לא הצלחנו לשמור כרגע. אפשר גם לפנות ב-WhatsApp. ודאו שהשרת ומסד הנתונים מוגדרים.</Alert>
            )}
            <Button type="submit" variant="contained" disabled={status === "loading"}>
              קבלו את התחייבותי
            </Button>
          </Stack>
        )}
      </Section>
    </>
  );
}
