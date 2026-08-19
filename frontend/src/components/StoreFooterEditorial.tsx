import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import InstagramIcon from "@mui/icons-material/Instagram";
import { Box, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { SITE } from "../lib/site";
import { STORE_COPY, STORE_MAX_WIDTH } from "../lib/storeUi";
import { SocialLink } from "./SocialLink";

const footerLinkSx = {
  color: "inherit",
  textDecoration: "none",
  fontSize: 13,
  lineHeight: 1.5,
  opacity: 0.7,
  py: 0.35,
  "&:hover": { opacity: 1 },
} as const;

export function StoreFooterEditorial() {
  const { lang, loc } = useLocale();
  const copy = STORE_COPY[lang];
  const shopLinks = [
    { label: lang === "en" ? "Apparel" : "לבוש", to: loc("/shop?category=146") },
    { label: lang === "en" ? "Bracelets" : "צמידים", to: loc("/shop?category=20") },
    { label: lang === "en" ? "Accessories" : "אביזרים", to: loc("/shop?category=18") },
    { label: lang === "en" ? "All products" : "כל המוצרים", to: loc("/shop") },
  ];
  const helpLinks = [
    { label: lang === "en" ? "Cart" : "סל קניות", to: loc("/cart") },
    { label: lang === "en" ? "Checkout" : "קופה", to: loc("/checkout") },
    { label: lang === "en" ? "Contact" : "צור קשר", to: loc("/contact") },
    { label: lang === "en" ? "Terms" : "תקנון", to: loc("/terms") },
  ];

  return (
    <Box component="footer" sx={{ bgcolor: "#f0ebe2", color: "#111" }}>
      <Box
        sx={{
          maxWidth: STORE_MAX_WIDTH,
          mx: "auto",
          px: { xs: 2.5, md: 4 },
          pt: { xs: 7, md: 10 },
          pb: 3,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "1.6fr .7fr .7fr .8fr" },
            gap: { xs: 4, md: 6 },
            pb: { xs: 6, md: 9 },
          }}
        >
          <Stack sx={{ gridColumn: { xs: "1 / -1", md: "auto" }, maxWidth: 430, gap: 2 }}>
            <Box component={RouterLink} to={loc("/")} sx={{ display: "inline-flex", alignSelf: "flex-start" }}>
              <Box component="img" src={SITE.logoSrc} alt={SITE.name} sx={{ height: { xs: 34, md: 42 }, width: "auto" }} />
            </Box>
            <Typography
              sx={{
                fontFamily: '"Secular One", Heebo, sans-serif',
                fontSize: { xs: 24, md: 32 },
                lineHeight: 1.18,
                maxWidth: 380,
              }}
            >
              {lang === "en" ? "What we wear becomes part of what we say." : "מה שאנחנו לובשים הופך לחלק ממה שאנחנו אומרים."}
            </Typography>
          </Stack>

          <Stack>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", mb: 1.4, textTransform: "uppercase" }}>
              {lang === "en" ? "Shop" : "חנות"}
            </Typography>
            {shopLinks.map((link) => (
              <Link key={link.to} component={RouterLink} to={link.to} underline="none" sx={footerLinkSx}>
                {link.label}
              </Link>
            ))}
          </Stack>

          <Stack>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", mb: 1.4, textTransform: "uppercase" }}>
              {lang === "en" ? "Help" : "עזרה"}
            </Typography>
            {helpLinks.map((link) => (
              <Link key={link.to} component={RouterLink} to={link.to} underline="none" sx={footerLinkSx}>
                {link.label}
              </Link>
            ))}
          </Stack>

          <Stack>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", mb: 1.4, textTransform: "uppercase" }}>
              {lang === "en" ? "The movement" : "התנועה"}
            </Typography>
            <Link component={RouterLink} to={loc("/movement")} underline="none" sx={footerLinkSx}>
              {copy.why}
            </Link>
            <Link component={RouterLink} to={loc("/join")} underline="none" sx={footerLinkSx}>
              {lang === "en" ? "Join us" : "להצטרף"}
            </Link>
            <Link component={RouterLink} to={loc("/schools")} underline="none" sx={footerLinkSx}>
              {lang === "en" ? "Schools" : "בתי ספר"}
            </Link>
          </Stack>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            borderTop: "1px solid rgba(17,17,17,.14)",
            pt: 2.5,
            gap: 2,
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          <Typography sx={{ fontSize: 11, color: "rgba(17,17,17,.65)", marginInlineStart: { md: 10 } }}>
            © {new Date().getFullYear()} {SITE.name}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <SocialLink href={SITE.instagram} label="Instagram" icon={InstagramIcon} />
            <SocialLink href={SITE.facebook} label="Facebook" icon={FacebookOutlinedIcon} />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
