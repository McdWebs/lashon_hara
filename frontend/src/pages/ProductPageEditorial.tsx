import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import { Alert, Box, Button, Collapse, Snackbar, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductGrid";
import { ProductOrderNotice } from "../components/ProductOrderNotice";
import { QuantityStepper } from "../components/QuantityStepper";
import { ErrorState, ProductGridSkeleton, ProductPageSkeleton } from "../components/States";
import { VariationPicker } from "../components/VariationPicker";
import { useLocale } from "../i18n/useLocale";
import { track } from "../lib/analytics";
import { useCart } from "../lib/cart";
import { fetchProduct, fetchRelatedProducts } from "../lib/catalog";
import {
  clampOrderQuantity,
  formatOrderRulesNotice,
  getProductOrderRules,
} from "../lib/productOrderRules";
import { formatIls, SCHOOLS_PRODUCT_ID } from "../lib/site";
import { STORE_MAX_WIDTH } from "../lib/storeUi";
import { ProductPage } from "./ProductPage";

function DetailRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ borderTop: "1px solid rgba(17,17,17,.14)" }}>
      <Button
        fullWidth
        onClick={() => setOpen((value) => !value)}
        endIcon={
          <AddIcon
            sx={{
              transform: open ? "rotate(45deg)" : "rotate(0)",
              transition: "transform .25s ease",
            }}
          />
        }
        sx={{
          minHeight: 58,
          px: 0,
          color: "inherit",
          justifyContent: "space-between",
          fontSize: 14,
          fontWeight: 600,
          "& .MuiButton-endIcon": { ms: "auto" },
        }}
      >
        {title}
      </Button>
      <Collapse in={open}>
        <Box sx={{ pb: 3, color: "rgba(17,17,17,.67)", fontSize: 14, lineHeight: 1.75 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}

export function ProductPageEditorial() {
  const { id } = useParams();
  const { lang, loc } = useLocale();
  const addItem = useCart((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackError, setSnackError] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [variationId, setVariationId] = useState<number | null>(null);
  const query = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id ?? ""),
    enabled: Boolean(id),
  });
  const categoryId = query.data?.categories[0]?.id;
  const related = useQuery({
    queryKey: ["related", id, categoryId, "editorial"],
    queryFn: () => fetchRelatedProducts(categoryId!, Number(id), 4),
    enabled: Boolean(query.data && categoryId && query.data.id !== SCHOOLS_PRODUCT_ID),
  });

  useEffect(() => {
    setImageIndex(0);
    setVariationId(null);
  }, [id]);

  useEffect(() => {
    if (!query.data) return;
    setQuantity(getProductOrderRules(query.data).min);
  }, [query.data?.id]);

  useEffect(() => {
    if (query.data) track("product_viewed", { id: query.data.id, name: query.data.name });
  }, [query.data]);

  if (query.isLoading) return <ProductPageSkeleton />;
  if (query.isError || !query.data) {
    return (
      <Box sx={{ maxWidth: STORE_MAX_WIDTH, mx: "auto", px: 2.5, py: 8 }}>
        <ErrorState message={lang === "en" ? "This product could not be found." : "המוצר לא נמצא."} />
      </Box>
    );
  }
  if (query.data.id === SCHOOLS_PRODUCT_ID) return <ProductPage />;

  const product = query.data;
  const orderRules = getProductOrderRules(product);
  const images = product.images;
  const image = images[imageIndex] ?? images[0];
  const unit = product.prices.currency_minor_unit ?? 2;
  const onSale =
    product.prices.regular_price &&
    Number(product.prices.regular_price) > Number(product.prices.price);
  const isVariable = product.type === "variable";
  const canAddToCart = !isVariable || Boolean(variationId);

  async function addToCart() {
    const targetId = isVariable ? variationId : product.id;
    if (!targetId) return;
    const qty = clampOrderQuantity(quantity, orderRules);
    if (qty !== quantity) setQuantity(qty);
    if (qty < orderRules.min) {
      setSnackError(true);
      setSnackMessage(formatOrderRulesNotice(orderRules, lang));
      setSnackOpen(true);
      return;
    }
    setAdding(true);
    try {
      await addItem(targetId, qty);
      track("product_added_to_cart", { id: targetId, quantity: qty });
      setSnackError(false);
      setSnackMessage("");
      setSnackOpen(true);
    } catch (err) {
      setSnackError(true);
      setSnackMessage(
        err instanceof Error
          ? err.message
          : lang === "en"
            ? "Couldn't add to cart. Please try again."
            : "לא הצלחנו להוסיף לסל. נסו שוב.",
      );
      setSnackOpen(true);
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <Box sx={{ bgcolor: "#f8f6f1", pb: { xs: 10, md: 13 } }}>
        <Box sx={{ maxWidth: STORE_MAX_WIDTH, mx: "auto", px: { xs: 0, md: 3.5 } }}>
          <Button
            component={RouterLink}
            to={loc("/shop")}
            startIcon={<ArrowBackIcon sx={{ transform: lang === "he" ? "rotate(180deg)" : "none" }} />}
            sx={{ display: { xs: "none", md: "inline-flex" }, color: "inherit", px: 0, my: 3, fontSize: 12 }}
          >
            {lang === "en" ? "Back to shop" : "חזרה לחנות"}
          </Button>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.2fr) minmax(380px, .8fr)" },
              gap: { md: 7, lg: 10 },
              alignItems: "start",
            }}
          >
            <Box sx={{ display: { md: "grid" }, gridTemplateColumns: images.length > 1 ? "78px 1fr" : "1fr", gap: 1.5 }}>
              {images.length > 1 && (
                <Stack sx={{ display: { xs: "none", md: "flex" }, gap: 1.25 }}>
                  {images.map((thumb, index) => (
                    <Box
                      key={thumb.src}
                      component="button"
                      type="button"
                      onClick={() => setImageIndex(index)}
                      aria-label={`${lang === "en" ? "View image" : "הצגת תמונה"} ${index + 1}`}
                      sx={{
                        p: 0,
                        border: "1px solid",
                        borderColor: imageIndex === index ? "#111" : "transparent",
                        bgcolor: "#eee9e0",
                        cursor: "pointer",
                        aspectRatio: "4 / 5",
                      }}
                    >
                      <Box component="img" src={thumb.thumbnail || thumb.src} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </Box>
                  ))}
                </Stack>
              )}
              <Box
                sx={{
                  bgcolor: "#eee9e0",
                  aspectRatio: { xs: "4 / 5", md: "4 / 5.15" },
                  overflow: "hidden",
                }}
              >
                {image && (
                  <Box
                    component="img"
                    src={image.src}
                    alt={image.alt || product.name}
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                )}
              </Box>
              {images.length > 1 && (
                <Stack
                  direction="row"
                  sx={{
                    display: { xs: "flex", md: "none" },
                    gap: 0.75,
                    px: 2,
                    pt: 1.25,
                    overflowX: "auto",
                  }}
                >
                  {images.map((thumb, index) => (
                    <Box
                      key={thumb.src}
                      component="button"
                      type="button"
                      onClick={() => setImageIndex(index)}
                      sx={{
                        p: 0,
                        width: 64,
                        flex: "0 0 64px",
                        border: "1px solid",
                        borderColor: imageIndex === index ? "#111" : "transparent",
                        bgcolor: "#eee9e0",
                      }}
                    >
                      <Box component="img" src={thumb.thumbnail || thumb.src} alt="" sx={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", display: "block" }} />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Box sx={{ px: { xs: 2.5, md: 0 }, pt: { xs: 4, md: 3 }, position: { md: "sticky" }, top: { md: 132 } }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(17,17,17,.5)" }}>
                {product.categories[0]?.name ?? (lang === "en" ? "The collection" : "הקולקציה")}
              </Typography>
              <Typography
                component="h1"
                sx={{
                  mt: 1.2,
                  fontFamily: '"Secular One", Heebo, sans-serif',
                  fontSize: { xs: 34, md: 46 },
                  lineHeight: 1.08,
                  letterSpacing: "-0.025em",
                }}
              >
                {product.name}
              </Typography>
              <Stack direction="row" sx={{ mt: 2, alignItems: "baseline", gap: 1.2 }}>
                <Typography sx={{ fontSize: 19, fontWeight: 600 }}>
                  {formatIls(product.prices.price, unit)}
                </Typography>
                {onSale && (
                  <Typography sx={{ fontSize: 14, color: "text.secondary", textDecoration: "line-through" }}>
                    {formatIls(product.prices.regular_price, unit)}
                  </Typography>
                )}
              </Stack>
              <Box
                sx={{
                  mt: 3,
                  color: "rgba(17,17,17,.67)",
                  fontSize: 15,
                  lineHeight: 1.75,
                  "& p": { my: 1 },
                }}
                dangerouslySetInnerHTML={{ __html: product.short_description || "" }}
              />

              {isVariable && product.attributes && product.variations && (
                <VariationPicker
                  attributes={product.attributes}
                  variations={product.variations}
                  onResolve={setVariationId}
                />
              )}

              <ProductOrderNotice rules={orderRules} lang={lang} />

              <Stack direction="row" sx={{ mt: 3.5, gap: 1.5, alignItems: "stretch" }}>
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  min={orderRules.min}
                  max={orderRules.max}
                  step={orderRules.step}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={addToCart}
                  disabled={adding || !canAddToCart}
                  sx={{ flex: 1, minHeight: 50 }}
                >
                  {isVariable && !canAddToCart
                    ? lang === "en"
                      ? "Choose options"
                      : "בחירת אפשרויות"
                    : lang === "en"
                      ? "Add to cart"
                      : "הוספה לסל"}
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 2.5, alignItems: "center", color: "rgba(17,17,17,.66)" }}>
                <CheckIcon sx={{ fontSize: 17 }} />
                <Typography sx={{ fontSize: 12 }}>
                  {lang === "en" ? "Personal service and delivery across Israel" : "שירות אישי ומשלוח לכל הארץ"}
                </Typography>
              </Stack>

              <Box sx={{ mt: 4 }}>
                <DetailRow title={lang === "en" ? "Product details" : "פרטי המוצר"}>
                  <Box dangerouslySetInnerHTML={{ __html: product.description || product.short_description || "" }} />
                </DetailRow>
                <DetailRow title={lang === "en" ? "Shipping & service" : "משלוחים ושירות"}>
                  {lang === "en"
                    ? "We deliver throughout Israel. For timing, bulk orders, or any question, our team is available on WhatsApp."
                    : "אנחנו שולחים לכל הארץ. לזמני אספקה, הזמנות בכמות או כל שאלה אחרת — הצוות שלנו זמין ב-WhatsApp."}
                </DetailRow>
                <DetailRow title={lang === "en" ? "Why this matters" : "למה זה חשוב"}>
                  {lang === "en"
                    ? "Every piece carries a simple choice into everyday life: to speak differently."
                    : "כל פריט מכניס לחיי היום־יום בחירה פשוטה: לדבר אחרת."}
                </DetailRow>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {(related.isLoading || related.data?.items.length) && (
        <Box sx={{ bgcolor: "#fffdf8", py: { xs: 7, md: 11 } }}>
          <Box sx={{ maxWidth: STORE_MAX_WIDTH, mx: "auto", px: { xs: 2, md: 3.5 } }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", mb: 1 }}>
              {lang === "en" ? "Wear it with" : "להמשיך מכאן"}
            </Typography>
            <Typography sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: { xs: 34, md: 48 }, mb: 4 }}>
              {lang === "en" ? "You may also like" : "אולי תאהבו גם"}
            </Typography>
            {related.isLoading ? <ProductGridSkeleton count={4} /> : related.data && <ProductGrid products={related.data.items} columns={4} />}
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          insetInline: 0,
          bottom: 0,
          zIndex: 1100,
          bgcolor: "#fffdf8",
          borderTop: "1px solid rgba(17,17,17,.14)",
          px: 2,
          py: 1.25,
          pb: "calc(10px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, minWidth: 70 }}>
            {formatIls(product.prices.price, unit)}
          </Typography>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={addToCart}
            disabled={adding || !canAddToCart}
          >
            {isVariable && !canAddToCart
              ? lang === "en"
                ? "Choose options"
                : "בחירת אפשרויות"
              : lang === "en"
                ? "Add to cart"
                : "הוספה לסל"}
          </Button>
        </Stack>
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: 78, md: 24 } }}
      >
        <Alert severity={snackError ? "error" : "success"} onClose={() => setSnackOpen(false)}>
          {snackError
            ? snackMessage ||
              (lang === "en" ? "Couldn't add to cart. Please try again." : "לא הצלחנו להוסיף לסל. נסו שוב.")
            : lang === "en"
              ? "Added to cart"
              : "נוסף לסל"}
        </Alert>
      </Snackbar>
    </>
  );
}
