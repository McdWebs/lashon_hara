import { Alert, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { ShareCard } from "../components/ShareCard";
import { PageHeader, Section } from "../components/Section";
import { track } from "../lib/analytics";
import { submitForm } from "../lib/forms";
import { MEDIA } from "../lib/media";

const oath = [
  "אני מתחייב/ת בזאת להימנע מהפצת לשון הרע ודברי רכילות.",
  "אני מתחייב/ת לשמור על שיח סובלני ומכבד, לדון בדרכי נועם, להביע התנגדות בצורה עניינית שאינה פוגענית.",
  "אני מתחייב/ת להפיץ את המסר בסביבתי, לעצור שיחות שעלולות להגיע ללשון הרע, בפני ומאחורי גבו של אחר.",
  "אני מתחייב/ת לעשות כל שביכולתי כדי לנקות את החברה שלנו מביוש (שיימינג), בריונות, אלימות, הסתה, הכללה (סטריאוטיפים), החרמות והלבנת פני אחר.",
];

export function CommitmentPage() {
  const [status, setStatus] = useState<"form" | "loading" | "done">("form");
  const [saved, setSaved] = useState(true);
  const [firstName, setFirstName] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track("commitment_started");
    const form = new FormData(e.currentTarget);
    const name = String(form.get("firstName") ?? "");
    setFirstName(name);
    setStatus("loading");
    const result = await submitForm("commitment", "/join/commitment", {
      firstName: name,
      phone: form.get("phone"),
      email: form.get("email"),
      consent: form.get("consent") === "on",
    });
    setSaved(result.saved);
    track("commitment_completed", { saved: result.saved });
    setStatus("done");
  }

  return (
    <>
      <PageHeader title="השינוי מתחיל בי" image={MEDIA.hoodie} imageAlt="קפוצ׳ון עם המשפט" />
      <Section>
        {oath.map((line) => (
          <Typography key={line} sx={{ mb: 2 }}>
            {line}
          </Typography>
        ))}
        {status === "done" ? (
          <Stack spacing={2} sx={{ maxWidth: 480, mx: "auto" }}>
            {!saved && (
              <Alert severity="warning">
                הכרטיס מוכן לשיתוף, אבל השמירה לתיבת העמותה נכשלה (חסר Mongo/SMTP). שלחו גם ב-WhatsApp כדי שלא נפספס.
              </Alert>
            )}
            <ShareCard firstName={firstName} />
          </Stack>
        ) : (
          <Stack component="form" spacing={2} sx={{ maxWidth: 480, mx: "auto" }} onSubmit={onSubmit}>
            <TextField required name="firstName" label="שם פרטי" autoComplete="given-name" />
            <TextField required name="phone" label="מספר טלפון" autoComplete="tel" />
            <TextField required name="email" type="email" label="כתובת אימייל" autoComplete="email" />
            <FormControlLabel
              control={<Checkbox name="consent" />}
              label="אני מאשר/ת קבלת מידע ודיוורים מהעמותה. מטרת ההרשמה היא שמירה על קשר, תזכורת ההתחייבות והפצת פעילות העמותה, ללא תשלום."
              sx={{ alignItems: "flex-start", "& .MuiFormControlLabel-label": { fontSize: "0.8rem", lineHeight: 1.5, color: "text.secondary" } }}
            />
            <Button type="submit" variant="contained" disabled={status === "loading"}>
              קבלו את התחייבותי
            </Button>
          </Stack>
        )}
      </Section>
    </>
  );
}
