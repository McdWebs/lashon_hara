import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Button, IconButton, Link, Modal, Stack, Toolbar } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, NavLink, useLocation } from "react-router-dom";
import { AccountButton } from "./AccountButton";
import { CartButton } from "./CartButton";
import { useLocale } from "../i18n/useLocale";
import { stripLocale, withLocale } from "../i18n/locale";
import { SITE } from "../lib/site";
import { useScrolledPastHero } from "../lib/useScrolledPastHero";

const navLinkSx = {
  color: "text.primary",
  textDecoration: "none",
  fontSize: 16,
  fontWeight: 600,
  px: 1.75,
  py: 0.75,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  borderRadius: 1,
  position: "relative",
  transition: "color 0.15s ease, background-color 0.15s ease",
  "&:hover": {
    color: "primary.main",
    bgcolor: "rgba(237, 27, 36, 0.06)",
  },
  "&.active": {
    color: "primary.main",
    fontWeight: 700,
    "&::after": {
      content: '""',
      position: "absolute",
      insetInline: 14,
      bottom: 4,
      height: 2,
      bgcolor: "primary.main",
      borderRadius: 1,
    },
  },
} as const;

const MENU_ANIM_MS = 520;

export function Header() {
  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const scrolled = useScrolledPastHero();
  const { loc, t, lang } = useLocale();
  const { pathname } = useLocation();
  const other = lang === "he" ? "en" : "he";
  const isHome = stripLocale(pathname) === "/";
  const overHero = isHome && !scrolled;
  const headerColor = overHero ? "#fff" : "inherit";

  const nav = [
    { to: loc("/message"), label: t("navMessage") },
    { to: loc("/join"), label: t("navJoin") },
    { to: loc("/schools"), label: t("navSchools") },
    { to: loc("/shop"), label: t("navShop") },
  ];

  useEffect(() => {
    if (open) {
      setMenuMounted(true);
      return;
    }
    const id = window.setTimeout(() => setMenuMounted(false), MENU_ANIM_MS);
    return () => window.clearTimeout(id);
  }, [open]);

  const closeMenu = () => setOpen(false);
  const menuItems: Array<{ to: string; label: string; primary?: boolean }> = [
    ...nav,
    { to: loc("/donate"), label: t("navDonate"), primary: true },
    { to: loc("/cart"), label: t("navCart") },
    { to: loc("/my-account"), label: t("navAccount") },
    { to: loc("/wholesale"), label: t("navWholesale") },
    { to: loc("/request-a-quote"), label: t("navQuote") },
  ];

  const utilityStack = (
    <Stack direction="row" spacing={0.25} sx={{ alignItems: "center" }}>
      <CartButton color={headerColor} />
      <AccountButton color={headerColor} />
      <Button
        component={RouterLink}
        to={withLocale(pathname, other)}
        variant="text"
        size="small"
        sx={{
          display: "none",
          minHeight: 36,
          minWidth: 44,
          px: 1.25,
          color: overHero ? "rgba(255,255,255,0.85)" : "text.secondary",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.06em",
        }}
      >
        {t("langSwitch")}
      </Button>
      <Button
        component={RouterLink}
        to={loc("/donate")}
        variant="contained"
        color="primary"
        size="small"
        sx={{
          display: { xs: "none", md: "inline-flex" },
          minHeight: 40,
          px: 2.25,
          fontSize: 15,
        }}
      >
        {t("navDonate")}
      </Button>
      <IconButton
        aria-label={t("menu")}
        aria-expanded={open}
        onClick={() =>
          setOpen((v) => {
            if (!v) setMenuMounted(true);
            return !v;
          })
        }
        sx={{ display: { md: "none" }, color: headerColor }}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
    </Stack>
  );

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        bgcolor: overHero ? "transparent" : "background.paper",
        color: overHero ? "#fff" : "text.primary",
        borderBottom: overHero ? "none" : "1px solid",
        borderColor: "divider",
        backgroundImage: "none",
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          position: "relative",
          gap: { xs: 1, md: 2 },
          px: { xs: 2, md: 3 },
          py: 0,
          minHeight: overHero ? { xs: 80, sm: 104 } : { xs: 64, md: 72 },
          justifyContent: overHero ? "center" : "space-between",
        }}
      >
        {!overHero && (
          <Box
            component={RouterLink}
            to={loc("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Box component="img" src={SITE.logoSrc} alt={t("slogan")} sx={{ height: { xs: 28, sm: 36 }, width: "auto" }} />
          </Box>
        )}

        {overHero && (
          <Box
            component={RouterLink}
            to={loc("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Box component="img" src={SITE.logoSrc} alt={t("slogan")} sx={{ height: { xs: 52, sm: 72 }, width: "auto" }} />
          </Box>
        )}

        <Stack
          component="nav"
          direction="row"
          spacing={0.25}
          sx={{
            display: overHero ? "none" : { xs: "none", md: "flex" },
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          {nav.map((item) => (
            <Link key={item.to} component={NavLink} to={item.to} underline="none" sx={navLinkSx}>
              {item.label}
            </Link>
          ))}
        </Stack>

        <Box
          sx={{
            display: overHero ? { xs: "none", md: "flex" } : "flex",
            flexShrink: 0,
            alignItems: "center",
            ...(overHero
              ? {
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  insetInlineEnd: { sm: 16 },
                }
              : {}),
          }}
        >
          {utilityStack}
        </Box>
      </Toolbar>
      <Modal open={menuMounted} onClose={closeMenu} disableAutoFocus>
        <Box
          onClick={closeMenu}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: open ? "rgba(17,17,17,0.55)" : "rgba(17,17,17,0)",
            outline: "none",
            transition: "background-color 0.42s cubic-bezier(0.22, 0.61, 0.36, 1)",
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
            },
          }}
        >
          <Stack
            role="navigation"
            onClick={(e) => e.stopPropagation()}
            direction="row"
            useFlexGap
            sx={{
              position: "absolute",
              top: { xs: 88, sm: 96 },
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(92vw, 400px)",
              gap: 1.25,
              flexWrap: "wrap",
              justifyContent: "center",
              "@keyframes navWaterIn": {
                "0%": { opacity: 0, transform: "translateY(-20px) scale(0.88)" },
                "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
              },
              "@keyframes navWaterOut": {
                "0%": { opacity: 1, transform: "translateY(0) scale(1)" },
                "100%": { opacity: 0, transform: "translateY(16px) scale(0.88)" },
              },
            }}
          >
            {menuItems.map((item, i) => (
              <Link
                key={item.to}
                component={RouterLink}
                to={item.to}
                underline="none"
                onClick={closeMenu}
                sx={{
                  bgcolor: item.primary ? "primary.main" : "background.paper",
                  color: item.primary ? "#fff" : "text.primary",
                  borderRadius: 999,
                  px: 2.5,
                  py: 1.15,
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: "0 2px 10px rgba(17,17,17,0.18)",
                  transform: "translateY(0) scale(1)",
                  animation: open
                    ? `navWaterIn 0.45s ease-out ${i * 0.05}s both`
                    : `navWaterOut 0.32s ease-in ${(menuItems.length - 1 - i) * 0.04}s both`,
                  "@media (prefers-reduced-motion: reduce)": {
                    animation: "none",
                    opacity: open ? 1 : 0,
                  },
                }}
              >
                {item.label}
              </Link>
            ))}
          </Stack>
        </Box>
      </Modal>
    </AppBar>
  );
}
