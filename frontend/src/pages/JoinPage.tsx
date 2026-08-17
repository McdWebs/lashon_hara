import EmojiPeopleOutlinedIcon from "@mui/icons-material/EmojiPeopleOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import RedeemOutlinedIcon from "@mui/icons-material/RedeemOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { useLocale } from "../i18n/useLocale";
import type { Lang } from "../i18n/locale";
import { track, type AnalyticsEvent } from "../lib/analytics";

type JoinPath = {
  icon: SvgIconComponent;
  title: Record<Lang, string>;
  body: Record<Lang, string>;
  cta: Record<Lang, string>;
  to: string;
  featured?: boolean;
  trackEvent?: AnalyticsEvent;
};

const JOIN_PATHS: JoinPath[] = [
  {
    icon: HowToRegOutlinedIcon,
    title: { he: "התחייבות אישית", en: "Personal commitment" },
    body: { he: "השינוי מתחיל בי — נוסח ההתחייבות מהאתר, לשיתוף אחרי החתימה.", en: "Change starts with me — the site oath, ready to share after you sign." },
    cta: { he: "להתחייב", en: "Take the oath" },
    to: "/join/commitment",
    featured: true,
    trackEvent: "cta_hero_join_clicked",
  },
  {
    icon: SchoolOutlinedIcon,
    title: { he: "לבית הספר", en: "For school" },
    body: { he: "סדנאות, חלוקת צמידים וחומרים לכיתות.", en: "Workshops, bracelet distributions, and classroom materials." },
    cta: { he: "להזמין פעילות", en: "Book a program" },
    to: "/schools",
    trackEvent: "cta_school_clicked",
  },
  {
    icon: EmojiPeopleOutlinedIcon,
    title: { he: "נבחרת השגרירים", en: "Ambassador team" },
    body: { he: "לעזור בחלוקות ולנקות את השיח ברשת.", en: "Help at distributions and improve discourse online." },
    cta: { he: "להצטרף כשגריר/ה", en: "Join as ambassador" },
    to: "/join/ambassadors",
  },
  {
    icon: RedeemOutlinedIcon,
    title: { he: "תרומה", en: "Donate" },
    body: { he: "לתמוך בחלוקה חינם של מוצרים לבתי ספר.", en: "Support free product distribution to schools." },
    cta: { he: "לתרום", en: "Donate" },
    to: "/donate",
    trackEvent: "cta_donate_clicked",
  },
  {
    icon: StorefrontOutlinedIcon,
    title: { he: "חנות", en: "Shop" },
    body: { he: "ללבוש את המשפט ולהפיץ את המסר.", en: "Wear the sentence and spread the message." },
    cta: { he: "לחנות", en: "Go to shop" },
    to: "/shop",
    trackEvent: "cta_shop_clicked",
  },
];

function JoinPathCard({ item, horizontal }: { item: JoinPath; horizontal?: boolean }) {
  const { loc, lang } = useLocale();
  const Icon = item.icon;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        bgcolor: item.featured ? "rgba(237, 27, 36, 0.04)" : "background.paper",
        borderColor: item.featured ? "primary.main" : "divider",
        borderWidth: item.featured ? 2 : 1,
        transition: "border-color 0.15s ease, transform 0.15s ease",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={loc(item.to)}
        onClick={() => item.trackEvent && track(item.trackEvent)}
        sx={{ height: "100%", alignItems: "stretch", p: 0 }}
      >
        <CardContent
          sx={{
            width: "100%",
            p: { xs: 2.5, md: 3 },
            display: horizontal ? { sm: "flex" } : "block",
            gap: horizontal ? { sm: 3 } : 0,
            alignItems: horizontal ? { sm: "flex-start" } : "stretch",
          }}
        >
          <Icon
            sx={{
              fontSize: horizontal ? { xs: 40, sm: 48 } : 40,
              color: "primary.main",
              mb: horizontal ? { xs: 1.5, sm: 0 } : 1.5,
              flexShrink: 0,
            }}
            aria-hidden
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h3" sx={{ fontSize: horizontal ? { xs: "1.1rem", sm: "1.25rem" } : "1.1rem" }}>
              {item.title[lang]}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{
                mt: 0.75,
                mb: horizontal ? { xs: 2, sm: 1.5 } : 2,
                fontSize: "0.95rem",
                lineHeight: 1.6,
                maxWidth: horizontal ? 560 : "none",
              }}
            >
              {item.body[lang]}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                color: item.featured ? "primary.main" : "text.primary",
                fontSize: "0.95rem",
              }}
            >
              {item.cta[lang]} ←
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function JoinPage() {
  const { lang } = useLocale();
  const featured = JOIN_PATHS.find((p) => p.featured)!;
  const rest = JOIN_PATHS.filter((p) => !p.featured);

  return (
    <>
      <PageHeader
        title={lang === "en" ? "How would you like to take part?" : "איך תרצו להיות שותפים?"}
      >
        <Typography sx={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
          {lang === "en"
            ? "Change starts with one sentence. Pick the path that fits you."
            : "שינוי מתחיל במילה אחת. בחרו את הדרך שמתאימה לכם."}
        </Typography>
      </PageHeader>
      <Section wide>
        <Box sx={{ mb: 3 }}>
          <JoinPathCard item={featured} horizontal />
        </Box>

        <Grid container spacing={2}>
          {rest.map((item) => (
            <Grid key={item.to} size={{ xs: 12, sm: 6, md: 3 }}>
              <JoinPathCard item={item} />
            </Grid>
          ))}
        </Grid>
      </Section>
    </>
  );
}
