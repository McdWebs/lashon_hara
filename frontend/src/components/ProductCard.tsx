import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { WcProduct } from "../lib/catalog";
import { useLocale } from "../i18n/useLocale";
import { formatIls } from "../lib/site";

export function ProductCard({ product }: { product: WcProduct }) {
  const { loc } = useLocale();
  const img = product.images[0];
  const unit = product.prices.currency_minor_unit ?? 2;
  const productTo = loc(`/shop/product/${product.id}`);
  const onSale =
    product.prices.regular_price &&
    product.prices.regular_price !== product.prices.price &&
    Number(product.prices.regular_price) > Number(product.prices.price);

  return (
    <Box
      component={RouterLink}
      to={productTo}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        color: "inherit",
        textDecoration: "none",
        "&:hover .product-card-img": { transform: "scale(1.04)" },
        "&:hover .product-card-name": { color: "text.primary" },
      }}
    >
      <Box
        sx={{
          overflow: "hidden",
          bgcolor: "#f3efe6",
          aspectRatio: "1 / 1",
          position: "relative",
        }}
      >
        <Box
          className="product-card-img"
          component="img"
          src={img?.src || img?.thumbnail}
          alt={img?.alt || product.name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.45s ease",
          }}
        />
      </Box>
      <Box sx={{ pt: 1.75, pb: 1 }}>
        <Typography
          className="product-card-name"
          sx={{
            fontSize: "0.92rem",
            fontWeight: 500,
            lineHeight: 1.4,
            minHeight: "calc(0.92rem * 1.4 * 2)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            color: "text.primary",
          }}
        >
          {product.name}
        </Typography>
        <Box sx={{ mt: 0.75, display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
            {formatIls(product.prices.price, unit)}
          </Typography>
          {onSale && (
            <Typography
              sx={{ textDecoration: "line-through", color: "text.secondary", fontSize: "0.8rem" }}
            >
              {formatIls(product.prices.regular_price, unit)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
