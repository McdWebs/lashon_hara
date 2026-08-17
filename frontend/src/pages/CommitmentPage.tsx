import { Alert, Checkbox, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { CommitmentSuccess } from "../components/CommitmentSuccess";
import { LoadingButton } from "../components/States";
import { ShareCard } from "../components/ShareCard";
import { PageHeader, Section } from "../components/Section";
import { track } from "../lib/analytics";
import {
  fetchCommitmentStatus,
  getStoredCommitment,
  storeCommitment,
} from "../lib/commitment";
import { submitForm } from "../lib/forms";
import { fetchCommitmentCount } from "../lib/stats";

const oath = [
  "אני מתחייב/ת בזאת להימנע מהפצת לשון הרע ודברי רכילות.",
  "אני מתחייב/ת לשמור על שיח סובלני ומכבד, לדון בדרכי נועם, להביע התנגדות בצורה עניינית שאינה פוגענית.",
  "אני מתחייב/ת להפיץ את המסר בסביבתי, לעצור שיחות שעלולות להגיע ללשון הרע, בפני ומאחורי גבו של אחר.",
  "אני מתחייב/ת לעשות כל שביכולתי כדי לנקות את החברה שלנו מביוש (שיימינג), בריונות, אלימות, הסתה, הכללה (סטריאוטיפים), החרמות והלבנת פני אחר.",
];

export function CommitmentPage() {
  const [status, setStatus] = useState<"form" | "loading" | "done">("form");
  const [saved, setSaved] = useState(true);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [signerNumber, setSignerNumber] = useState<number | undefined>();
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    const stored = getStoredCommitment();
    if (!stored) return;

    setFirstName(stored.firstName);
    setAlreadySigned(true);
    setStatus("done");
    void fetchCommitmentCount().then(setSignerNumber);
  }, []);

  async function showAlreadySigned(name: string, email: string) {
    setFirstName(name);
    setAlreadySigned(true);
    setStatus("done");
    storeCommitment({ email, firstName: name });
    setSignerNumber(await fetchCommitmentCount());
  }

  async function onEmailBlur(email: string) {
    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setEmailNotice(null);
      return;
    }

    setCheckingEmail(true);
    const result = await fetchCommitmentStatus(trimmed);
    setCheckingEmail(false);

    if (result.signed) {
      setEmailNotice("כתובת האימייל הזו כבר חתמה על ההתחייבות.");
      await showAlreadySigned(result.firstName ?? firstName, trimmed);
      return;
    }

    setEmailNotice(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track("commitment_started");
    const form = new FormData(e.currentTarget);
    const name = String(form.get("firstName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    setFirstName(name);
    setStatus("loading");

    const existing = await fetchCommitmentStatus(email);
    if (existing.signed) {
      await showAlreadySigned(existing.firstName ?? name, email);
      track("commitment_completed", { saved: false, duplicate: true });
      return;
    }

    const result = await submitForm("commitment", "/join/commitment", {
      firstName: name,
      phone: form.get("phone"),
      email,
      consent: form.get("consent") === "on",
    });

    if (result.error === "already_signed") {
      await showAlreadySigned(result.firstName ?? name, email);
      track("commitment_completed", { saved: false, duplicate: true });
      return;
    }

    setSaved(result.saved);
    if (result.saved) {
      storeCommitment({ email, firstName: name });
      setSignerNumber(await fetchCommitmentCount());
    }
    setAlreadySigned(false);
    track("commitment_completed", { saved: result.saved });
    setStatus("done");
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
        {status === "done" ? (
          <Stack spacing={3} sx={{ maxWidth: 480, mx: "auto" }}>
            {!saved && !alreadySigned && (
              <Alert severity="warning">
                הכרטיס מוכן לשיתוף, אבל השמירה לתיבת העמותה נכשלה (חסר Mongo או הגדרות מייל). שלחו גם ב-WhatsApp כדי שלא נפספס.
              </Alert>
            )}
            {alreadySigned && (
              <Alert severity="info">
                {emailNotice ?? "כבר רשמנו את ההתחייבות שלך — אין צורך לחתום שוב."}
              </Alert>
            )}
            <CommitmentSuccess
              firstName={firstName}
              signerNumber={signerNumber}
              alreadySigned={alreadySigned}
            />
            <ShareCard firstName={firstName} signerNumber={signerNumber} />
          </Stack>
        ) : (
          <Stack component="form" spacing={2} sx={{ maxWidth: 480, mx: "auto" }} onSubmit={onSubmit}>
            <TextField required name="firstName" label="שם פרטי" autoComplete="given-name" />
            <TextField required name="phone" label="מספר טלפון" autoComplete="tel" />
            <TextField
              required
              name="email"
              type="email"
              label="כתובת אימייל"
              autoComplete="email"
              onBlur={(e) => void onEmailBlur(e.target.value)}
              error={Boolean(emailNotice)}
              helperText={checkingEmail ? "בודקים אם כבר חתמת..." : emailNotice ?? undefined}
            />
            <FormControlLabel
              control={<Checkbox name="consent" />}
              label="אני מאשר/ת קבלת מידע ודיוורים מהעמותה. מטרת ההרשמה היא שמירה על קשר, תזכורת ההתחייבות והפצת פעילות העמותה, ללא תשלום."
              sx={{ alignItems: "flex-start", "& .MuiFormControlLabel-label": { fontSize: "0.8rem", lineHeight: 1.5, color: "text.secondary" } }}
            />
            <LoadingButton type="submit" variant="contained" loading={status === "loading"}>
              קבלו את התחייבותי
            </LoadingButton>
          </Stack>
        )}
      </Section>
    </>
  );
}
