import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { AppBar, Badge, Box, Drawer, IconButton, Link, Stack, Toolbar, useTheme } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useLocation, useSearchParams } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { stripLocale } from "../i18n/locale";
import { useCart } from "../lib/cart";
import { SITE } from "../lib/site";
import { isStoreLandingPath } from "../lib/siteMode";
import { STORE_COPY, STORE_MAX_WIDTH } from "../lib/storeUi";
import { useScrolledPastHero } from "../lib/useScrolledPastHero";
import { StoreCartDrawer } from "./StoreCartDrawer";
import { StoreSearch } from "./StoreSearch";

const HEADER_EXPAND_MS = 560;
const headerEase = "cubic-bezier(0.22, 0.61, 0.36, 1)";

const logoImgSx = {
  width: "auto",
  display: "block",
} as const;

const categories = [
  { category: "146", he: "לבוש", en: "Apparel" },
  { category: "20", he: "צמידים", en: "Bracelets" },
  { category: "18", he: "אביזרים", en: "Accessories" },
] as const;

export function StoreHeaderEditorial() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { lang, loc } = useLocale();
  const theme = useTheme();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const scrolled = useScrolledPastHero();
  const copy = STORE_COPY[lang];
  const overHero = isStoreLandingPath(pathname, params.get("category"), params.get("view")) && !scrolled;
  const count = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const currentCategory = params.get("category");
  const path = stripLocale(pathname);
  const flowFromLogo = theme.direction === "rtl" ? "translateX(10px)" : "translateX(-10px)";

  const utilityButtonSx = {
    color: "inherit",
    width: 42,
    height: 42,
    borderRadius: 0,
    "&:hover": { bgcolor: "rgba(17,17,17,.05)" },
  } as const;

  const categoryLinkSx = (active: boolean, index: number) => ({
    color: "inherit",
    px: 1.5,
    py: 0.75,
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    letterSpacing: "0.03em",
    position: "relative" as const,
    display: "inline-block",
    opacity: overHero ? 0 : active ? 1 : 0.72,
    transform: overHero ? flowFromLogo : "translateX(0)",
    transformOrigin: "inline-start center",
    textDecoration: "none",
    whiteSpace: "nowrap" as const,
    transition: overHero
      ? "opacity 0.2s ease, transform 0.2s ease"
      : `opacity 0.36s ${headerEase} ${0.12 + index * 0.05}s, transform 0.36s ${headerEase} ${0.12 + index * 0.05}s`,
    "&:hover": {
      opacity: 1,
      textDecoration: "none",
      bgcolor: "transparent",
    },
    "&::after": {
      content: '""',
      position: "absolute" as const,
      insetInlineStart: 12,
      insetInlineEnd: 12,
      bottom: 2,
      height: "1px",
      bgcolor: "currentColor",
      transform: active ? "scaleX(1)" : "scaleX(0)",
      transformOrigin: "center",
      transition: "transform .22s cubic-bezier(.2,.7,.2,1)",
      pointerEvents: "none" as const,
    },
    "&:hover::after": { transform: "scaleX(1)" },
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
      opacity: overHero ? 0 : active ? 1 : 0.72,
      transform: "none",
    },
  });

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,253,248,.97)",
          color: "#111",
          backgroundImage: "none",
          borderBottom: "1px solid",
          borderColor: overHero ? "transparent" : "rgba(17,17,17,.12)",
          boxShadow: "none",
          transform: overHero ? "translateY(-100%)" : "translateY(0)",
          opacity: overHero ? 0 : 1,
          visibility: overHero ? "hidden" : "visible",
          pointerEvents: overHero ? "none" : "auto",
          transition: `transform ${HEADER_EXPAND_MS}ms ${headerEase}, opacity ${HEADER_EXPAND_MS}ms ${headerEase}, visibility ${HEADER_EXPAND_MS}ms ${headerEase}, border-color ${HEADER_EXPAND_MS}ms ${headerEase}`,
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            width: "100%",
            maxWidth: STORE_MAX_WIDTH,
            mx: "auto",
            gap: { xs: 1, md: 2 },
            px: { xs: 1.5, md: 3 },
            py: 0,
            minHeight: { xs: 64, md: 74 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr auto", md: "1fr auto 1fr" },
            alignItems: "center",
          }}
        >
          <Box
            component={RouterLink}
            to={loc("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              justifySelf: "start",
              opacity: overHero ? 0 : 1,
              transform: overHero ? "translateY(-8px)" : "translateY(0)",
              transition: overHero
                ? "opacity 0.2s ease, transform 0.2s ease"
                : `opacity 0.32s ${headerEase} 0.04s, transform 0.32s ${headerEase} 0.04s`,
              "@media (prefers-reduced-motion: reduce)": { transition: "none" },
            }}
          >
            <Box
              component="img"
              src={SITE.logoSrc}
              alt={SITE.name}
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
              justifySelf: "center",
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              opacity: overHero ? 0 : 1,
              visibility: overHero ? "hidden" : "visible",
              pointerEvents: overHero ? "none" : "auto",
              transition: overHero
                ? "opacity 0.22s ease, visibility 0.28s"
                : `opacity 0.38s ${headerEase} 0.1s, visibility 0.38s 0.1s`,
              "@media (prefers-reduced-motion: reduce)": { transition: "none" },
            }}
          >
            <Stack direction="row" sx={{ alignItems: "center", flexShrink: 0 }}>
              {categories.map((item, index) => {
                const active = path === "/shop" && currentCategory === item.category;
                return (
                  <Link
                    key={item.category}
                    component={RouterLink}
                    to={loc(`/shop?category=${item.category}`)}
                    underline="none"
                    sx={categoryLinkSx(active, index)}
                  >
                    {item[lang]}
                  </Link>
                );
              })}
            </Stack>
          </Box>

          <Stack
            direction="row"
            sx={{
              justifySelf: "end",
              flexShrink: 0,
              alignItems: "center",
              py: 0.5,
              opacity: overHero ? 0 : 1,
              transform: overHero ? "translateY(-8px)" : "translateY(0)",
              visibility: overHero ? "hidden" : "visible",
              pointerEvents: overHero ? "none" : "auto",
              transition: overHero
                ? "opacity 0.24s ease, transform 0.24s ease, visibility 0.28s"
                : `opacity 0.4s ${headerEase} 0.18s, transform 0.4s ${headerEase} 0.18s, visibility 0.4s 0.18s`,
              "@media (prefers-reduced-motion: reduce)": { transition: "none" },
            }}
          >
            <Link
              component={RouterLink}
              to={loc("/movement")}
              underline="none"
              sx={{
                display: { xs: "none", md: "inline-flex" },
                color: "inherit",
                fontSize: 12,
                fontWeight: 500,
                px: 1.25,
                opacity: 0.72,
                whiteSpace: "nowrap",
                "&:hover": { opacity: 1 },
              }}
            >
              {copy.why}
            </Link>
            <IconButton aria-label={copy.search} onClick={() => setSearchOpen(true)} sx={utilityButtonSx}>
              <SearchIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label={copy.cart} onClick={() => setCartOpen(true)} sx={utilityButtonSx}>
              <Badge
                badgeContent={count}
                invisible={count === 0}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#111",
                    color: "#fff",
                    fontSize: 9,
                    minWidth: 16,
                    height: 16,
                  },
                }}
              >
                <ShoppingBagOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
            <IconButton
              aria-label={copy.menu}
              onClick={() => setMenuOpen(true)}
              sx={{ ...utilityButtonSx, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor={lang === "he" ? "right" : "left"}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        slotProps={{
          paper: { sx: { width: "100%", bgcolor: "#f8f6f1", backgroundImage: "none" } },
        }}
      >
        <Stack sx={{ minHeight: "100%", p: 2.5 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Box component="img" src={SITE.logoSrc} alt={SITE.name} sx={{ height: 32, width: "auto" }} />
            <IconButton onClick={() => setMenuOpen(false)} aria-label={lang === "en" ? "Close menu" : "סגירת תפריט"}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack component="nav" sx={{ flex: 1, justifyContent: "center", gap: 1 }}>
            <Link
              component={RouterLink}
              to={loc("/shop")}
              onClick={() => setMenuOpen(false)}
              underline="none"
              sx={{ color: "inherit", fontFamily: '"Secular One", Heebo, sans-serif', fontSize: 38, lineHeight: 1.25 }}
            >
              {lang === "en" ? "Shop all" : "כל החנות"}
            </Link>
            {categories.map((item) => (
              <Link
                key={item.category}
                component={RouterLink}
                to={loc(`/shop?category=${item.category}`)}
                onClick={() => setMenuOpen(false)}
                underline="none"
                sx={{ color: "inherit", fontFamily: '"Secular One", Heebo, sans-serif', fontSize: 38, lineHeight: 1.25 }}
              >
                {item[lang]}
              </Link>
            ))}
          </Stack>
          <Link
            component={RouterLink}
            to={loc("/movement")}
            onClick={() => setMenuOpen(false)}
            underline="none"
            sx={{ color: "inherit", fontSize: 15, borderTop: "1px solid rgba(17,17,17,.14)", pt: 2 }}
          >
            {copy.why}
          </Link>
        </Stack>
      </Drawer>

      <StoreSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <StoreCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
