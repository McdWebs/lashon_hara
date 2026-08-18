import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Button, IconButton, Link, Modal, Stack, Toolbar, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, NavLink, useLocation } from "react-router-dom";
import { AccountButton } from "./AccountButton";
import { CartButton } from "./CartButton";
import { useLocale } from "../i18n/useLocale";
import { FEATURES, SITE } from "../lib/site";
import { isMovementPath, isStorePath } from "../lib/siteMode";
import { useScrolledPastHero } from "../lib/useScrolledPastHero";
import { StoreHeader } from "./HeaderStore";

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
const HEADER_EXPAND_MS = 560;
const headerEase = "cubic-bezier(0.22, 0.61, 0.36, 1)";

const logoImgSx = {
  width: "auto",
  display: "block",
} as const;

type MobileMenuItem = { to: string; label: string; primary?: boolean };

function mobileMenuBubbleSx(
  item: MobileMenuItem,
  open: boolean,
  index: number,
  total: number,
) {
  return {
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
      ? `navWaterIn 0.45s ease-out ${index * 0.05}s both`
      : `navWaterOut 0.32s ease-in ${(total - 1 - index) * 0.04}s both`,
    "@media (prefers-reduced-motion: reduce)": {
      animation: "none",
      opacity: open ? 1 : 0,
    },
  };
}

export function Header() {
  const { pathname } = useLocation();
  if (isStorePath(pathname)) return <StoreHeader />;
  return <ExplanatoryHeader />;
}

