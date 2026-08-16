import { Box, Button, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Band } from "../components/Band";
import { useLocale } from "../i18n/useLocale";
import type { Audience } from "../i18n/locale";
import { track } from "../lib/analytics";
import { MEDIA } from "../lib/media";
import { usePrefs } from "../lib/prefs";

export function HomePage() {
  const { loc, t, lang } = useLocale();
  const audience = usePrefs((s) => s.audience);
  const setAudience = usePrefs((s) => s.setAudience);

  const paths = [
    {
      to: "/join/commitment",
      title: lang === "en" ? "Take the commitment" : "השינוי מתחיל בי",
      body: lang === "en" ? "A personal oath. Then share it." : "התחייבות אישית. אחר כך משתפים.",
      primary: audience !== "school",
    },
    {
      to: "/schools",
      title: lang === "en" ? "Bring it to school" : "לבית הספר",
      body: lang === "en" ? "Workshops and classroom materials." : "סדנאות וחלוקה לכיתות.",
      primary: audience === "school" || audience === "teacher" || audience === "parent",
    },
    {
      to: "/shop",
      title: lang === "en" ? "Wear the sentence" : "ללבוש את המשפט",
      body: lang === "en" ? "Bracelets and stickers from the real catalog." : "צמידים ומדבקות מהקטלוג הקיים.",
      primary: false,
    },
  ];

  const ordered = [...paths].sort((a, b) => Number(b.primary) - Number(a.primary));

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
          minHeight: { md: "78vh" },
          bgcolor: "#111",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            px: { xs: 3, md: 8 },
            py: { xs: 7, md: 10 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Typography variant="h1">{t("slogan")}</Typography>
          <Typography sx={{ mt: 3, maxWidth: 440, fontSize: { xs: "1.05rem", md: "1.2rem" }, opacity: 0.88 }}>
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
            >
              {t("ctaJoin")}
            </Button>
            <Link
              component={RouterLink}
              to={loc("/schools")}
              onClick={() => track("cta_school_clicked")}
              underline="always"
              color="inherit"
              sx={{ fontWeight: 600 }}
            >
              {t("ctaSchool")}
            </Link>
          </Stack>
        </Box>
        <Box
          component="img"
          src={MEDIA.hoodie}
          alt={lang === "en" ? "Hoodie with the movement slogan" : "קפוצ׳ון עם המשפט לשון הרע לא מדבר אליי"}
          sx={{ width: "100%", height: { xs: 320, md: "100%" }, objectFit: "cover", objectPosition: "top" }}
        />
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
        <Typography variant="h2" sx={{ mb: 1 }}>
          {lang === "en" ? "If this is you" : "אם זה מדבר אליכם"}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: "wrap" }}>
          {(["default", "parent", "teacher", "student", "school"] as Audience[]).map((a) => (
            <Button key={a} size="small" variant={audience === a ? "contained" : "text"} onClick={() => setAudience(a)}>
              {t(
                a === "default"
                  ? "audienceDefault"
                  : a === "parent"
                    ? "audienceParent"
                    : a === "teacher"
                      ? "audienceTeacher"
                      : a === "student"
                        ? "audienceStudent"
                        : "audienceSchool",
              )}
            </Button>
          ))}
        </Stack>
        <Stack spacing={3} sx={{ maxWidth: 640 }}>
          {ordered.map((p, i) => (
            <Box key={p.to} sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
              <Typography variant="h3">{p.title}</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {p.body}
              </Typography>
              <Button
                component={RouterLink}
                to={loc(p.to)}
                variant={i === 0 ? "contained" : "text"}
                sx={{ mt: 1, px: i === 0 ? 2 : 0 }}
                onClick={() => {
                  if (p.to === "/join/commitment") track("cta_hero_join_clicked");
                  if (p.to === "/schools") track("cta_school_clicked");
                  if (p.to === "/shop") track("cta_shop_clicked");
                }}
              >
                {lang === "en" ? "Continue" : "המשך"}
              </Button>
            </Box>
          ))}
        </Stack>
        <Link component={RouterLink} to={loc("/join/ambassadors")} sx={{ display: "inline-block", mt: 3 }} color="text.secondary">
          {lang === "en" ? "Ambassador / volunteer" : "שגרירות והתנדבות"}
        </Link>
        {" · "}
        <Link component={RouterLink} to={loc("/donate")} color="text.secondary" onClick={() => track("cta_donate_clicked")}>
          {t("navDonate")}
        </Link>
      </Band>

      <Band tone="dark">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box
            component="img"
            src={MEDIA.fabric}
            alt={lang === "en" ? "Fabric bracelets with the slogan" : "צמידי בד עם המשפט"}
            sx={{ width: "100%", height: 240, objectFit: "cover" }}
          />
          <Box
            component="img"
            src={MEDIA.sticker}
            alt={lang === "en" ? "Magnet sticker with the slogan" : "מדבקת מגנט עם המשפט"}
            sx={{ width: "100%", height: 240, objectFit: "cover" }}
          />
        </Box>
        <Typography variant="h2">
          {lang === "en" ? "The shop funds free distributions to schools." : "החנות מממנת חלוקה חינם לבתי ספר."}
        </Typography>
        <Typography sx={{ mt: 1, opacity: 0.8, maxWidth: 560 }}>
          {lang === "en"
            ? "That is how the current store describes itself. Bracelets and stickers are how the sentence travels."
            : "כך מתוארת החנות באתר הקיים. הצמיד והמדבקה הם איך המשפט זז."}
        </Typography>
        <Button component={RouterLink} to={loc("/shop")} variant="contained" sx={{ mt: 3 }} onClick={() => track("cta_shop_clicked")}>
          {t("navShop")}
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
