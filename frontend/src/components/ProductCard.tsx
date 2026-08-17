import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import { Box, Button, Card, CardContent, Chip, Typography } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { BUNDLE_PRODUCT_IDS } from "../lib/bundles";
import type { WcProduct } from "../lib/catalog";
import { useLocale } from "../i18n/useLocale";
import { track } from "../lib/analytics";
import { useCart } from "../lib/cart";
import { formatIls, SCHOOLS_PRODUCT_ID } from "../lib/site";

export function ProductCard({ product }: { product: WcProduct }) {
  const { loc, lang } = useLocale();
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const img = product.images[0];
  const unit = product.prices.currency_minor_unit ?? 2;
  const productTo = loc(`/shop/product/${product.id}`);
  const isBundle = (BUNDLE_PRODUCT_IDS as readonly number[]).includes(product.id);
  const canQuickAdd = product.id !== SCHOOLS_PRODUCT_ID;
  const onSale =
    product.prices.regular_price &&
    product.prices.regular_price !== product.prices.price &&
    Number(product.prices.regular_price) > Number(product.prices.price);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.prices.price,
        currencyMinorUnit: unit,
        image: img?.src || img?.thumbnail,
      },
      1,
    );
    track("product_added_to_cart", { id: product.id, quantity: 1, source: "quick_add" });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s ease, border-color 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "rgba(17,17,17,0.28)",
          "& .product-card-img": { transform: "scale(1.03)" },
        },
      }}
    >
      <Box
        component={RouterLink}
        to={productTo}
        sx={{
          overflow: "hidden",
          bgcolor: "#eee",
          aspectRatio: "1 / 1",
          position: "relative",
          color: "inherit",
          textDecoration: "none",
          display: "block",
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
      <CardContent
        sx={{
          flex: 1,
          pt: 1.5,
          pb: "16px !important",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        <Typography
          component={RouterLink}
          to={productTo}
          variant="h3"
          sx={{
            fontSize: "0.95rem",
            lineHeight: 1.35,
            minHeight: "calc(0.95rem * 1.35 * 2)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            color: "text.primary",
            textDecoration: "none",
            "&:hover": { color: "primary.main" },
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
        <Box sx={{ mt: "auto", pt: 1.5, minHeight: 40 }}>
          {canQuickAdd ? (
            <Button
              size="small"
              variant={added ? "contained" : "outlined"}
              startIcon={<AddShoppingCartOutlinedIcon />}
              onClick={handleQuickAdd}
              disabled={added}
              fullWidth
              sx={{ fontWeight: 700, height: 36 }}
            >
              {added
                ? lang === "en"
                  ? "Added"
                  : "נוסף לסל"
                : lang === "en"
                  ? "Add to cart"
                  : "הוספה לסל"}
            </Button>
          ) : (
            <Button
              component={RouterLink}
              to={productTo}
              size="small"
              variant="outlined"
              fullWidth
              sx={{ fontWeight: 700, height: 36 }}
            >
              {lang === "en" ? "View details" : "לפרטים"}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
