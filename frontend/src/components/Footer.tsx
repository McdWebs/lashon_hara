import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import InstagramIcon from "@mui/icons-material/Instagram";
import { Box, Container, IconButton, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { SITE, waLink } from "../lib/site";

const footLink = {
  color: "inherit",
  textDecoration: "none",
  fontSize: { xs: 14, md: 15 },
  fontWeight: 500,
  display: "block",
  py: { xs: 0.5, md: 0.25 },
  opacity: 0.78,
  "&:hover": { opacity: 1, color: "primary.main" },
} as const;

const sectionTitle = {
  fontWeight: 700,
  mb: { xs: 1.25, md: 1 },
  fontSize: 12,
  letterSpacing: 1,
  opacity: 0.45,
  textTransform: "uppercase",
} as const;

const socialIconButton = {
  color: "inherit",
  opacity: 0.78,
  "&:hover": { opacity: 1, color: "primary.main", bgcolor: "transparent" },
} as const;

export function Footer() {
  const { loc, t, lang } = useLocale();
  const he = lang !== "en";

  const move = [
    { to: loc("/join/commitment"), label: t("ctaJoin") },
    { to: loc("/schools"), label: t("navSchools") },
    { to: loc("/shop"), label: t("navShop") },
    { to: loc("/donate"), label: t("navDonate") },
  ];

  const shop = [
    { to: loc("/cart"), label: t("navCart") },
    { to: loc("/checkout"), label: t("navCheckout") },
    { to: loc("/wholesale"), label: t("navWholesale") },
    { to: loc("/request-a-quote"), label: t("navQuote") },
    { to: loc("/custom"), label: t("navCustom") },
    { to: loc("/my-account"), label: t("navAccount") },
  ];

  const more = [
    { to: loc("/about"), label: he ? "אודות" : "About" },
    { to: loc("/message"), label: t("navMessage") },
    { to: loc("/message/quiz"), label: he ? "האם זה לשון הרע?" : "Is this lashon hara?" },
    { to: loc("/stories"), label: he ? "סיפורים" : "Stories" },
    { to: loc("/activities"), label: he ? "פעילות" : "Activity" },
    { to: loc("/contact"), label: he ? "צור קשר" : "Contact" },
    { to: loc("/faq"), label: he ? "שאלות נפוצות" : "FAQ" },
  ];

  return (
    <Box component="footer" sx={{ bgcolor: "background.default", color: "text.primary", mt: 0, borderTop: "1px solid", borderColor: "divider" }}>
      <Box sx={{ width: 48, height: 3, bgcolor: "primary.main" }} />
      <Container sx={{ maxWidth: 1120, px: { xs: 2, md: 3 }, py: { xs: 4, md: 5 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1.1fr 0.75fr 0.75fr 0.75fr" },
            gap: { xs: 3, md: 4 },
            alignItems: "start",
          }}
        >
          <Stack
            spacing={1.5}
            sx={{
              maxWidth: 420,
              alignItems: { xs: "center", md: "flex-start" },
              textAlign: { xs: "center", md: "start" },
            }}
          >
            <Box component="img" src={SITE.logoSrc} alt={t("slogan")} sx={{ height: { xs: 28, md: 32 }, width: "auto" }} />
            <Typography sx={{ color: "text.secondary", fontSize: { xs: "0.92rem", md: "1rem" }, lineHeight: 1.65 }}>
              {he
                ? "מאז 2007 — שלטי חוצות, צמידים, בתי ספר. משפט שעונדים, לא רק כותבים."
                : "Since 2007 — billboards, bracelets, schools. A sentence people wear."}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr" },
              gap: { xs: 0.25, sm: 0 },
            }}
          >
            <Box sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}>
              <Typography sx={sectionTitle}>{he ? "להצטרף" : "Join in"}</Typography>
            </Box>
            {move.map((item) => (
              <Link key={item.to} component={RouterLink} to={item.to} underline="none" sx={footLink}>
                {item.label}
              </Link>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr" },
              gap: { xs: 0.25, sm: 0 },
            }}
          >
            <Box sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}>
              <Typography sx={sectionTitle}>{he ? "חנות והזמנות" : "Shop & orders"}</Typography>
            </Box>
            {shop.map((item) => (
              <Link key={item.to} component={RouterLink} to={item.to} underline="none" sx={footLink}>
                {item.label}
              </Link>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr" },
              gap: { xs: 0.25, sm: 0 },
              pt: { xs: 0.5, sm: 0 },
              borderTop: { xs: "1px solid", sm: "none" },
              borderColor: "divider",
            }}
          >
            <Box sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}>
              <Typography sx={sectionTitle}>{he ? "עוד" : "More"}</Typography>
            </Box>
            {more.map((item) => (
              <Link key={item.to} component={RouterLink} to={item.to} underline="none" sx={footLink}>
                {item.label}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>

      <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 2.5, md: 2 } }}>
        <Container
          sx={{
            maxWidth: 1120,
            px: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: { sm: "flex-end" },
            alignItems: { xs: "center", sm: "center" },
          }}
        >
          <Stack direction="row" spacing={2.5} sx={{ flexWrap: "wrap", justifyContent: "center" }}>
            <Link href={waLink()} underline="none" sx={{ ...footLink, py: 0, display: "none" }}>
              WhatsApp
            </Link>
            <IconButton
              component="a"
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              size="small"
              sx={socialIconButton}
            >
              <InstagramIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href={SITE.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              size="small"
              sx={socialIconButton}
            >
              <FacebookOutlinedIcon fontSize="small" />
            </IconButton>
            <Link component={RouterLink} to={loc("/terms")} underline="none" sx={{ ...footLink, py: 0 }}>
              {he ? "תקנון" : "Terms"}
            </Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
