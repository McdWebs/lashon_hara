import {
  Alert,
  Box,
  Button,
  Grid,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductGrid";
import { QuantityStepper } from "../components/QuantityStepper";
import { SchoolsOrderForm } from "../components/SchoolsOrderForm";
import { ShippingStrip } from "../components/ShippingStrip";
import { ErrorState, ProductGridSkeleton, ProductPageSkeleton } from "../components/States";
import { PageHeader, Section } from "../components/Section";
import { SchoolOrderProcessContent } from "../content/schoolOrderProcessHe";
import { track } from "../lib/analytics";
import { useCart } from "../lib/cart";
import { fetchProduct, fetchRelatedProducts } from "../lib/catalog";
import { useLocale } from "../i18n/useLocale";
import { formatIls, SCHOOLS_PRODUCT_ID } from "../lib/site";

export function ProductPage() {
  const { id } = useParams();
  const { loc, lang } = useLocale();
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [snackOpen, setSnackOpen] = useState(false);

  const query = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id ?? ""),
    enabled: Boolean(id),
  });

  const categoryId = query.data?.categories[0]?.id;
  const relatedQuery = useQuery({
    queryKey: ["related", id, categoryId],
    queryFn: () => fetchRelatedProducts(categoryId!, Number(id), 4),
    enabled: Boolean(query.data && categoryId && query.data.id !== SCHOOLS_PRODUCT_ID),
  });

  useEffect(() => {
    if (query.data)
      track("product_viewed", { id: query.data.id, name: query.data.name });
  }, [query.data]);

  useEffect(() => {
    setImageIndex(0);
    setQuantity(1);
  }, [id]);

  if (query.isLoading) return <ProductPageSkeleton />;
  if (query.isError || !query.data) {
    return (
      <Section>
        <ErrorState message="המוצר לא נמצא." />
      </Section>
    );
  }

  const p = query.data;
  const isSchoolsProduct = p.id === SCHOOLS_PRODUCT_ID;
  const images = p.images.length > 0 ? p.images : [];
  const img = images[imageIndex] ?? images[0];
  const unit = p.prices.currency_minor_unit ?? 2;

  async function handleAddToCart() {
    try {
      await addItem(p.id, quantity);
      track("product_added_to_cart", { id: p.id, quantity });
      setSnackOpen(true);
    } catch {
      /* the snackbar simply won't show; button remains usable to retry */
    }
  }

  const purchaseBlock = isSchoolsProduct ? null : (
    <Stack spacing={2.5}>
      <Typography variant="h1" sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }}>
        {p.name}
      </Typography>
      <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>
        {formatIls(p.prices.price, unit)}
      </Typography>
      <Box
        sx={{
          "& p": { m: 0, mb: 1 },
          color: "text.secondary",
          lineHeight: 1.7,
        }}
        dangerouslySetInnerHTML={{
          __html: p.short_description || p.description || "",
        }}
      />
      <ShippingStrip />
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", flexWrap: "wrap" }}
      >
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <Button
          variant="contained"
          size="large"
          onClick={handleAddToCart}
          sx={{ flex: { xs: 1, sm: "none" }, minWidth: 160 }}
        >
          {lang === "en" ? "Add to cart" : "הוספה לסל"}
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <>
      {isSchoolsProduct ? (
        <>
          <PageHeader title={p.name} singleLine>
            <Typography>
              כדי לעזור לכם לקבל את הצמידים הכנו הסבר על התהליך המלא — וטופס בקשה
              במקום אחד.
            </Typography>
          </PageHeader>
          <Section wide>
            <Grid container spacing={{ xs: 3, md: 4 }} sx={{ alignItems: "flex-start" }}>
              <Grid size={{ xs: 12, md: 5 }}>
                {img && (
                  <Box
                    component="img"
                    src={img.src}
                    alt={img.alt || p.name}
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      borderRadius: 2,
                      objectFit: "cover",
                      aspectRatio: "4 / 3",
                      bgcolor: "#eee",
                      mb: 2.5,
                    }}
                  />
                )}
                <SchoolOrderProcessContent />
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Box
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <SchoolsOrderForm />
                </Box>
              </Grid>
            </Grid>
          </Section>
        </>
      ) : (
        <Section wide>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            sx={{ pb: { xs: 10, md: 0 } }}
          >
            <Box sx={{ flex: { md: "0 0 420px" } }}>
              {img && (
                <Box
                  component="img"
                  src={img.src}
                  alt={img.alt || p.name}
                  sx={{
                    width: "100%",
                    borderRadius: 2,
                    objectFit: "cover",
                    aspectRatio: "1 / 1",
                    bgcolor: "#eee",
                  }}
                />
              )}
              {images.length > 1 && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}
                >
                  {images.map((thumb, i) => (
                    <Box
                      key={thumb.src}
                      component="button"
                      type="button"
                      onClick={() => setImageIndex(i)}
                      sx={{
                        p: 0,
                        border: "2px solid",
                        borderColor:
                          i === imageIndex ? "primary.main" : "divider",
                        borderRadius: 1,
                        overflow: "hidden",
                        cursor: "pointer",
                        bgcolor: "transparent",
                        width: 72,
                        height: 72,
                      }}
                    >
                      <Box
                        component="img"
                        src={thumb.thumbnail || thumb.src}
                        alt=""
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>{purchaseBlock}</Box>
          </Stack>
        </Section>
      )}

      {!isSchoolsProduct &&
        (relatedQuery.isLoading ||
          (relatedQuery.data && relatedQuery.data.items.length > 0)) && (
        <Section wide muted>
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: "1.4rem", md: "1.75rem" }, mb: 3 }}
          >
            {lang === "en" ? "You may also like" : "אהבתם את זה?"}
          </Typography>
          {relatedQuery.isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            relatedQuery.data && <ProductGrid products={relatedQuery.data.items} />
          )}
        </Section>
      )}

      {!isSchoolsProduct && (
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            position: "fixed",
            bottom: 0,
            insetInline: 0,
            zIndex: 1100,
            px: 2,
            py: 1.5,
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
            boxShadow: "0 -4px 20px rgba(17,17,17,0.08)",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Typography
              sx={{ fontWeight: 800, color: "primary.main", minWidth: 72 }}
            >
              {formatIls(p.prices.price, unit)}
            </Typography>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              size="small"
            />
            <Button variant="contained" fullWidth onClick={handleAddToCart}>
              {lang === "en" ? "Add to cart" : "הוספה לסל"}
            </Button>
          </Stack>
        </Box>
      )}

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: 88, md: 24 } }}
      >
        <Alert
          severity="success"
          sx={{ width: "100%", alignItems: "center" }}
          action={
            <Button
              color="inherit"
              size="small"
              component={RouterLink}
              to={loc("/cart")}
              onClick={() => setSnackOpen(false)}
            >
              {lang === "en" ? "View cart" : "לסל"}
            </Button>
          }
        >
          {lang === "en" ? "Added to cart" : "נוסף לסל"}
        </Alert>
      </Snackbar>
    </>
  );
}
