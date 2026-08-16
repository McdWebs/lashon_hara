import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { SITE, waLink } from "../lib/site";

export function Footer() {
  const { loc, lang } = useLocale();
  return (
    <Box component="footer" sx={{ bgcolor: "#111", color: "#fff", mt: 0, py: 6 }}>
      <Container sx={{ maxWidth: 1120 }}>
        <Stack spacing={3}>
          <Box component="img" src={SITE.logoSrc} alt="" sx={{ height: 26, width: "auto", filter: "brightness(12)", alignSelf: "flex-start" }} />
          <Typography variant="body2" sx={{ maxWidth: 520, opacity: 0.8 }}>
            {lang === "en"
              ? "A movement for respectful speech — billboards, bracelets, schools — since 2007."
              : "תנועה לשיח מכבד. שלטי חוצות, צמידים, בתי ספר — מאז 2007."}
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flexWrap: "wrap" }}>
            <Link component={RouterLink} to={loc("/about")} color="inherit">
              {lang === "en" ? "About" : "אודות"}
            </Link>
            <Link component={RouterLink} to={loc("/stories")} color="inherit">
              {lang === "en" ? "Stories" : "סיפורים"}
            </Link>
            <Link component={RouterLink} to={loc("/activities")} color="inherit">
              {lang === "en" ? "Activity" : "פעילות"}
            </Link>
            <Link component={RouterLink} to={loc("/message/quiz")} color="inherit">
              {lang === "en" ? "Is this lashon hara?" : "האם זה לשון הרע?"}
            </Link>
            <Link component={RouterLink} to={loc("/contact")} color="inherit">
              {lang === "en" ? "Contact" : "צור קשר"}
            </Link>
            <Link href={`${SITE.wcOrigin}/terms/`} color="inherit">
              {lang === "en" ? "Terms" : "תקנון"}
            </Link>
            <Link href={waLink()} color="inherit">
              WhatsApp
            </Link>
          </Stack>
          <Typography variant="body2" sx={{ opacity: 0.65 }}>
            054-3644512 · {SITE.supportHours}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
