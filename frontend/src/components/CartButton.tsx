import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Badge, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { useCart } from "../lib/cart";

type CartButtonProps = {
  color?: string;
  size?: "small" | "medium";
};

export function CartButton({ color = "inherit", size = "medium" }: CartButtonProps) {
  const { loc, t } = useLocale();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <IconButton
      component={RouterLink}
      to={loc("/cart")}
      aria-label={t("navCart")}
      size={size}
      sx={{ color }}
    >
      <Badge badgeContent={count} color="primary" invisible={count === 0} max={99}>
        <ShoppingCartOutlinedIcon fontSize={size === "small" ? "small" : "medium"} />
      </Badge>
    </IconButton>
  );
}
