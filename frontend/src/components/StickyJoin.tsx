import { Button } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { stripLocale } from "../i18n/locale";

export function StickyJoin() {
  const { loc, t } = useLocale();
  const { pathname } = useLocation();
  const path = stripLocale(pathname);
  if (path !== "/" && path !== "/message") return null;

  return (
    <Button
      component={RouterLink}
      to={loc("/join/commitment")}
      variant="contained"
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 16,
        insetInline: 16,
        zIndex: 20,
        minHeight: 48,
      }}
    >
      {t("ctaJoin")}
    </Button>
  );
}
