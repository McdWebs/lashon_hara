import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Box, Button, Card, CardActionArea, CardContent, Link, Stack, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { Band } from "../components/Band";
import { ImageCarousel } from "../components/ImageCarousel";
import { useLocale } from "../i18n/useLocale";
import { track, type AnalyticsEvent } from "../lib/analytics";
import { MEDIA, SHOP_SHOWCASE } from "../lib/media";

type PathItem = {
  to: string;
  icon: SvgIconComponent;
  title: { he: string; en: string };
  body: { he: string; en: string };
  trackEvent?: AnalyticsEvent;
  featured?: boolean;
};

function PathCard({ item, lang, loc }: { item: PathItem; lang: "he" | "en"; loc: (path: string) => string }) {
  const Icon = item.icon;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderColor: item.featured ? "primary.main" : "divider",
        borderWidth: item.featured ? 2 : 1,
        bgcolor: item.featured ? "rgba(237, 27, 36, 0.04)" : "background.paper",
        transition: "border-color 0.15s ease, transform 0.15s ease",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={loc(item.to)}
        onClick={() => item.trackEvent && track(item.trackEvent)}
        sx={{ height: "100%", alignItems: "flex-start", p: 0 }}
      >
        <CardContent sx={{ width: "100%", p: { xs: 2.5, md: 3 } }}>
          <Icon sx={{ fontSize: 36, color: "primary.main", mb: 1.5 }} aria-hidden />
          <Typography variant="h3" sx={{ fontSize: { xs: "1.05rem", md: "1.1rem" }, lineHeight: 1.35 }}>
            {item.title[lang]}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, fontSize: "0.92rem", lineHeight: 1.6 }}>
            {item.body[lang]}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 2, alignItems: "center", color: "primary.main" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
              {lang === "en" ? "Continue" : "המשך"}
            </Typography>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16, transform: lang === "en" ? "rotate(180deg)" : "none" }} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function HomePage() {
  const { loc, t, lang } = useLocale();

  const paths: PathItem[] = [
    {
      to: "/join/commitment",
      icon: HowToRegOutlinedIcon,
      title: { he: "אני רוצה להצטרף", en: "I want to join" },
      body: { he: "התחייבות אישית — ואז משתפים את המסר.", en: "A personal oath. Then share it." },
      trackEvent: "cta_hero_join_clicked",
      featured: true,
    },
    {
      to: "/schools",
      icon: SchoolOutlinedIcon,
      title: { he: "אני רוצה להביא את זה לבית הספר", en: "Bring it to school" },
      body: { he: "סדנאות, חלוקה לכיתות וחומרים חינוכיים.", en: "Workshops, classroom distribution, and materials." },
      trackEvent: "cta_school_clicked",
    },
    {
      to: "/join/ambassadors",
      icon: GroupsOutlinedIcon,
      title: { he: "אני רוצה להיות שגריר/ה", en: "Become an ambassador" },
      body: { he: "להפיץ את המסר בקהילה, בכיתה או ברשת.", en: "Spread the message in your community, class, or online." },
    },
    {
      to: "/donate",
      icon: VolunteerActivismOutlinedIcon,
      title: { he: "אני רוצה לעזור", en: "I want to help" },
      body: { he: "תרומה שמחזקת חינוך וחלוקה חינם לבתי ספר.", en: "Donations that fund education and free school distributions." },
      trackEvent: "cta_donate_clicked",
    },
    {
      to: "/shop",
      icon: StorefrontOutlinedIcon,
      title: { he: "אני רוצה להפיץ את המסר", en: "Spread the message" },
      body: { he: "צמידים, מדבקות ומוצרים מהקטלוג — והכנסות לחלוקה.", en: "Bracelets, stickers, and catalog products that fund distributions." },
      trackEvent: "cta_shop_clicked",
    },
  ];

  return (
    <>
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "100vh", md: "100vh" },
          bgcolor: "#111",
          color: "#fff",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <Box
          component="video"
          src={MEDIA.heroVideo}
          poster={MEDIA.hoodie}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            "@media (prefers-reduced-motion: reduce)": { display: "none" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(17,17,17,0.55)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "relative",
            px: { xs: 3, md: 8 },
            py: { xs: 6, md: 10 },
            maxWidth: 720,
          }}
        >
          <Typography component="h1" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            {t("slogan")}
          </Typography>
          <Typography sx={{ mt: 0, maxWidth: 440, fontSize: { xs: "1.05rem", md: "1.2rem" }, opacity: 0.92 }}>
            {t("heroSupport1")} {t("heroSupport2")}
            <br />
            {t("heroSupport3")}
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4, alignItems: { sm: "center" } }}>
            <Button
              size="large"
              variant="contained"
              component={RouterLink}
              to={loc("/join/commitment")}
              onClick={() => track("cta_hero_join_clicked")}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {t("ctaJoin")}
            </Button>
            <Link
              component={RouterLink}
              to={loc("/schools")}
              onClick={() => track("cta_school_clicked")}
              underline="always"
              color="inherit"
              sx={{
                fontWeight: 600,
                alignSelf: { xs: "center", sm: "auto" },
                textAlign: { xs: "center", sm: "inherit" },
              }}
            >
              {t("ctaSchool")}
            </Link>
          </Stack>
        </Box>
      </Box>

      <Band>
        <Typography variant="h2" sx={{ maxWidth: 720 }}>
          {lang === "en"
            ? "If you wouldn’t say it to their face — don’t say it behind their back."
            : "אם לא הייתם אומרים את זה בפני האדם — אל תגידו מאחורי גבו."}
        </Typography>
        <Typography sx={{ mt: 2, maxWidth: 640 }}>
          {lang === "en"
            ? "That is the test published on the current site. Gossip, even when true, shaming, mockery."
            : "זה המבחן שפורסם באתר. רכילות — גם אם הסיפור קרה — ביוש, לעג, הכללה."}
        </Typography>
        <Button component={RouterLink} to={loc("/message/quiz")} variant="outlined" sx={{ mt: 3 }}>
          {lang === "en" ? "Try a short exercise" : "תרגול קצר: האם זה לשון הרע?"}
        </Button>
      </Band>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
          bgcolor: "background.default",
        }}
      >
        <Box
          component="img"
          src={MEDIA.bracelets}
          alt={lang === "en" ? "Silicone bracelets with the slogan" : "צמידי סיליקון עם המשפט"}
          sx={{ width: "100%", height: { xs: 280, md: "100%" }, minHeight: { md: 420 }, objectFit: "cover" }}
        />
        <Box sx={{ px: { xs: 3, md: 8 }, py: { xs: 6, md: 8 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography variant="overline" sx={{ letterSpacing: 2, color: "primary.main" }}>
            2007
          </Typography>
          <Typography variant="h2">
            {lang === "en" ? "A sentence people wear." : "משפט שעונדים על היד."}
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 520 }}>
            {lang === "en"
              ? "Founded by David Halperin. Billboards, bracelets, hospitals, IDF bases, exhibitions — then an association for education."
              : "הוקם על ידי דוד הלפרין. שלטי חוצות, צמידים, בתי חולים, בסיסי צה״ל, תערוכות — ואחר כך עמותה לחינוך."}
          </Typography>
          <Button component={RouterLink} to={loc("/about")} variant="text" sx={{ mt: 2, alignSelf: "flex-start", px: 0 }}>
            {lang === "en" ? "Read the history" : "לקרוא את ההיסטוריה"}
          </Button>
        </Box>
      </Box>

      <Band tone="paper">
        <Box sx={{ width: 48, height: 3, bgcolor: "primary.main", mb: 2.5 }} />
        <Typography variant="h2" sx={{ mb: 1, maxWidth: 720 }}>
          {lang === "en" ? "Change starts with one word." : "שינוי מתחיל במילה אחת."}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: { xs: 3, md: 4 }, maxWidth: 560, lineHeight: 1.75 }}>
          {lang === "en"
            ? "If this speaks to you — pick how you want to take part."
            : "אם זה מדבר אליכם — בחרו איך להתחיל."}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {paths.map((p) => (
            <PathCard key={p.to} item={p} lang={lang} loc={loc} />
          ))}
        </Box>
        <Typography component="div" sx={{ mt: 3, color: "text.secondary", fontSize: "0.95rem" }}>
          <Box component="span" sx={{ display: { xs: "block", sm: "inline" } }}>
            {lang === "en" ? "Not sure where to start?" : "לא בטוחים מאיפה להתחיל?"}
          </Box>
          <Box component="span" sx={{ display: { xs: "block", sm: "inline" }, mt: { xs: 0.5, sm: 0 } }}>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              {" "}
            </Box>
            <Link component={RouterLink} to={loc("/message")} sx={{ fontWeight: 600 }}>
              {lang === "en" ? "Read the message" : "קראו את המסר"}
            </Link>
            {" · "}
            <Link component={RouterLink} to={loc("/message/quiz")} sx={{ fontWeight: 600 }}>
              {lang === "en" ? "Try the quiz" : "נסו את התרגול"}
            </Link>
          </Box>
        </Typography>
      </Band>

      <Band tone="dark">
        <Box sx={{ display: { xs: "block", sm: "none" }, mb: 4 }}>
          <ImageCarousel
            slides={SHOP_SHOWCASE.map((item) => ({
              src: item.src,
              alt: item.alt[lang],
            }))}
          />
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "grid" },
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 4,
          }}
        >
          {SHOP_SHOWCASE.map((item) => (
            <Box
              key={item.src}
              component="img"
              src={item.src}
              alt={item.alt[lang]}
              sx={{ width: "100%", height: 240, objectFit: "cover" }}
            />
          ))}
        </Box>
        <Typography variant="h2">
          {lang === "en" ? "The shop funds free distributions to schools." : "החנות מממנת חלוקה חינם לבתי ספר."}
        </Typography>
        <Button component={RouterLink} to={loc("/shop")} variant="contained" sx={{ mt: 3 }} onClick={() => track("cta_shop_clicked")}>
          {t("ctaShop")}
        </Button>
      </Band>

      <Band>
        <Typography variant="h2">{lang === "en" ? "The change starts with me" : "השינוי מתחיל בי"}</Typography>
        <Typography sx={{ mt: 2, maxWidth: 560 }}>
          {lang === "en"
            ? "I commit to avoid spreading lashon hara and gossip."
            : "אני מתחייב/ת בזאת להימנע מהפצת לשון הרע ודברי רכילות."}
        </Typography>
        <Button variant="contained" component={RouterLink} to={loc("/join/commitment")} sx={{ mt: 3 }}>
          {lang === "en" ? "Read the full oath" : "לקרוא את נוסח ההתחייבות"}
        </Button>
      </Band>
    </>
  );
}
