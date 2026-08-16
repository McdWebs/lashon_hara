import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { formatIls } from "../lib/site";
import type { WcProduct } from "../lib/catalog";
import { useLocale } from "../i18n/useLocale";

export function ProductCard({ product }: { product: WcProduct }) {
  const { loc } = useLocale();
  const img = product.images[0];
  const unit = product.prices.currency_minor_unit ?? 2;
  return (
    <Box
      component={RouterLink}
      to={loc(`/shop/product/${product.id}`)}
      sx={{
        display: "block",
        color: "inherit",
        textDecoration: "none",
        "&:hover img": { opacity: 0.92 },
      }}
    >
      <Box
        component="img"
        src={img?.src || img?.thumbnail}
        alt={img?.alt || product.name}
        sx={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", bgcolor: "#eee", display: "block" }}
      />
      <Typography variant="h3" sx={{ mt: 1.5, fontSize: "0.95rem" }}>
        {product.name}
      </Typography>
      <Typography sx={{ mt: 0.5, fontWeight: 700 }}>{formatIls(product.prices.price, unit)}</Typography>
    </Box>
  );
}
