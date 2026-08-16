import { Box, Button, Card, CardActionArea, CardContent, Grid, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { MovementStats } from "../components/MovementStats";
import { NewsletterSignup } from "../components/NewsletterSignup";
import { Section } from "../components/Section";
import { useLocale } from "../i18n/useLocale";
import type { Audience } from "../i18n/locale";
import { track } from "../lib/analytics";
import { usePrefs } from "../lib/prefs";

const pathCopy = {
  he: [
    { to: "/join/commitment", title: "אני רוצה להצטרף", body: "התחייבות אישית לשיח מכבד.", event: "cta_hero_join_clicked" as const },
    { to: "/schools", title: "אני רוצה להביא את זה לבית הספר", body: "תוכניות חינוכיות לתלמידים.", event: "cta_school_clicked" as const },
    { to: "/join/ambassadors", title: "אני רוצה להיות שגריר/ה", body: "לעזור בחלוקות ולנקות את השיח ברשת." },
    { to: "/donate", title: "אני רוצה לעזור", body: "תמיכה כספית בהפצת המסר.", event: "cta_donate_clicked" as const },
    { to: "/shop", title: "אני רוצה להפיץ את המסר", body: "מוצרים שמזכירים את הבחירה בכל יום.", event: "cta_shop_clicked" as const },
  ],
  en: [
    { to: "/join/commitment", title: "I want to join", body: "A personal commitment to respectful speech.", event: "cta_hero_join_clicked" as const },
    { to: "/schools", title: "Bring this to school", body: "Educational programs for students.", event: "cta_school_clicked" as const },
    { to: "/join/ambassadors", title: "Become an ambassador", body: "Help with distributions and cleaner speech online." },
    { to: "/donate", title: "I want to help", body: "Financial support to spread the message.", event: "cta_donate_clicked" as const },
    { to: "/shop", title: "Spread the message", body: "Products that remind us how we choose to speak.", event: "cta_shop_clicked" as const },
  ],
};

const audienceOrder: Record<Audience, string[]> = {
  default: [],
  parent: ["/schools", "/join/commitment", "/shop", "/donate", "/join/ambassadors"],
  teacher: ["/schools", "/resources", "/join/commitment", "/shop", "/donate"],
  student: ["/join/commitment", "/message/quiz", "/shop", "/join/ambassadors", "/donate"],
  school: ["/schools", "/organizations", "/donate", "/shop", "/join/commitment"],
};

export function HomePage() {
  const { loc, t, lang } = useLocale();
  const audience = usePrefs((s) => s.audience);
  const setAudience = usePrefs((s) => s.setAudience);
  const base = pathCopy[lang];
  const order = audienceOrder[audience];
  const paths = order.length
    ? [...base].sort((a, b) => {
        const ia = order.indexOf(a.to);
        const ib = order.indexOf(b.to);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })
    : base;

  const audiences: Audience[] = ["default", "parent", "teacher", "student", "school"];

  return (
    <>
      <Box sx={{ bgcolor: "#111", color: "#fff", py: { xs: 8, md: 12 }, px: 2 }}>
        <Box sx={{ maxWidth: 900, mx: "auto", textAlign: "center" }}>
          <Typography variant="h1">{t("slogan")}</Typography>
          <Typography sx={{ mt: 3, fontSize: { xs: "1.1rem", md: "1.35rem" }, opacity: 0.92 }}>
            {t("heroSupport1")}
            <br />
            {t("heroSupport2")}
            <br />
            {t("heroSupport3")}
          </Typography>
          <Typography sx={{ mt: 2, opacity: 0.75 }}>{t("heroTag")}</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4, justifyContent: "center" }}>
            <Button size="large" variant="contained" component={RouterLink} to={loc("/join/commitment")} onClick={() => track("cta_hero_join_clicked")}>
              {t("ctaJoin")}
            </Button>
            <Button size="large" variant="outlined" color="inherit" component={RouterLink} to={loc("/schools")} onClick={() => track("cta_school_clicked")}>
              {t("ctaSchool")}
            </Button>
          </Stack>
        </Box>
      </Box>

      <Section>
        <Typography variant="h2" gutterBottom>
          {lang === "en" ? "Change starts with one word." : "שינוי מתחיל במילה אחת."}
        </Typography>
        <Typography sx={{ mb: 1 }} color="text.secondary">
          {t("audienceLabel")}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
          {audiences.map((a) => (
            <Button key={a} size="small" variant={audience === a ? "contained" : "outlined"} onClick={() => setAudience(a)}>
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
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {paths.map((p) => (
            <Grid key={p.to} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardActionArea
                  component={RouterLink}
                  to={loc(p.to)}
                  sx={{ height: "100%" }}
                  onClick={() => {
                    if (p.event) track(p.event);
                  }}
                >
                  <CardContent>
                    <Typography variant="h3">{p.title}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      {p.body}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section muted>
        <Typography variant="h2" gutterBottom>
          כבר מאז 2007 אנחנו משנים את השיח
        </Typography>
        <Typography sx={{ maxWidth: 720 }}>
          המיזם הוקם בשנת 2007 על ידי איש העסקים דוד הלפרין. במסגרתו הופץ המסר באמצעות שלטי חוצות, חלוקת סטיקרים וצמידים, ביקורים בבתי חולים ובבסיסים צבאיים והפקת תערוכות. אין כאן מונים שלא אומתו מהנתונים הפנימיים של העמותה — רק מה שפורסם באתר.
        </Typography>
        <Button component={RouterLink} to={loc("/about")} sx={{ mt: 2 }}>
          לקרוא את הסיפור
        </Button>
      </Section>

      <Section>
        <Typography variant="h2" gutterBottom>
          מה זה לשון הרע?
        </Typography>
        <Typography sx={{ mb: 2 }}>דיבור שלילי שנאמר לאחר או על אחר.</Typography>
        <Typography sx={{ mb: 2 }}>
          המבחן לקביעה האם מדובר בלשון הרע הוא: אם לא הייתם אומרים את זה בפני האדם — אל תגידו מאחורי גבו.
        </Typography>
        <Typography>
          מה נכלל בהגדרה הזאת? השמצות, לעג, רכילות (גם סיפור שקרה באמת), הכללה, ביוש (שיימינג), הסתה והלבנת פנים.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          זהו תוכן חינוכי מהאתר הקיים. הוא אינו ייעוץ הלכתי או משפטי.
        </Typography>
        <Button component={RouterLink} to={loc("/message")} sx={{ mt: 2, mr: 1 }}>
          אני רוצה לקרוא עוד
        </Button>
        <Button component={RouterLink} to={loc("/message/quiz")} variant="contained" sx={{ mt: 2 }}>
          האם זה לשון הרע?
        </Button>
      </Section>

      <Section muted>
        <Typography variant="h2" gutterBottom>
          הפעילות שלנו
        </Typography>
        <Typography sx={{ mb: 2 }}>
          יחד מחזקים מודעות לשיח מכבד, מזכירים שמילים יכולות לפגוע, ומובילים שינוי חברתי דרך חינוך, חלוקת מוצרים עם המסר, וניקיון הרשת החברתית מלשון הרע.
        </Typography>
        <Grid container spacing={2}>
          {["חלוקות", "שגרירים", "סדנאות חינוכיות בבתי ספר", "תערוכות וקמפיינים"].map((label) => (
            <Grid key={label} size={{ xs: 12, sm: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button component={RouterLink} to={loc("/activities")} sx={{ mt: 2 }}>
          לפעילות
        </Button>
      </Section>

      <Section>
        <Typography variant="h2" gutterBottom>
          הסיפורים שלנו
        </Typography>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          סיפורי הארגון כפי שפורסמו באתר — בלי עדויות מומצאות.
        </Typography>
        <Button component={RouterLink} to={loc("/stories")}>
          לקרוא
        </Button>
      </Section>

      <Section muted>
        <MovementStats />
      </Section>

      <Section>
        <NewsletterSignup />
      </Section>

      <Section muted>
        <Typography variant="h2" gutterBottom>
          השינוי מתחיל בי
        </Typography>
        <Typography sx={{ mb: 2 }}>אני מתחייב/ת בזאת להימנע מהפצת לשון הרע ודברי רכילות.</Typography>
        <Button variant="contained" component={RouterLink} to={loc("/join/commitment")}>
          קבלו את התחייבותי
        </Button>
      </Section>
    </>
  );
}
