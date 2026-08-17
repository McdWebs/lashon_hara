import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { useState } from "react";
import { AmbassadorCarousel } from "../components/AmbassadorCarousel";
import { CityAutocomplete } from "../components/CityAutocomplete";
import { PageHeader, Section } from "../components/Section";
import { LoadingButton } from "../components/States";
import { useLocale } from "../i18n/useLocale";
import type { Lang } from "../i18n/locale";
import { MOCK_AMBASSADORS } from "../lib/ambassadors";
import { track } from "../lib/analytics";
import { submitForm } from "../lib/forms";

type ActivityItem = {
  icon: SvgIconComponent;
  title: Record<Lang, string>;
  body: Record<Lang, string>;
};

const ACTIVITIES: ActivityItem[] = [
  {
    icon: VolunteerActivismOutlinedIcon,
    title: { he: "חלוקות בשטח", en: "On-the-ground distributions" },
    body: {
      he: "צמידים, מדבקות וחומרים — בבתי ספר, אירועים וקהילות.",
      en: "Bracelets, stickers, and materials at schools, events, and community gatherings.",
    },
  },
  {
    icon: ChatOutlinedIcon,
    title: { he: "שיח נקי ברשת", en: "Healthier online discourse" },
    body: {
      he: "להזכיר את המשפט בקבוצות, לעצור ביוש לפני שהוא מתפשט.",
      en: "Bring the slogan into group chats and stop gossip before it spreads.",
    },
  },
  {
    icon: CampaignOutlinedIcon,
    title: { he: "הפצת המסר", en: "Spreading the message" },
    body: {
      he: "תוכן, שיח בקהילה, וחיבור בין אנשים סביב ערך משותף.",
      en: "Content, community conversations, and connecting people around a shared value.",
    },
  },
];

function AmbassadorActivityCard({ item }: { item: ActivityItem }) {
  const { lang } = useLocale();
  const Icon = item.icon;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        minWidth: 0,
        bgcolor: "background.paper",
        transition: "border-color 0.15s ease, transform 0.15s ease",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>
        <Box
          sx={{
            width: { xs: 36, sm: 48 },
            height: { xs: 36, sm: 48 },
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(237, 27, 36, 0.08)",
            mb: { xs: 1, sm: 2 },
          }}
        >
          <Icon sx={{ fontSize: { xs: 20, sm: 26 }, color: "primary.main" }} aria-hidden />
        </Box>
        <Typography variant="h3" sx={{ fontSize: { xs: "0.78rem", sm: "0.92rem", md: "1.05rem" }, mb: 0.5, lineHeight: 1.35 }}>
          {item.title[lang]}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ fontSize: { xs: "0.72rem", sm: "0.85rem", md: "0.92rem" }, lineHeight: 1.5 }}
        >
          {item.body[lang]}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function AmbassadorsPage() {
  const { lang } = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [saved, setSaved] = useState(true);
  const [city, setCity] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track("ambassador_application_started");
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    const result = await submitForm(
      "ambassador",
      "/join/ambassadors",
      Object.fromEntries(form.entries()),
    );
    setSaved(result.saved);
    track("ambassador_application_completed", { saved: result.saved });
    setStatus("ok");
  }

  return (
    <>
      <PageHeader
        title={
          lang === "en" ? "Join the ambassador team" : "הצטרפו לנבחרת השגרירים"
        }
      >
        <Typography sx={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
          {lang === "en"
            ? "Volunteers who help at distributions, improve discourse online, and carry the message forward."
            : "מתנדבים שעוזרים בחלוקות, מנקים את השיח ברשת, ומפיצים את המסר."}
        </Typography>
      </PageHeader>

      <Section wide>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: "1.4rem", md: "1.75rem" }, mb: 2 }}
        >
          {lang === "en" ? "What ambassadors do" : "מה שגרירים עושים"}
        </Typography>
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 4, md: 5 } }}>
          {ACTIVITIES.map((item) => (
            <Grid key={item.title.he} size={4}>
              <AmbassadorActivityCard item={item} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: "1.4rem", md: "1.75rem" }, mb: 1 }}
          >
            {lang === "en" ? "Ambassadors in action" : "שגרירים בשטח"}
          </Typography>
        </Box>

        <Box sx={{ mb: { xs: 5, md: 6 } }}>
          <AmbassadorCarousel ambassadors={MOCK_AMBASSADORS} />
        </Box>

        <Box sx={{ maxWidth: 520, mx: "auto" }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.35rem", md: "1.6rem" },
              mb: 2,
              textAlign: "center",
            }}
          >
            {lang === "en" ? "Want to join?" : "רוצים להצטרף?"}
          </Typography>

          {status === "ok" ? (
            <Alert severity={saved ? "success" : "warning"}>
              {saved
                ? lang === "en"
                  ? "Application sent."
                  : "הפנייה נשלחה."
                : lang === "en"
                  ? "Save failed — WhatsApp 054-3644512."
                  : "השמירה נכשלה — כתבו ב-WhatsApp 054-3644512."}
            </Alert>
          ) : (
            <Stack component="form" spacing={2} onSubmit={onSubmit}>
              <TextField
                required
                name="name"
                label={lang === "en" ? "Name" : "שם"}
              />
              <TextField
                required
                name="phone"
                label={lang === "en" ? "Phone" : "טלפון"}
              />
              <TextField
                required
                name="email"
                type="email"
                label={lang === "en" ? "Email" : "אימייל"}
              />
              <CityAutocomplete
                name="city"
                label={lang === "en" ? "City / locality" : "יישוב"}
                value={city}
                onChange={setCity}
              />
              <TextField
                name="note"
                label={
                  lang === "en" ? "Why I want to join" : "למה אני רוצה להצטרף"
                }
                multiline
                minRows={3}
              />
              <LoadingButton
                type="submit"
                variant="contained"
                loading={status === "loading"}
              >
                {lang === "en"
                  ? "I want to be an ambassador"
                  : "אני רוצה להיות שגריר/ה"}
              </LoadingButton>
            </Stack>
          )}
        </Box>
      </Section>
    </>
  );
}
