import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { WcProduct } from "../lib/catalog";
import { useLocale } from "../i18n/useLocale";
import { formatIls } from "../lib/site";

type ProductCardImageOverride = {
  src: string;
  alt?: string;
  hoverSrc?: string;
};

export function ProductCard({
  product,
  imageOverride,
}: {
  product: WcProduct;
  imageOverride?: ProductCardImageOverride;
}) {
  const { loc } = useLocale();
  const img = imageOverride?.src ?? product.images[0]?.src ?? product.images[0]?.thumbnail;
  const imgAlt = imageOverride?.alt ?? product.images[0]?.alt ?? product.name;
  const hoverImg = imageOverride?.hoverSrc ?? product.images[1]?.src ?? product.images[1]?.thumbnail;
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
        "&:hover .product-card-img": { transform: "scale(1.025)" },
        "&:hover .product-card-hover-img": { opacity: 1 },
      }}
    >
      <Box
        sx={{
          overflow: "hidden",
          bgcolor: "#eee9e0",
          aspectRatio: "4 / 5",
          position: "relative",
        }}
      >
        <Box
          className="product-card-img"
          component="img"
          src={img}
          alt={imgAlt}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.65s cubic-bezier(.2,.7,.2,1)",
          }}
        />
        {hoverImg && (
          <Box
            className="product-card-hover-img"
            component="img"
            src={hoverImg}
            alt=""
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0,
              transition: "opacity .35s ease",
            }}
          />
        )}
        {onSale && (
          <Typography
            component="span"
            sx={{
              position: "absolute",
              insetInlineStart: 10,
              top: 10,
              bgcolor: "#fffdf8",
              color: "#111",
              px: 1,
              py: 0.5,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              lineHeight: 1,
            }}
          >
            SALE
          </Typography>
        )}
      </Box>
      <Box sx={{ pt: { xs: 1.25, md: 1.6 }, pb: 1 }}>
        <Typography
          className="product-card-name"
          sx={{
            fontSize: { xs: "0.82rem", md: "0.91rem" },
            fontWeight: 500,
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            color: "text.primary",
          }}
        >
          {product.name}
        </Typography>
        <Box sx={{ mt: 0.55, display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: "0.81rem", md: "0.88rem" } }}>
            {formatIls(product.prices.price, unit)}
          </Typography>
          {onSale && (
            <Typography
              sx={{ textDecoration: "line-through", color: "text.secondary", fontSize: "0.75rem" }}
            >
              {formatIls(product.prices.regular_price, unit)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
