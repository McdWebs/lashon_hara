import { Box, Button, Card, CardActionArea, CardContent, Grid, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { MovementStats } from "../components/MovementStats";
import { NewsletterSignup } from "../components/NewsletterSignup";
import { Section } from "../components/Section";
import { track } from "../lib/analytics";

const paths = [
  { to: "/join/commitment", title: "אני רוצה להצטרף", body: "התחייבות אישית לשיח מכבד.", event: "cta_hero_join_clicked" as const },
  { to: "/schools", title: "אני רוצה להביא את זה לבית הספר", body: "תוכניות חינוכיות לתלמידים.", event: "cta_school_clicked" as const },
  { to: "/join/ambassadors", title: "אני רוצה להיות שגריר/ה", body: "לעזור בחלוקות ולנקות את השיח ברשת." },
  { to: "/donate", title: "אני רוצה לעזור", body: "תמיכה כספית בהפצת המסר.", event: "cta_donate_clicked" as const },
  { to: "/shop", title: "אני רוצה להפיץ את המסר", body: "מוצרים שמזכירים את הבחירה בכל יום.", event: "cta_shop_clicked" as const },
];

export function HomePage() {
  return (
    <>
      <Box
        sx={{
          bgcolor: "#111",
          color: "#fff",
          py: { xs: 8, md: 12 },
          px: 2,
        }}
      >
        <Box sx={{ maxWidth: 900, mx: "auto", textAlign: "center" }}>
          <Typography variant="h1">לשון הרע לא מדבר אליי</Typography>
          <Typography sx={{ mt: 3, fontSize: { xs: "1.1rem", md: "1.35rem" }, opacity: 0.92 }}>
            מילים יכולות לבנות.
            <br />
            מילים יכולות להרוס.
            <br />
            בואו נבחר איך אנחנו מדברים.
          </Typography>
          <Typography sx={{ mt: 2, opacity: 0.75 }}>זה לא רק סלוגן. זה דרך חיים.</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4, justifyContent: "center" }}>
            <Button
              size="large"
              variant="contained"
              component={RouterLink}
              to="/join/commitment"
              onClick={() => track("cta_hero_join_clicked")}
            >
              אני מצטרף/ת
            </Button>
            <Button
              size="large"
              variant="outlined"
              color="inherit"
              component={RouterLink}
              to="/schools"
              onClick={() => track("cta_school_clicked")}
            >
              אני רוצה להביא את המסר לבית הספר
            </Button>
          </Stack>
        </Box>
      </Box>

      <Section>
        <Typography variant="h2" gutterBottom>
          שינוי מתחיל במילה אחת.
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {paths.map((p) => (
            <Grid key={p.to} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardActionArea
                  component={RouterLink}
                  to={p.to}
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
        <Button component={RouterLink} to="/about" sx={{ mt: 2 }}>
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
        <Button component={RouterLink} to="/message" sx={{ mt: 2, mr: 1 }}>
          אני רוצה לקרוא עוד
        </Button>
        <Button component={RouterLink} to="/message/quiz" variant="contained" sx={{ mt: 2 }}>
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
          {["חלוקות", "שגרירים", "סדנאות חינוכיות בבתי ספר", "תערוכות וקמפיינים"].map((t) => (
            <Grid key={t} size={{ xs: 12, sm: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography sx={{ fontWeight: 700 }}>{t}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button component={RouterLink} to="/activities" sx={{ mt: 2 }}>
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
        <Button component={RouterLink} to="/stories">
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
        <Button variant="contained" component={RouterLink} to="/join/commitment">
          קבלו את התחייבותי
        </Button>
      </Section>
    </>
  );
}
