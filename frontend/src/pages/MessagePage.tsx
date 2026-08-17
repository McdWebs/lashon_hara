import { Box, Typography } from "@mui/material";
import { MessageHeContent } from "../content/messageHe";
import { PageHeader, Section } from "../components/Section";
import { useLocale } from "../i18n/useLocale";
import { MEDIA } from "../lib/media";

export function MessagePage() {
  const { loc, t } = useLocale();

  return (
    <>
      <PageHeader title="המסר">
        <Typography variant="h2" sx={{ fontSize: { xs: "1.35rem", md: "1.65rem" }, lineHeight: 1.3 }}>
          {t("slogan")}
        </Typography>
      </PageHeader>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          bgcolor: "background.default",
        }}
      >
        <Box
          component="img"
          src={MEDIA.bracelets}
          alt="צמידים עם המסר לשון הרע לא מדבר אליי"
          sx={{
            width: "100%",
            height: { xs: 260, md: "100%" },
            minHeight: { md: 320 },
            objectFit: "cover",
          }}
        />
        <Box
          sx={{
            px: { xs: 3, md: 6 },
            py: { xs: 5, md: 7 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box sx={{ width: 48, height: 3, bgcolor: "primary.main", mb: 2.5 }} />
          <Typography
            variant="h2"
            component="p"
            sx={{
              maxWidth: 480,
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              lineHeight: 1.22,
              letterSpacing: "-0.01em",
            }}
          >
            אם לא הייתם אומרים את זה בפני האדם — אל תגידו מאחורי גבו.
          </Typography>
          <Typography
            sx={{
              mt: 2.5,
              maxWidth: 480,
              pl: 2,
              borderInlineStart: "2px solid",
              borderColor: "divider",
              fontSize: { xs: "0.98rem", md: "1.05rem" },
              lineHeight: 1.85,
              color: "text.secondary",
            }}
          >
            זה המבחן שמנחה את התנועה: רכילות — גם אם הסיפור קרה — ביוש, לעג, הכללה והסתה.
          </Typography>
        </Box>
      </Box>

      <Section wide>
        <MessageHeContent loc={loc} />
      </Section>
    </>
  );
}
