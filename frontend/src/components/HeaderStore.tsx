import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, IconButton, Link, Modal, Stack, Toolbar } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useLocation, useSearchParams } from "react-router-dom";
import { CartButton } from "./CartButton";
import { useLocale } from "../i18n/useLocale";
import { stripLocale } from "../i18n/locale";
import { STORE_NAV_CATEGORIES } from "../lib/shop";
import { SITE } from "../lib/site";
import { isStoreLandingPath } from "../lib/siteMode";
import { useScrolledPastHero } from "../lib/useScrolledPastHero";

const HEADER_MS = 420;
const headerEase = "cubic-bezier(0.22, 0.61, 0.36, 1)";

const storeNavSx = {
  color: "inherit",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: "0.04em",
  px: 1.5,
  py: 0.75,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  opacity: 0.82,
  transition: "opacity 0.15s ease, color 0.15s ease",
  "&:hover": { opacity: 1, color: "primary.main" },
} as const;

export function StoreHeader() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolledPastHero();
  const { loc, t } = useLocale();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const overHero = isStoreLandingPath(pathname, params.get("category")) && !scrolled;
  const headerColor = overHero ? "#fff" : "inherit";
  const activeCategory = params.get("category") ?? "";
  const path = stripLocale(pathname);

  const categories = STORE_NAV_CATEGORIES.map((item) => ({
    to: loc(`/shop?category=${item.category}`),
    label: t(item.labelKey),
    category: item.category,
  }));

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
        transition: `background-color ${HEADER_MS}ms ${headerEase}, color ${HEADER_MS}ms ${headerEase}, border-color ${HEADER_MS}ms ${headerEase}`,
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      }}
    >
      <Toolbar
        sx={{
          gap: { xs: 1, md: 2 },
          px: { xs: 2, md: 3 },
          minHeight: { xs: 64, md: 72 },
          justifyContent: "space-between",
        }}
      >
        <Box
          component={RouterLink}
          to={loc("/")}
          sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <Box
            component="img"
            src={SITE.logoSrc}
            alt={t("navShop")}
            sx={{
              width: "auto",
              display: "block",
              height: { xs: 28, sm: 36 },
            }}
          />
        </Box>

        <Box
          component="nav"
          sx={{
            display: { xs: "none", md: "flex" },
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            {categories.map((item) => {
              const active = path === "/shop" && activeCategory === item.category;
              return (
                <Link
                  key={item.category}
                  component={RouterLink}
                  to={item.to}
                  underline="none"
                  sx={{
                    ...storeNavSx,
                    opacity: active ? 1 : 0.82,
                    fontWeight: active ? 700 : 500,
                    color: active ? "primary.main" : "inherit",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </Stack>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flexShrink: 0 }}>
          <Link
            component={RouterLink}
            to={loc("/movement")}
            underline="none"
            sx={{
              ...storeNavSx,
              display: { xs: "none", md: "inline-flex" },
              fontSize: 13,
              opacity: 0.7,
            }}
          >
            {t("navWhy")}
          </Link>
          <CartButton color={headerColor} />
          <IconButton
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            sx={{ display: { md: "none" }, color: headerColor }}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Stack>
      </Toolbar>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          onClick={() => setOpen(false)}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "background.paper",
            outline: "none",
            pt: 10,
            px: 3,
          }}
        >
          <Stack spacing={2.5} onClick={(e) => e.stopPropagation()} sx={{ maxWidth: 400, mx: "auto" }}>
            {categories.map((item) => (
              <Link
                key={item.category}
                component={RouterLink}
                to={item.to}
                underline="none"
                onClick={() => setOpen(false)}
                sx={{
                  color: "text.primary",
                  fontSize: 22,
                  fontWeight: 500,
                  fontFamily: '"Secular One", Heebo, sans-serif',
                }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              component={RouterLink}
              to={loc("/cart")}
              underline="none"
              onClick={() => setOpen(false)}
              sx={{ color: "text.primary", fontSize: 22, fontWeight: 500, fontFamily: '"Secular One", Heebo, sans-serif' }}
            >
              {t("navCart")}
            </Link>
            <Link
              component={RouterLink}
              to={loc("/movement")}
              underline="none"
              onClick={() => setOpen(false)}
              sx={{ color: "text.secondary", fontSize: 16, fontWeight: 500, pt: 1 }}
            >
              {t("navWhy")}
            </Link>
          </Stack>
        </Box>
      </Modal>
    </AppBar>
  );
}
