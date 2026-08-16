import { Box } from "@mui/material";
import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { StickyJoin } from "./StickyJoin";
import { LocaleContext, buildLocale } from "../i18n/useLocale";
import { langFromPath } from "../i18n/locale";

export function AppLayout() {
  const { pathname } = useLocation();
  const lang = langFromPath(pathname);
  const locale = useMemo(() => buildLocale(lang), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang === "he" ? "he" : "en";
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.title = locale.t("slogan");
  }, [lang, locale]);

  return (
    <LocaleContext.Provider value={locale}>
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", pb: { xs: 8, md: 0 } }}>
        <Header />
        <Box component="main" sx={{ flex: 1 }}>
          <Outlet />
        </Box>
        <Footer />
        <StickyJoin />
      </Box>
    </LocaleContext.Provider>
  );
}
