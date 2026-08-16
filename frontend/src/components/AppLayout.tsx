import { Box } from "@mui/material";
import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { WhatsAppFab } from "./WhatsAppFab";
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
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <Box component="main" sx={{ flex: 1 }}>
          {locale.t("enNotice") ? (
            <Box sx={{ bgcolor: "#fff3f3", px: 2, py: 1, textAlign: "center", fontSize: 14 }}>{locale.t("enNotice")}</Box>
          ) : null}
          <Outlet />
        </Box>
        <Footer />
        <WhatsAppFab />
      </Box>
    </LocaleContext.Provider>
  );
}