function ExplanatoryHeader() {
  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const scrolled = useScrolledPastHero();
  const theme = useTheme();
  const { loc, t } = useLocale();
  const { pathname } = useLocation();
  const isHome = isMovementPath(pathname);
  const overHero = isHome && !scrolled;
  const headerColor = overHero ? "#fff" : "inherit";
  const flowFromLogo = theme.direction === "rtl" ? "translateX(10px)" : "translateX(-10px)";

  const nav = [
    { to: loc("/message"), label: t("navMessage") },
    { to: loc("/join"), label: t("navJoin") },
    { to: loc("/schools"), label: t("navSchools") },
    { to: loc("/"), label: t("navShop") },
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

  const mobileMenuNavItems: MobileMenuItem[] = [
    { to: loc("/message"), label: t("navMessage") },
    { to: loc("/join"), label: t("navJoin") },
    { to: loc("/schools"), label: t("navSchools") },
    { to: loc("/wholesale"), label: t("navWholesale") },
    { to: loc("/request-a-quote"), label: t("navQuote") },
    ...(FEATURES.accountPage ? [{ to: loc("/my-account"), label: t("navAccount") }] : []),
  ];

  const mobileMenuActionItems: MobileMenuItem[] = [
    { to: loc("/"), label: t("navShop") },
    { to: loc("/donate"), label: t("navDonate"), primary: true },
    { to: loc("/cart"), label: t("navCart") },
  ];

  const mobileMenuAnimTotal = mobileMenuNavItems.length + mobileMenuActionItems.length;

  const utilityStack = (
    <Stack direction="row" spacing={0.25} sx={{ alignItems: "center", overflow: "visible" }}>
      <Stack direction="row" spacing={0.25} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
        <CartButton color={headerColor} />
        {FEATURES.accountPage ? <AccountButton color={headerColor} /> : null}
      </Stack>
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
        borderBottom: "1px solid",
        borderColor: overHero ? "transparent" : "divider",
        backgroundImage: "none",
        boxShadow: "none",
        transition: `background-color ${HEADER_EXPAND_MS}ms ${headerEase}, color ${HEADER_EXPAND_MS}ms ${headerEase}, border-color ${HEADER_EXPAND_MS}ms ${headerEase}`,
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
        },
      }}
    >
      <Toolbar
        sx={{
          position: "relative",
          gap: { xs: 1, md: 2 },
          px: { xs: 2, md: 3 },
          py: 0,
          minHeight: overHero ? { xs: 80, sm: 104 } : { xs: 64, md: 72 },
          justifyContent: "space-between",
          transition: `min-height ${HEADER_EXPAND_MS}ms ${headerEase}`,
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
          },
        }}
      >
        {/* Centered hero logo — stays in the middle, fades out on scroll */}
        <Box
          component={RouterLink}
          to={loc("/movement")}
          aria-hidden={!overHero}
          tabIndex={overHero ? 0 : -1}
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            display: "flex",
            alignItems: "center",
            transform: overHero ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.94)",
            opacity: overHero ? 1 : 0,
            visibility: overHero ? "visible" : "hidden",
            pointerEvents: overHero ? "auto" : "none",
            zIndex: 3,
            transition: overHero
              ? `opacity 0.36s ${headerEase}, transform 0.36s ${headerEase}, visibility 0.36s`
              : `opacity 0.28s ease, transform 0.28s ease, visibility 0.28s`,
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
            },
          }}
        >
          <Box
            component="img"
            src={SITE.logoSrc}
            alt={t("slogan")}
            sx={{
              ...logoImgSx,
              height: { xs: 52, sm: 72 },
            }}
          />
        </Box>

        {/* Nav cluster — logo slot + links expand together from inline-start */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: overHero ? "0 0 0px" : "1 1 0%",
            minWidth: 0,
            overflow: "hidden",
            transition: overHero
              ? `flex 0.32s ease`
              : `flex ${HEADER_EXPAND_MS}ms ${headerEase}`,
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
            },
          }}
        >
          <Box
            component={RouterLink}
            to={loc("/movement")}
            aria-hidden={overHero}
            tabIndex={overHero ? -1 : 0}
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              overflow: "hidden",
              maxWidth: overHero ? 0 : 280,
              opacity: overHero ? 0 : 1,
              visibility: overHero ? "hidden" : "visible",
              pointerEvents: overHero ? "none" : "auto",
              transition: overHero
                ? `max-width 0.28s ease, opacity 0.22s ease, visibility 0.28s`
                : `max-width ${HEADER_EXPAND_MS}ms ${headerEase}, opacity 0.32s ${headerEase} 0.04s, visibility 0.32s 0.04s`,
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
              },
            }}
          >
            <Box
              component="img"
              src={SITE.logoSrc}
              alt={t("slogan")}
              sx={{
                ...logoImgSx,
                height: { xs: 28, sm: 36 },
              }}
            />
          </Box>

          <Box
            component="nav"
            aria-hidden={overHero}
            sx={{
              flex: overHero ? "0 0 0px" : "1 1 0%",
              minWidth: 0,
              overflow: "hidden",
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
              opacity: overHero ? 0 : 1,
              visibility: overHero ? "hidden" : "visible",
              pointerEvents: overHero ? "none" : "auto",
              transition: overHero
                ? `flex 0.28s ease, opacity 0.22s ease, visibility 0.28s`
                : `flex ${HEADER_EXPAND_MS}ms ${headerEase} 0.06s, opacity 0.38s ${headerEase} 0.1s, visibility 0.38s 0.1s`,
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
              },
            }}
          >
            <Stack
              direction="row"
              spacing={0.25}
              sx={{
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {nav.map((item, i) => (
                <Link
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  end={item.to === loc("/")}
                  underline="none"
                  sx={{
                    ...navLinkSx,
                    opacity: overHero ? 0 : 1,
                    transform: overHero ? flowFromLogo : "translateX(0)",
                    transformOrigin: "inline-start center",
                    transition: overHero
                      ? "opacity 0.2s ease, transform 0.2s ease"
                      : `opacity 0.36s ${headerEase} ${0.12 + i * 0.05}s, transform 0.36s ${headerEase} ${0.12 + i * 0.05}s, color 0.15s ease, background-color 0.15s ease`,
                    "@media (prefers-reduced-motion: reduce)": {
                      transition: "none",
                      opacity: overHero ? 0 : 1,
                      transform: "none",
                    },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexShrink: 0,
            alignItems: "center",
            overflow: overHero ? "hidden" : "visible",
            py: 0.5,
            maxWidth: overHero ? 0 : "none",
            opacity: overHero ? 0 : 1,
            transform: overHero ? "scaleX(0)" : "scaleX(1)",
            transformOrigin: "inline-end center",
            visibility: overHero ? "hidden" : "visible",
            pointerEvents: overHero ? "none" : "auto",
            transition: overHero
              ? `transform 0.28s ease, opacity 0.24s ease, visibility 0.28s, max-width 0.28s ease`
              : `transform ${HEADER_EXPAND_MS}ms ${headerEase} 0.18s, opacity 0.4s ${headerEase} 0.22s, visibility 0.4s 0.22s, max-width ${HEADER_EXPAND_MS}ms ${headerEase} 0.18s`,
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
            },
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
            spacing={1.5}
            sx={{
              position: "absolute",
              top: { xs: 88, sm: 96 },
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(92vw, 400px)",
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
            <Stack
              direction="row"
              useFlexGap
              sx={{ gap: 1.25, flexWrap: "wrap", justifyContent: "center" }}
            >
              {mobileMenuNavItems.map((item, i) => (
                <Link
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  underline="none"
                  onClick={closeMenu}
                  sx={mobileMenuBubbleSx(item, open, i, mobileMenuAnimTotal)}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>

            <Stack
              direction="row"
              useFlexGap
              sx={{ gap: 1.25, flexWrap: "wrap", justifyContent: "center" }}
            >
              {mobileMenuActionItems.map((item, i) => (
                <Link
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  underline="none"
                  onClick={closeMenu}
                  sx={mobileMenuBubbleSx(
                    item,
                    open,
                    mobileMenuNavItems.length + i,
                    mobileMenuAnimTotal,
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </AppBar>
  );
}
