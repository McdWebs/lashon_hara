import { Box, Button, Chip, Grid, Pagination, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { Band } from "../components/Band";
import { ProductGrid } from "../components/ProductGrid";
import { EmptyState, ErrorState, ProductGridSkeleton } from "../components/States";
import { UseCaseCard } from "../components/UseCaseCard";
import { PageHeader, Section } from "../components/Section";
import { useLocale } from "../i18n/useLocale";
import { BUNDLE_PRODUCT_IDS } from "../lib/bundles";
import { fetchPopularProducts, fetchProducts, fetchProductsByIds } from "../lib/catalog";
import { SHOP_CATEGORY_CHIPS, SHOP_COPY, SHOP_USE_CASES } from "../lib/shop";
import { SCHOOLS_PRODUCT_ID } from "../lib/site";

function CatalogSection({
  page,
  category,
  params,
  setParams,
}: {
  page: number;
  category: string;
  params: URLSearchParams;
  setParams: (p: URLSearchParams) => void;
}) {
  const { lang } = useLocale();
  const catalogTopRef = useRef<HTMLDivElement>(null);
  const query = useQuery({
    queryKey: ["products", page, category],
    queryFn: () => {
      const s = new URLSearchParams({ page: String(page), per_page: "24" });
      if (category) s.set("category", category);
      return fetchProducts(s.toString());
    },
  });

  const activeUseCase = SHOP_USE_CASES.find((u) => u.kind === "category" && u.category === category);
  const title = category
    ? activeUseCase?.label[lang] ?? SHOP_COPY.allProducts[lang]
    : SHOP_COPY.allProducts[lang];

  return (
    <Box ref={catalogTopRef} sx={{ scrollMarginTop: 96 }}>
    <Section wide muted={!category}>
      <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 2, gap: 1 }}>
        <Typography variant="h2" sx={{ fontSize: { xs: "1.4rem", md: "1.75rem" } }}>
          {title}
        </Typography>
        {category && (
          <Button size="small" onClick={() => setParams(new URLSearchParams())}>
            {SHOP_COPY.clearFilter[lang]}
          </Button>
        )}
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", gap: 1, mb: 3 }}>
        {SHOP_CATEGORY_CHIPS.map((chip) => (
          <Chip
            key={chip.category}
            label={chip.label[lang]}
            clickable
            color={category === chip.category ? "primary" : "default"}
            variant={category === chip.category ? "filled" : "outlined"}
            onClick={() => setParams(new URLSearchParams({ category: chip.category, page: "1" }))}
          />
        ))}
      </Stack>

      {query.isLoading && <ProductGridSkeleton count={category ? 8 : 12} />}
      {query.isError && (
        <ErrorState message="לא ניתן לטעון את הקטלוג כרגע." onRetry={() => void query.refetch()} />
      )}
      {query.data && query.data.items.length === 0 && <EmptyState>אין מוצרים בתצוגה הזו.</EmptyState>}
      {query.data && query.data.items.length > 0 && (
        <>
          <ProductGrid products={query.data.items} />
          {query.data.totalPages > 1 && (
            <Stack sx={{ mt: 4, alignItems: "center" }}>
              <Pagination
                count={query.data.totalPages}
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
    </Section>
    </Box>
  );
}

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const { loc, lang, t } = useLocale();
  const page = Number(params.get("page") ?? "1");
  const category = params.get("category") ?? "";
  const isFiltered = Boolean(category);

  const popularQuery = useQuery({
    queryKey: ["products", "popular"],
    queryFn: () => fetchPopularProducts(8),
    enabled: !isFiltered,
  });

  const bundlesQuery = useQuery({
    queryKey: ["products", "bundles", BUNDLE_PRODUCT_IDS],
    queryFn: () => fetchProductsByIds([...BUNDLE_PRODUCT_IDS]),
    enabled: !isFiltered,
  });

  useEffect(() => {
    if (window.location.hash !== "#bundles") return;
    const scroll = () => document.getElementById("bundles")?.scrollIntoView({ behavior: "smooth" });
    scroll();
    if (bundlesQuery.isLoading) {
      const id = window.setTimeout(scroll, 400);
      return () => window.clearTimeout(id);
    }
  }, [bundlesQuery.isLoading, bundlesQuery.data]);

  return (
    <>
      {!isFiltered && (
        <PageHeader title={t("navShop")}>
          <Typography sx={{ mt: 2, maxWidth: 640 }}>
            {lang === "en"
              ? 'Welcome to the shop for "Lashon Hara Lo Medaber Elai" products. Sales help us keep distributing products free to schools.'
              : 'ברוכים הבאים לאתר המכירות של מוצרי "לשון הרע לא מדבר אלי". המכירות מאפשרות להמשיך ולחלק מוצרים בחינם לבתי ספר ומוסדות חינוך.'}
          </Typography>
        </PageHeader>
      )}

      {!isFiltered && (
        <>
          <Section wide>
            <Typography variant="h2" sx={{ fontSize: { xs: "1.4rem", md: "1.75rem" }, mb: 3 }}>
              {SHOP_COPY.whyNeed[lang]}
            </Typography>
            <Grid container spacing={2}>
              {SHOP_USE_CASES.map((uc) => (
                <Grid key={uc.kind === "category" ? uc.category : uc.kind === "link" ? uc.to : uc.anchor} size={{ xs: 12, sm: 6, md: 4 }}>
                  <UseCaseCard item={uc} />
                </Grid>
              ))}
            </Grid>
            <Stack
              direction="row"
              spacing={2}
              useFlexGap
              sx={{ flexWrap: "wrap", gap: 1.5, mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}
            >
              <Typography component={RouterLink} to={loc("/wholesale")} color="text.secondary" sx={{ fontWeight: 600, fontSize: 14 }}>
                {t("navWholesale")}
              </Typography>
              <Typography color="text.disabled">·</Typography>
              <Typography component={RouterLink} to={loc("/request-a-quote")} color="text.secondary" sx={{ fontWeight: 600, fontSize: 14 }}>
                {t("navQuote")}
              </Typography>
              <Typography color="text.disabled">·</Typography>
              <Typography component={RouterLink} to={loc("/custom")} color="text.secondary" sx={{ fontWeight: 600, fontSize: 14 }}>
                {t("navCustom")}
              </Typography>
              <Typography color="text.disabled">·</Typography>
              <Typography
                component={RouterLink}
                to={loc(`/shop/product/${SCHOOLS_PRODUCT_ID}`)}
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: 14 }}
              >
                {t("navSchoolBracelets")}
              </Typography>
            </Stack>
          </Section>

          <Band tone="dark">
            <Typography variant="h2" sx={{ fontSize: { xs: "1.35rem", md: "1.75rem" } }}>
              {SHOP_COPY.mission[lang]}
            </Typography>
          </Band>

          {(popularQuery.isLoading || (popularQuery.data && popularQuery.data.items.length > 0)) && (
            <Section wide>
              <Typography variant="h2" sx={{ fontSize: { xs: "1.4rem", md: "1.75rem" }, mb: 3 }}>
                {SHOP_COPY.bestSellers[lang]}
              </Typography>
              {popularQuery.isLoading && <ProductGridSkeleton count={4} />}
              {popularQuery.data && popularQuery.data.items.length > 0 && (
                <ProductGrid products={popularQuery.data.items} />
              )}
            </Section>
          )}

          <Box id="bundles">
            <Section wide muted>
              <Typography variant="h2" sx={{ fontSize: { xs: "1.4rem", md: "1.75rem" }, mb: 3 }}>
                {SHOP_COPY.bundles[lang]}
              </Typography>
              {bundlesQuery.isLoading && <ProductGridSkeleton count={4} />}
              {bundlesQuery.data && bundlesQuery.data.items.length > 0 && (
                <ProductGrid products={bundlesQuery.data.items} />
              )}
            </Section>
          </Box>
        </>
      )}

      <CatalogSection page={page} category={category} params={params} setParams={setParams} />
    </>
  );
}
