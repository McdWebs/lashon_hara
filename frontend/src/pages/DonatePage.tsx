import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { LoadingButton } from "../components/States";
import { PageHeader, Section } from "../components/Section";
import { useLocale } from "../i18n/useLocale";
import { track } from "../lib/analytics";
import { submitForm } from "../lib/forms";
import { MEDIA } from "../lib/media";
import { SITE, waLink } from "../lib/site";

const PRESET_AMOUNTS = [72, 180, 360, 720] as const;

const IMPACT = [
  {
    icon: SchoolOutlinedIcon,
    title: "חלוקה חינם לבתי ספר",
    body: "תרומה ישירה מאפשרת לחלק צמידים ומוצרים עם המסר — בחינם — למוסדות חינוך בכל הארץ.",
  },
  {
    icon: VolunteerActivismOutlinedIcon,
    title: "סדנאות ותוכניות חינוכיות",
    body: "העמותה מפעילה תוכניות מקצועיות לילדים ובני נוער, בגנים, בתי ספר ותנועות נוער.",
  },
  {
    icon: FavoriteOutlinedIcon,
    title: "הפצת מסר של כבוד",
    body: "כל שקל תורם לתנועה שמזכירה לנו, יום אחר יום, שמילים יכולות לפגוע — וגם לרפא.",
  },
] as const;

function ImpactCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof SchoolOutlinedIcon;
  title: string;
  body: string;
}) {
  return (
    <Card sx={{ height: "100%", bgcolor: "background.paper" }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Icon
          sx={{ fontSize: 36, color: "primary.main", mb: 1.5 }}
          aria-hidden
        />
        <Typography variant="h3" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ lineHeight: 1.7, fontSize: "0.98rem" }}
        >
          {body}
        </Typography>
      </CardContent>
    </Card>
  );
}

function DonateForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [saved, setSaved] = useState(true);
  const [preset, setPreset] = useState<number | "custom">(180);
  const [customAmount, setCustomAmount] = useState("");

  const displayAmount = preset === "custom" ? customAmount : String(preset);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (displayAmount.trim()) {
      form.set("amount", displayAmount.trim());
    }
    setStatus("loading");
    const result = await submitForm(
      "donate",
      "/donate",
      Object.fromEntries(form.entries()),
    );
    setSaved(result.saved);
    track("donation_started");
    setStatus("ok");
  }

  if (status === "ok") {
    return (
      <Card sx={{ overflow: "hidden" }}>
        <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
          <FavoriteOutlinedIcon
            sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
          />
          <Typography variant="h3" sx={{ mb: 1.5 }}>
            תודה רבה!
          </Typography>
          <Typography
            sx={{ mb: 2, lineHeight: 1.75, maxWidth: 420, mx: "auto" }}
          >
            {saved
              ? "הפנייה התקבלה. נחזור אליכם בהקדם עם אפשרויות תרומה — העברה בנקאית, ביט או אחר."
              : "השמירה לשרת נכשלה — אבל אפשר להשלים את התרומה ישירות ב-WhatsApp."}
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ justifyContent: "center", mt: 3 }}
          >
            <Button
              href={waLink(
                `שלום, שלחתי בקשת תרומה${displayAmount ? ` בסך ${displayAmount} ש״ח` : ""}. אשמח להמשיך.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<WhatsAppIcon />}
            >
              המשיכו ב-WhatsApp
            </Button>
            <Button
              component={RouterLink}
              to="/join/commitment"
              variant="outlined"
            >
              גם אני מתחייב/ת
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          px: { xs: 2.5, md: 3 },
          py: 2,
          bgcolor: "rgba(237, 27, 36, 0.06)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h3">בחרו סכום</Typography>
        <Typography
          color="text.secondary"
          sx={{ mt: 0.5, fontSize: "0.92rem" }}
        >
          כל סכום עוזר. אפשר גם לבחור סכום אחר.
        </Typography>
      </Box>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2.5, flexWrap: "wrap", gap: 1 }}
        >
          {PRESET_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              variant={preset === amount ? "contained" : "outlined"}
              onClick={() => {
                setPreset(amount);
                setCustomAmount("");
              }}
              sx={{ minWidth: 72, px: 2 }}
            >
              ₪{amount}
            </Button>
          ))}
          <Button
            variant={preset === "custom" ? "contained" : "outlined"}
            onClick={() => setPreset("custom")}
            sx={{ px: 2 }}
          >
            סכום אחר
          </Button>
        </Stack>

        {preset === "custom" && (
          <TextField
            fullWidth
            label="סכום בשקלים"
            placeholder="למשל 500"
            value={customAmount}
            onChange={(e) =>
              setCustomAmount(e.target.value.replace(/[^\d]/g, ""))
            }
            inputMode="numeric"
            sx={{ mb: 2.5 }}
          />
        )}

        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField required name="name" label="שם מלא" autoComplete="name" />
          <TextField required name="phone" label="טלפון" autoComplete="tel" />
          <TextField
            required
            name="email"
            type="email"
            label="אימייל"
            autoComplete="email"
            sx={{ gridColumn: { sm: "1 / -1" } }}
          />
          <TextField
            name="message"
            label="הערות (אופציונלי)"
            placeholder="למשל: תרומה לזכות..., או בקשה לקבלה"
            multiline
            minRows={2}
            sx={{ gridColumn: { sm: "1 / -1" } }}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            loading={status === "loading"}
            disabled={preset === "custom" && !customAmount.trim()}
            sx={{ gridColumn: { sm: "1 / -1" }, py: 1.5, fontSize: "1.05rem" }}
          >
            {status === "loading" ? "שולחים…" : "אני רוצה לתרום"}
          </LoadingButton>
        </Box>
      </CardContent>
    </Card>
  );
}

export function DonatePage() {
  const { loc } = useLocale();

  return (
    <>
      <PageHeader title="יחד ממשיכים את המסר">
        <Typography sx={{ fontSize: "1.05rem", lineHeight: 1.75 }}>
          תרומה לעמותת &quot;לשון הרע לא מדבר אלי&quot; מחזקת חינוך, חלוקה לבתי
          ספר, והפצת תרבות שיח מכבד — בישראל ומחוצה לה.
        </Typography>
      </PageHeader>

      <Section muted wide>
        <Grid
          container
          spacing={{ xs: 3, md: 5 }}
          sx={{ alignItems: "flex-start" }}
        >
          <Grid size={{ xs: 12, md: 7 }}>
            <DonateForm />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h3" sx={{ mb: 1.5 }}>
                  עוד דרכים לתמוך
                </Typography>

                <Card sx={{ mb: 2 }}>
                  <CardContent
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "flex-start",
                      p: 2.5,
                    }}
                  >
                    <StorefrontOutlinedIcon
                      sx={{ color: "primary.main", fontSize: 32, mt: 0.25 }}
                    />
                    <Box>
                      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                        קנייה מהחנות
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: "0.95rem", lineHeight: 1.65, mb: 1.5 }}
                      >
                        המכירות מאפשרות להמשיך ולחלק מוצרים בחינם לבתי ספר — וגם
                        ללבוש את המסר.
                      </Typography>
                      <Button
                        component={RouterLink}
                        to={loc("/shop")}
                        variant="outlined"
                        size="small"
                      >
                        לחנות
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "flex-start",
                      p: 2.5,
                    }}
                  >
                    <WhatsAppIcon
                      sx={{ color: "#25D366", fontSize: 32, mt: 0.25 }}
                    />
                    <Box>
                      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                        WhatsApp ישיר
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: "0.95rem", lineHeight: 1.65, mb: 1.5 }}
                      >
                        מעדיפים לדבר עם מישהו? שלחו הודעה ונחזור אליכם —{" "}
                        {SITE.supportHours}.
                      </Typography>
                      <Button
                        href={waLink("שלום, אני מעוניין/ת לתרום לעמותה")}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        size="small"
                        startIcon={<WhatsAppIcon />}
                      >
                        054-3644512
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box
                  component="img"
                  src={MEDIA.bracelets}
                  alt="צמידים עם המסר לשון הרע לא מדבר אליי"
                  sx={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <Box sx={{ p: 2.5, bgcolor: "background.paper" }}>
                  <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                    מאז 2007
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: "0.92rem", lineHeight: 1.65 }}
                  >
                    העמותה פועלת לחיזוק תרבות שיח חיובית — מיליוני צמידים,
                    סדנאות בבתי ספר, וקהילת שגרירים בכל הארץ.
                  </Typography>
                </Box>
              </Box>

              <Alert
                severity="info"
                sx={{ "& .MuiAlert-message": { lineHeight: 1.65 } }}
              >
                העמותה רשומה כעמותה לפי דין. לבקשת קבלה — ציינו בטופס או
                ב-WhatsApp.
              </Alert>
            </Stack>
          </Grid>
        </Grid>
      </Section>

      <Section wide>
        <Typography variant="h3" sx={{ mb: 3 }}>
          לאן הולכת התרומה?
        </Typography>
        <Grid container spacing={2}>
          {IMPACT.map((item) => (
            <Grid key={item.title} size={{ xs: 12, md: 4 }}>
              <ImpactCard {...item} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              רוצים להביא את המסר לבית הספר?
            </Typography>
            <Typography color="text.secondary">
              סדנאות, חלוקת צמידים ותוכניות חינוכיות — בחינם למוסדות.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to={loc("/schools")}
            variant="outlined"
          >
            הזמנת פעילות לבית ספר
          </Button>
        </Stack>
      </Section>
    </>
  );
}
