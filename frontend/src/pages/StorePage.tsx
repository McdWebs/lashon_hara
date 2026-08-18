import { Box, Button, Link, Pagination, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductGrid";
import { EmptyState, ErrorState, ProductGridSkeleton } from "../components/States";
import { useLocale } from "../i18n/useLocale";
import type { StringKey } from "../i18n/strings";
import { fetchPopularProducts, fetchProducts, type WcProduct } from "../lib/catalog";
import { MEDIA } from "../lib/media";
import { SHOP_CATEGORY_CHIPS, SHOP_COPY, SHOP_USE_CASES, STORE_NAV_CATEGORIES } from "../lib/shop";
import { formatIls } from "../lib/site";

const LOOKBOOK_IMAGES = [
  MEDIA.hoodie,
  MEDIA.bracelets,
  encodeURI("https://lashonhara.co.il/wp-content/uploads/2025/11/תיק-לבן-גדול.jpg"),
] as const;

function categoryTitle(category: string, lang: "he" | "en", t: (key: StringKey) => string) {
  const nav = STORE_NAV_CATEGORIES.find((item) => item.category === category);
  if (nav) return t(nav.labelKey);
  const chip = SHOP_CATEGORY_CHIPS.find((item) => item.category === category);
  if (chip) return chip.label[lang];
  const useCase = SHOP_USE_CASES.find((item) => item.kind === "category" && item.category === category);
  if (useCase) return useCase.label[lang];
  return t("navShop");
}

function StoreHero({ featured }: { featured?: WcProduct }) {
  const { loc, t } = useLocale();
  const unit = featured?.prices.currency_minor_unit ?? 2;
  const to = featured ? loc(`/shop/product/${featured.id}`) : loc("/shop");

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: "100vh", md: "100vh" },
        bgcolor: "#111",
        color: "#fff",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <Box
        component="video"
        src={MEDIA.heroVideo}
        poster={MEDIA.hoodie}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          "@media (prefers-reduced-motion: reduce)": { display: "none" },
        }}
      />
      <Box
        component="img"
        src={MEDIA.hoodie}
        alt=""
        sx={{
          display: "none",
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          "@media (prefers-reduced-motion: reduce)": { display: "block" },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(17,17,17,0.28)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "relative",
          px: { xs: 3, md: 8 },
          py: { xs: 6, md: 10 },
          maxWidth: 640,
        }}
      >
        {!featured && (
          <Typography component="h1" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            {t("navShop")}
          </Typography>
        )}
        {featured ? (
          <>
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Secular One", Heebo, sans-serif',
                fontWeight: 400,
                fontSize: { xs: "2rem", md: "3rem" },
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                textShadow: "0 2px 28px rgba(0,0,0,0.45)",
              }}
            >
              {featured.name}
            </Typography>
            <Typography
              sx={{
                mt: 1.5,
                fontWeight: 500,
                fontSize: { xs: "1.1rem", md: "1.25rem" },
                opacity: 0.92,
              }}
            >
              {formatIls(featured.prices.price, unit)}
            </Typography>
          </>
        ) : null}
        <Button
          size="large"
          variant="contained"
          component={RouterLink}
          to={to}
          sx={{ mt: 3, minWidth: 160 }}
        >
          {t("shopNow")}
        </Button>
      </Box>
    </Box>
  );
}

