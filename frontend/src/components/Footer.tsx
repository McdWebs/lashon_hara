import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import InstagramIcon from "@mui/icons-material/Instagram";
import { Box, Container, IconButton, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { SITE, waLink } from "../lib/site";

const footLink = {
  color: "inherit",
  textDecoration: "none",
  fontSize: 15,
  fontWeight: 500,
  display: "block",
  py: 0.25,
  opacity: 0.78,
  "&:hover": { opacity: 1, color: "primary.main" },
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
      <Container sx={{ maxWidth: 1120, py: { xs: 3.5, md: 5 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "1.1fr 0.75fr 0.75fr 0.75fr" },
            gap: { xs: 2, md: 4 },
            alignItems: "start",
          }}
        >
          <Stack spacing={1.5} sx={{ maxWidth: 420, gridColumn: { xs: "1 / -1", md: "auto" } }}>
            <Box component="img" src={SITE.logoSrc} alt={t("slogan")} sx={{ height: 32, width: "auto", alignSelf: "flex-start" }} />
            <Typography sx={{ color: "text.secondary", fontSize: "1rem" }}>
              {he
                ? "מאז 2007 — שלטי חוצות, צמידים, בתי ספר. משפט שעונדים, לא רק כותבים."
                : "Since 2007 — billboards, bracelets, schools. A sentence people wear."}
            </Typography>
          </Stack>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 13, letterSpacing: 1, opacity: 0.45 }}>
              {he ? "להצטרף" : "Join in"}
            </Typography>
            {move.map((item) => (
              <Link key={item.to} component={RouterLink} to={item.to} underline="none" sx={footLink}>
                {item.label}
              </Link>
            ))}
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 13, letterSpacing: 1, opacity: 0.45 }}>
              {he ? "חנות והזמנות" : "Shop & orders"}
            </Typography>
            {shop.map((item) => (
              <Link key={item.to} component={RouterLink} to={item.to} underline="none" sx={footLink}>
                {item.label}
              </Link>
            ))}
          </Box>

          <Box sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}>
            <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 13, letterSpacing: 1, opacity: 0.45 }}>
              {he ? "עוד" : "More"}
            </Typography>
            {more.map((item) => (
              <Link key={item.to} component={RouterLink} to={item.to} underline="none" sx={footLink}>
                {item.label}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>

      <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: 2 }}>
        <Container
          sx={{
            maxWidth: 1120,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: { sm: "flex-end" },
            alignItems: { sm: "center" },
          }}
        >
          <Stack direction="row" spacing={2.5} sx={{ flexWrap: "wrap" }}>
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
