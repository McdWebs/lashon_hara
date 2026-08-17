import { Box } from "@mui/material";
import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { LocaleContext, buildLocale } from "../i18n/useLocale";
import { langFromPath, stripLocale } from "../i18n/locale";

export function AppLayout() {
  const { pathname } = useLocation();
  const lang = langFromPath(pathname);
  const locale = useMemo(() => buildLocale(lang), [lang]);
  const path = stripLocale(pathname);
  const isHome = path === "/";

  useEffect(() => {
    document.documentElement.lang = lang === "he" ? "he" : "en";
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.title = locale.t("slogan");
  }, [lang, locale]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <LocaleContext.Provider value={locale}>
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <Box component="main" sx={{ flex: 1, pt: isHome ? 0 : { xs: "64px", md: "72px" } }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </LocaleContext.Provider>
  );
}
