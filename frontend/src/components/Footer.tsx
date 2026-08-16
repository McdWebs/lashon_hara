import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { SITE, waLink } from "../lib/site";

export function Footer() {
  const { loc, lang } = useLocale();
  return (
    <Box component="footer" sx={{ bgcolor: "#111", color: "#fff", mt: 8, py: 6 }}>
      <Container>
        <Stack spacing={3}>
          <Box component="img" src={SITE.logoSrc} alt="" sx={{ height: 28, width: "auto", filter: "brightness(10)", alignSelf: "flex-start" }} />
          <Typography variant="body2" sx={{ maxWidth: 560, opacity: 0.85 }}>
            {lang === "en"
              ? "The association promotes a culture of respectful speech to reduce gossip, shaming, and bullying — as published on the current site."
              : "העמותה מעודדת תרבות שיח חיובית במטרה למגר רכילות, שיימינג ובריונות במרחב הפיזי והמקוון, על מנת ליצור חברה סובלנית ומכבדת יותר."}
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flexWrap: "wrap" }}>
            <Link component={RouterLink} to={loc("/about")} color="inherit">
              {lang === "en" ? "About" : "אודות"}
            </Link>
            <Link component={RouterLink} to={loc("/faq")} color="inherit">
              {lang === "en" ? "FAQ" : "שאלות נפוצות"}
            </Link>
            <Link component={RouterLink} to={loc("/message/quiz")} color="inherit">
              {lang === "en" ? "Is this lashon hara?" : "האם זה לשון הרע?"}
            </Link>
            <Link component={RouterLink} to={loc("/resources")} color="inherit">
              {lang === "en" ? "Resources" : "משאבים"}
            </Link>
            <Link component={RouterLink} to={loc("/map")} color="inherit">
              {lang === "en" ? "Map" : "המפה"}
            </Link>
            <Link component={RouterLink} to={loc("/contact")} color="inherit">
              {lang === "en" ? "Contact" : "צור קשר"}
            </Link>
            <Link href={`${SITE.wcOrigin}/terms/`} color="inherit">
              {lang === "en" ? "Terms" : "תקנון ופרטיות"}
            </Link>
          </Stack>
          <Typography variant="body2">
            WhatsApp: {SITE.whatsapp.replace("972", "0")} · {SITE.supportHours} ·{" "}
            <Link href={waLink()} color="inherit">
              {lang === "en" ? "Message us" : "דברו איתנו"}
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
