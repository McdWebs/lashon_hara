import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { LoadingButton } from "../components/States";
import { track } from "../lib/analytics";
import { submitForm } from "../lib/forms";
import { useLocale } from "../i18n/useLocale";
import { SCHOOLS_PRODUCT_ID } from "../lib/site";

const audiences = [
  { id: "elementary", label: "יסודי" },
  { id: "middle", label: "חטיבה" },
  { id: "high", label: "תיכון" },
  { id: "teachers", label: "מורים/ות" },
  { id: "parents", label: "הורים" },
  { id: "admin", label: "הנהלה / רשות" },
];

export function SchoolsPage() {
  const { loc } = useLocale();
  const [audience, setAudience] = useState("admin");
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [saved, setSaved] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track("school_contact_started", { audience });
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    const result = await submitForm("school", "/schools", {
      ...Object.fromEntries(form.entries()),
      audience,
    });
    setSaved(result.saved);
    track("school_contact_completed", { saved: result.saved });
    setStatus("ok");
  }

  return (
    <>
      <PageHeader title="הופכים את בית הספר למרחב בטוח יותר" singleLine />
      <Section>
        <Typography sx={{ mb: 2 }}>
          סדנאות חינוכיות בבתי ספר וחלוקת מוצרים. המכירות בחנות מאפשרות להמשיך
          לחלק מוצרים בחינם למוסדות חינוך.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mb: 3, flexWrap: "wrap" }}
        >
          <Button
            component={RouterLink}
            to={loc(`/shop/product/${SCHOOLS_PRODUCT_ID}`)}
            variant="outlined"
          >
            חלוקת צמידים לבתי ספר
          </Button>
          <Button
            component={RouterLink}
            to={loc("/wholesale")}
            variant="outlined"
          >
            סיטונאות
          </Button>
          <Button
            component={RouterLink}
            to={loc("/request-a-quote")}
            variant="outlined"
          >
            הצעת מחיר
          </Button>
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          בחרו מי אתם — ונחזור אליכם עם הפרטים של התוכנית.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap" }}>
          {audiences.map((a) => (
            <Button
              key={a.id}
              variant={audience === a.id ? "contained" : "outlined"}
              onClick={() => setAudience(a.id)}
            >
              {a.label}
            </Button>
          ))}
        </Stack>
        {status === "ok" ? (
          <Alert severity={saved ? "success" : "warning"}>
            {saved
              ? "הפנייה נקלטה."
              : "השמירה לשרת נכשלה — פנו ב-WhatsApp 054-3644512."}
          </Alert>
        ) : (
          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              maxWidth: { xs: 480, sm: 800 },
            }}
          >
            <TextField required name="name" label="שם" />
            <TextField
              required
              name="role"
              label="תפקיד"
              key={audience}
              defaultValue={audiences.find((a) => a.id === audience)?.label}
            />
            <TextField required name="school" label="בית ספר / רשות" />
            <TextField required name="phone" label="טלפון" />
            <TextField required name="email" type="email" label="אימייל" />
            <TextField
              name="message"
              label="פרטים נוספים"
              multiline
              minRows={3}
              sx={{ gridColumn: { sm: "1 / -1" } }}
            />
            <LoadingButton
              type="submit"
              variant="contained"
              loading={status === "loading"}
              sx={{
                gridColumn: { sm: "1 / -1" },
                justifySelf: { sm: "start" },
              }}
            >
              הזמינו פעילות לבית הספר
            </LoadingButton>
          </Box>
        )}
        <Typography sx={{ mt: 4, fontWeight: 700 }}>
          צריכים כמות גדולה?
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          סיטונאות והזמנות לקבוצה — בלי לעבור בקופה הרגילה אם התהליך אצלכם אחר.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            component={RouterLink}
            to={loc("/wholesale")}
            variant="outlined"
          >
            סיטונאות
          </Button>
          <Button component={RouterLink} to={loc("/custom")} variant="outlined">
            מוצרים לאירוע
          </Button>
        </Stack>
      </Section>
    </>
  );
}
