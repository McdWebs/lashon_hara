import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { SITE, waLink } from "../lib/site";

export function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: "#111", color: "#fff", mt: 8, py: 6 }}>
      <Container>
        <Stack spacing={3}>
          <Box component="img" src={SITE.logoSrc} alt="" sx={{ height: 28, width: "auto", filter: "brightness(10)", alignSelf: "flex-start" }} />
          <Typography variant="body2" sx={{ maxWidth: 560, opacity: 0.85 }}>
            העמותה מעודדת תרבות שיח חיובית במטרה למגר רכילות, שיימינג ובריונות במרחב הפיזי והמקוון, על מנת ליצור חברה סובלנית ומכבדת יותר.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flexWrap: "wrap" }}>
            <Link component={RouterLink} to="/about" color="inherit">
              אודות
            </Link>
            <Link component={RouterLink} to="/faq" color="inherit">
              שאלות נפוצות
            </Link>
            <Link component={RouterLink} to="/message/quiz" color="inherit">
              האם זה לשון הרע?
            </Link>
            <Link component={RouterLink} to="/resources" color="inherit">
              משאבים
            </Link>
            <Link component={RouterLink} to="/contact" color="inherit">
              צור קשר
            </Link>
            <Link href={`${SITE.wcOrigin}/terms/`} color="inherit">
              תקנון ופרטיות
            </Link>
            <Link href={SITE.facebook} color="inherit">
              פייסבוק
            </Link>
            <Link href={SITE.instagram} color="inherit">
              אינסטגרם
            </Link>
          </Stack>
          <Typography variant="body2">
            WhatsApp: {SITE.whatsapp.replace("972", "0")} · {SITE.supportHours} ·{" "}
            <Link href={waLink()} color="inherit">
              דברו איתנו
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
