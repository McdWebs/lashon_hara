import { Link } from "@mui/material";
import { useLocale } from "../i18n/useLocale";

export function SkipLink() {
  const { t } = useLocale();

  return (
    <Link
      href="#main-content"
      sx={{
        position: "absolute",
        insetInlineStart: 8,
        top: -80,
        zIndex: 2000,
        bgcolor: "#111",
        color: "#fff",
        px: 2,
        py: 1,
        borderRadius: 1,
        fontSize: 14,
        fontWeight: 600,
        textDecoration: "none",
        transition: "top .15s ease",
        "&:focus-visible": {
          top: 8,
        },
      }}
    >
      {t("skipToContent")}
    </Link>
  );
}
