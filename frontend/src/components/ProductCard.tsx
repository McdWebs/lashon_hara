import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { BUNDLE_PRODUCT_IDS } from "../lib/bundles";
import type { WcProduct } from "../lib/catalog";
import { useLocale } from "../i18n/useLocale";
import { formatIls } from "../lib/site";

export function ProductCard({ product }: { product: WcProduct }) {
  const { loc, lang } = useLocale();
  const img = product.images[0];
  const unit = product.prices.currency_minor_unit ?? 2;
  const isBundle = (BUNDLE_PRODUCT_IDS as readonly number[]).includes(product.id);
  const onSale =
    product.prices.regular_price &&
    product.prices.regular_price !== product.prices.price &&
    Number(product.prices.regular_price) > Number(product.prices.price);

  return (
    <Card
      component={RouterLink}
      to={loc(`/shop/product/${product.id}`)}
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        color: "inherit",
        textDecoration: "none",
        transition: "transform 0.15s ease, border-color 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "rgba(17,17,17,0.28)",
          "& .product-card-img": { transform: "scale(1.03)" },
        },
      }}
    >
      <Box sx={{ overflow: "hidden", bgcolor: "#eee", aspectRatio: "1 / 1", position: "relative" }}>
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
            transition: "transform 0.25s ease",
          }}
        />
        {(isBundle || onSale) && (
          <Box sx={{ position: "absolute", top: 8, insetInlineStart: 8, display: "flex", gap: 0.5 }}>
            {isBundle && (
              <Chip
                label={lang === "en" ? "Set" : "סט"}
                size="small"
                sx={{ bgcolor: "#111", color: "#fff", fontWeight: 700, height: 24 }}
              />
            )}
            {onSale && (
              <Chip
                label={lang === "en" ? "Sale" : "מבצע"}
                size="small"
                color="primary"
                sx={{ fontWeight: 700, height: 24 }}
              />
            )}
          </Box>
        )}
      </Box>
      <CardContent sx={{ flex: 1, pt: 1.5, pb: "16px !important" }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: "0.95rem",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </Typography>
        <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
          <Typography sx={{ fontWeight: 800, color: "primary.main", fontSize: "1.05rem" }}>
            {formatIls(product.prices.price, unit)}
          </Typography>
          {onSale && (
            <Typography
              sx={{ textDecoration: "line-through", color: "text.secondary", fontSize: "0.85rem" }}
            >
              {formatIls(product.prices.regular_price, unit)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
