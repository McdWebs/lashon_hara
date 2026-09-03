import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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
import { SITE } from "../lib/site";
import { fetchCommitmentCount } from "../lib/stats";

const oath = [
  "אני מתחייב/ת בזאת להימנע מהפצת לשון הרע ודברי רכילות.",
  "אני מתחייב/ת לשמור על שיח סובלני ומכבד, לדון בדרכי נועם, להביע התנגדות בצורה עניינית שאינה פוגענית.",
  "אני מתחייב/ת להפיץ את המסר בסביבתי, לעצור שיחות שעלולות להגיע ללשון הרע, בפני ומאחורי גבו של אחר.",
  "אני מתחייב/ת לעשות כל שביכולתי כדי לנקות את החברה שלנו מביוש (שיימינג), בריונות, אלימות, הסתה, הכללה (סטריאוטיפים), החרמות והלבנת פני אחר.",
];

const WA_GREEN = "#25D366";

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
      <PageHeader title="השינוי מתחיל בי">
        <Typography sx={{ fontSize: "1.05rem", lineHeight: 1.75 }}>
          קראו את נוסח ההתחייבות, חתמו למטה — והצטרפו לקהילה שמפיצה את המסר.
        </Typography>
      </PageHeader>
      <Section>
        <Box
          sx={{
            mb: { xs: 4, md: 5 },
            p: { xs: 3, md: 4.5 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
            backgroundImage: `
              radial-gradient(circle at 92% 8%, rgba(237, 27, 36, 0.08) 0%, transparent 40%),
              linear-gradient(165deg, #FFFCF7 0%, #F4F1EA 100%)
            `,
            boxShadow: "0 12px 40px rgba(17, 17, 17, 0.04)",
          }}
        >
          <Box sx={{ width: 40, height: 3, bgcolor: "primary.main", mb: 2 }} />
          <Typography
            sx={{
              fontFamily: '"Secular One", Heebo, sans-serif',
              fontSize: { xs: "1.25rem", md: "1.45rem" },
              lineHeight: 1.25,
              mb: 0.75,
            }}
          >
            נוסח ההתחייבות
          </Typography>
          <Typography color="text.secondary" sx={{ mb: { xs: 3, md: 3.5 }, fontSize: "0.92rem", lineHeight: 1.6 }}>
            ארבעה סעיפים. התחייבות אחת.
          </Typography>

          <Stack spacing={{ xs: 2.25, md: 2.75 }} component="ol" sx={{ m: 0, p: 0, listStyle: "none" }}>
            {oath.map((line, index) => (
              <Box
                key={line}
                component="li"
                sx={{
                  display: "flex",
                  gap: { xs: 1.5, md: 2 },
                  alignItems: "flex-start",
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    mt: 0.15,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {index + 1}
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: "1.02rem", md: "1.08rem" },
                    lineHeight: 1.8,
                    fontWeight: 500,
                    borderInlineStart: "2px solid",
                    borderColor: "rgba(237, 27, 36, 0.28)",
                    pl: 1.75,
                  }}
                >
                  {line}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Box
            sx={{
              mt: { xs: 3.5, md: 4 },
              pt: { xs: 3, md: 3.5 },
              borderTop: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                mb: 2,
              }}
            >
              רוצים להיות חלק מהשגרירים?
            </Typography>
            <Button
              href={SITE.whatsappCommunity}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              size="large"
              startIcon={<WhatsAppIcon />}
              sx={{
                bgcolor: WA_GREEN,
                color: "#fff",
                px: 3.5,
                minHeight: 48,
                fontSize: "1rem",
                boxShadow: "0 8px 24px rgba(37, 211, 102, 0.28)",
                "&:hover": {
                  bgcolor: "#1ebe57",
                  boxShadow: "0 10px 28px rgba(37, 211, 102, 0.34)",
                },
              }}
            >
              הצטרפו לקהילה שלנו
            </Button>
          </Box>
        </Box>

        {status === "done" ? (
          <Stack spacing={2.5} sx={{ maxWidth: 920, mx: "auto" }}>
            {!saved && !alreadySigned && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                הכרטיס מוכן לשיתוף, אבל השמירה לתיבת העמותה נכשלה (חסר Mongo או הגדרות מייל). שלחו גם ב-WhatsApp כדי שלא נפספס.
              </Alert>
            )}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1.05fr)" },
                gap: 2.5,
                alignItems: "stretch",
              }}
            >
              <CommitmentSuccess
                firstName={firstName}
                signerNumber={signerNumber}
                alreadySigned={alreadySigned}
                notice={alreadySigned ? emailNotice : null}
              />
              <ShareCard firstName={firstName} signerNumber={signerNumber} />
            </Box>
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
