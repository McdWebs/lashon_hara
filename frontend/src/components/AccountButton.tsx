import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";

type AccountButtonProps = {
  color?: string;
  size?: "small" | "medium";
};

export function AccountButton({ color = "inherit", size = "medium" }: AccountButtonProps) {
  const { loc, t } = useLocale();

  return (
    <IconButton
      component={RouterLink}
      to={loc("/my-account")}
      aria-label={t("navAccount")}
      size={size}
      sx={{ color }}
    >
      <PersonOutlinedIcon fontSize={size === "small" ? "small" : "medium"} />
    </IconButton>
  );
}
