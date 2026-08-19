import { Box } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { AccessibilityWidget } from "./AccessibilityWidget";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SkipLink } from "./SkipLink";
import { LocaleContext, buildLocale } from "../i18n/useLocale";
import { langFromPath } from "../i18n/locale";
import { useCart } from "../lib/cart";
import { isFullBleedPath, isStorePath } from "../lib/siteMode";

export function AppLayout() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const lang = langFromPath(pathname);
  const locale = useMemo(() => buildLocale(lang), [lang]);
  const search = params.toString();
  const fullBleed = isFullBleedPath(pathname, params.get("category"), params.get("view"));
  const store = isStorePath(pathname);
  const hydrateCart = useCart((s) => s.hydrate);

  useEffect(() => {
    document.documentElement.lang = lang === "he" ? "he" : "en";
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.title = locale.t("slogan");
  }, [lang, locale]);

  useEffect(() => {
    hydrateCart();
  }, [hydrateCart]);

  const prevPath = useRef(pathname + search);
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "auto";
    }
  }, []);
  useEffect(() => {
    const current = pathname + search;
    if (current !== prevPath.current) {
      window.scrollTo(0, 0);
      prevPath.current = current;
    }
  }, [pathname, search]);

  return (
    <LocaleContext.Provider value={locale}>
      <SkipLink />
      <Box
        className={`a11y-zoom-scope${store ? " store-shell" : ""}`}
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Header />
        <Box
          id="main-content"
          component="main"
          sx={{
            flex: 1,
            pt: fullBleed ? 0 : store ? { xs: "64px", md: "74px" } : { xs: "64px", md: "72px" },
          }}
        >
          <Outlet />
        </Box>
        <Footer />
      </Box>
      <AccessibilityWidget />
    </LocaleContext.Provider>
  );
}
