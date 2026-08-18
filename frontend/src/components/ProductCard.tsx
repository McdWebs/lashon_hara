import CheckIcon from "@mui/icons-material/Check";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { track } from "../lib/analytics";
import { useCart } from "../lib/cart";
import type { WcProduct } from "../lib/catalog";
import { formatIls } from "../lib/site";
import { STORE_COPY } from "../lib/storeUi";

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
  const { loc, lang } = useLocale();
  const navigate = useNavigate();
  const copy = STORE_COPY[lang];
  const addItem = useCart((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number>(0);
  const img = imageOverride?.src ?? product.images[0]?.src ?? product.images[0]?.thumbnail;
  const imgAlt = imageOverride?.alt ?? product.images[0]?.alt ?? product.name;
  const hoverImg = imageOverride?.hoverSrc ?? product.images[1]?.src ?? product.images[1]?.thumbnail;
  const unit = product.prices.currency_minor_unit ?? 2;
  const productTo = loc(`/shop/product/${product.id}`);
  const onSale =
    product.prices.regular_price &&
    product.prices.regular_price !== product.prices.price &&
    Number(product.prices.regular_price) > Number(product.prices.price);

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  async function handleQuickAdd(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (product.type === "variable") {
      navigate(productTo);
      return;
    }
    try {
      await addItem(product.id, 1);
      track("product_added_to_cart", { id: product.id, quantity: 1, source: "quick_add" });
      setAdded(true);
      window.clearTimeout(addedTimer.current);
      addedTimer.current = window.setTimeout(() => setAdded(false), 1800);
    } catch {
      /* leave the button as-is so the shopper can try again */
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        color: "inherit",
        "&:hover .product-card-img": { transform: "scale(1.025)" },
        "&:hover .product-card-hover-img": { opacity: 1 },
        "&:hover .product-card-quick-add": {
          opacity: 1,
          transform: "translateX(-50%) translateY(0)",
        },
        "&:hover .product-card-quick-fade": { opacity: 1 },
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
          component={RouterLink}
          to={productTo}
          aria-label={product.name}
          sx={{
            display: "block",
            height: "100%",
            color: "inherit",
            textDecoration: "none",
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
        </Box>
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
        <Box
          className="product-card-quick-fade"
          aria-hidden
          sx={{
            position: "absolute",
            insetInline: 0,
            bottom: 0,
            height: "42%",
            pointerEvents: "none",
            background: "linear-gradient(180deg, rgba(17,17,17,0) 0%, rgba(17,17,17,.28) 100%)",
            opacity: { xs: 1, md: added ? 1 : 0 },
            transition: "opacity .35s ease",
          }}
        />
        <Box
          className="product-card-quick-add"
          component="button"
          type="button"
          onClick={handleQuickAdd}
          aria-label={added ? copy.addedToCart : copy.addToCart}
          sx={{
            appearance: "none",
            position: "absolute",
            zIndex: 1,
            left: "50%",
            bottom: { xs: 10, md: 14 },
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.85,
            minHeight: 40,
            px: 1.75,
            border: "1px solid rgba(17,17,17,.08)",
            borderRadius: "999px",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: added ? "#fffdf8" : "#111",
            bgcolor: added ? "#123e3e" : "rgba(255,253,248,.94)",
            boxShadow: added
              ? "0 10px 24px rgba(18,62,62,.28)"
              : "0 10px 28px rgba(17,17,17,.16)",
            backdropFilter: added ? "none" : "blur(12px)",
            WebkitBackdropFilter: added ? "none" : "blur(12px)",
            opacity: { xs: 1, md: added ? 1 : 0 },
            transform: {
              xs: "translateX(-50%)",
              md: added ? "translateX(-50%)" : "translateX(-50%) translateY(10px)",
            },
            transition:
              "opacity .3s ease, transform .3s cubic-bezier(.2,.7,.2,1), background-color .25s ease, color .25s ease, box-shadow .25s ease",
            "&:hover": {
              bgcolor: added ? "#0f3535" : "#fffdf8",
              boxShadow: added
                ? "0 12px 28px rgba(18,62,62,.32)"
                : "0 12px 32px rgba(17,17,17,.2)",
            },
            "&:active": {
              transform: "translateX(-50%) scale(0.97)",
            },
            "& .MuiSvgIcon-root": { fontSize: 16 },
          }}
        >
          {added ? <CheckIcon /> : <ShoppingBagOutlinedIcon />}
          {added ? copy.addedToCart : copy.addToCart}
        </Box>
      </Box>
      <Box
        component={RouterLink}
        to={productTo}
        sx={{ pt: { xs: 1.25, md: 1.6 }, pb: 1, color: "inherit", textDecoration: "none" }}
      >
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
