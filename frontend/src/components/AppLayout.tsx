import { Box } from "@mui/material";
import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { LocaleContext, buildLocale } from "../i18n/useLocale";
import { langFromPath } from "../i18n/locale";
import { isFullBleedPath, isStorePath } from "../lib/siteMode";

export function AppLayout() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const lang = langFromPath(pathname);
  const locale = useMemo(() => buildLocale(lang), [lang]);
  const search = params.toString();
  const fullBleed = isFullBleedPath(pathname, params.get("category"), params.get("view"));
  const store = isStorePath(pathname);

  useEffect(() => {
    document.documentElement.lang = lang === "he" ? "he" : "en";
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.title = locale.t("slogan");
  }, [lang, locale]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return (
    <LocaleContext.Provider value={locale}>
      <Box
        className={store ? "store-shell" : undefined}
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Header />
        <Box
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
    </LocaleContext.Provider>
  );
}
