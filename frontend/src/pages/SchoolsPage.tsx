import { Alert, Button, Link, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { PageHeader, Section } from "../components/Section";
import { track } from "../lib/analytics";
import { submitForm } from "../lib/forms";
import { SITE } from "../lib/site";

const audiences = [
  { id: "elementary", label: "יסודי" },
  { id: "middle", label: "חטיבה" },
  { id: "high", label: "תיכון" },
  { id: "teachers", label: "מורים/ות" },
  { id: "parents", label: "הורים" },
  { id: "admin", label: "הנהלה / רשות" },
];

export function SchoolsPage() {
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
      <PageHeader title="הופכים את בית הספר למרחב בטוח יותר" />
      <Section>
        <Typography sx={{ mb: 2 }}>
          באתר הקיים מופיעות סדנאות חינוכיות בבתי ספר וחלוקת מוצרים. המכירות בחנות מאפשרות להמשיך לחלק מוצרים בחינם למוסדות חינוך.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          אין כאן מחירון או עדויות שלא פורסמו. בחרו מי אתם — ונחזור אליכם עם הפרטים האמיתיים של התוכנית.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap" }}>
          {audiences.map((a) => (
            <Button key={a.id} variant={audience === a.id ? "contained" : "outlined"} onClick={() => setAudience(a.id)}>
              {a.label}
            </Button>
          ))}
        </Stack>
        {status === "ok" ? (
          <Alert severity={saved ? "success" : "warning"}>
            {saved ? "הפנייה נקלטה." : "השמירה לשרת נכשלה — פנו ב-WhatsApp 054-3644512."}
          </Alert>
        ) : (
          <Stack component="form" spacing={2} sx={{ maxWidth: 480 }} onSubmit={onSubmit}>
            <TextField required name="name" label="שם" />
            <TextField required name="role" label="תפקיד" key={audience} defaultValue={audiences.find((a) => a.id === audience)?.label} />
            <TextField required name="school" label="בית ספר / רשות" />
            <TextField required name="phone" label="טלפון" />
            <TextField required name="email" type="email" label="אימייל" />
            <TextField name="message" label="פרטים נוספים" multiline minRows={3} />
            <Button type="submit" variant="contained" disabled={status === "loading"}>
              הזמינו פעילות לבית הספר
            </Button>
            <Button href={`${SITE.wcOrigin}/product/schools/`} variant="text">
              חלוקת צמידים לבתי ספר (בחנות הקיימת)
            </Button>
          </Stack>
        )}
        <Typography sx={{ mt: 4, fontWeight: 700 }}>צריכים כמות גדולה?</Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          סיטונאות והזמנות לקבוצה — בלי לעבור בקופה הרגילה אם התהליך אצלכם אחר.
        </Typography>
        <Link href={`${SITE.wcOrigin}/wholesale/`}>לסיטונאות בחנות הקיימת</Link>
      </Section>
    </>
  );
}