function Lookbook({ products }: { products: WcProduct[] }) {
  const { loc } = useLocale();
  const items = products.slice(0, 3);

  if (items.length === 0) return null;

  return (
    <Box>
      {items.map((product, i) => {
        const img = LOOKBOOK_IMAGES[i] || product.images[0]?.src;
        const unit = product.prices.currency_minor_unit ?? 2;
        const reverse = i % 2 === 1;
        return (
          <Box
            key={product.id}
            component={RouterLink}
            to={loc(`/shop/product/${product.id}`)}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
              gridTemplateAreas: {
                xs: '"image" "copy"',
                md: reverse ? '"copy image"' : '"image copy"',
              },
              minHeight: { md: "78vh" },
              textDecoration: "none",
              color: "inherit",
              bgcolor: i % 2 === 0 ? "background.paper" : "background.default",
              "&:hover .lookbook-img": { transform: "scale(1.03)" },
            }}
          >
            <Box
              sx={{
                gridArea: "image",
                overflow: "hidden",
                minHeight: { xs: 340, md: "78vh" },
              }}
            >
              <Box
                className="lookbook-img"
                component="img"
                src={img}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.6s ease",
                }}
              />
            </Box>
            <Box
              sx={{
                gridArea: "copy",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                px: { xs: 3, md: 8 },
                py: { xs: 5, md: 8 },
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Secular One", Heebo, sans-serif',
                  fontSize: { xs: "1.6rem", md: "2.2rem" },
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                {product.name}
              </Typography>
              <Typography sx={{ mt: 1.5, fontWeight: 500, fontSize: "1.1rem" }}>
                {formatIls(product.prices.price, unit)}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export function StorePage() {
  const [params, setParams] = useSearchParams();
  const { loc, lang, t } = useLocale();
  const page = Number(params.get("page") ?? "1");
  const category = params.get("category") ?? "";
  const isFiltered = Boolean(category);
  const catalogTopRef = useRef<HTMLDivElement>(null);

  const popularQuery = useQuery({
    queryKey: ["products", "popular", "store"],
    queryFn: () => fetchPopularProducts(8),
    enabled: !isFiltered,
  });

  const catalogQuery = useQuery({
    queryKey: ["products", page, category],
    queryFn: () => {
      const s = new URLSearchParams({ page: String(page), per_page: "24" });
      if (category) s.set("category", category);
      return fetchProducts(s.toString());
    },
  });

  const featured = popularQuery.data?.items[0];
  const lookbookProducts = popularQuery.data?.items.slice(0, 3) ?? [];
  const title = isFiltered ? categoryTitle(category, lang, t) : null;

  return (
    <>
      {!isFiltered && <StoreHero featured={featured} />}
      {!isFiltered && <Lookbook products={lookbookProducts} />}

      <Box
        ref={catalogTopRef}
        sx={{
          scrollMarginTop: 96,
          px: { xs: 2, md: 6 },
          py: { xs: 6, md: 10 },
          bgcolor: "background.default",
        }}
      >
        {isFiltered && (
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "baseline",
              mb: { xs: 3, md: 5 },
              gap: 2,
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Secular One", Heebo, sans-serif',
                fontSize: { xs: "1.6rem", md: "2rem" },
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </Typography>
            <Link
              component={RouterLink}
              to={loc("/")}
              underline="none"
              sx={{ fontWeight: 600, fontSize: 14, color: "text.secondary" }}
            >
              {SHOP_COPY.clearFilter[lang]}
            </Link>
          </Stack>
        )}

        {catalogQuery.isLoading && <ProductGridSkeleton count={isFiltered ? 8 : 12} />}
        {catalogQuery.isError && (
          <ErrorState message="לא ניתן לטעון את הקטלוג כרגע." onRetry={() => void catalogQuery.refetch()} />
        )}
        {catalogQuery.data && catalogQuery.data.items.length === 0 && (
          <EmptyState>אין מוצרים בתצוגה הזו.</EmptyState>
        )}
        {catalogQuery.data && catalogQuery.data.items.length > 0 && (
          <>
            <ProductGrid products={catalogQuery.data.items} />
            {catalogQuery.data.totalPages > 1 && (
              <Stack sx={{ mt: 6, alignItems: "center" }}>
                <Pagination
                  count={catalogQuery.data.totalPages}
                  page={page}
                  onChange={(_e, value) => {
                    const next = new URLSearchParams(params);
                    next.set("page", String(value));
                    setParams(next);
                    catalogTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  color="primary"
                />
              </Stack>
            )}
          </>
        )}
      </Box>
    </>
  );
}
