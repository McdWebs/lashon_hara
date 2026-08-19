import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import {
  Box,
  Button,
  Chip,
  FormControl,
  Link,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { ProductGrid } from "../components/ProductGrid";
import { StoreCategoryTileCard } from "../components/StoreCategoryTile";
import {
  EmptyState,
  ErrorState,
  ProductGridSkeleton,
} from "../components/States";
import { useLocale } from "../i18n/useLocale";
import {
  fetchCategories,
  fetchProductsByIds,
  fetchProducts,
} from "../lib/catalog";
import {
  SHOP_CATEGORY_CHIPS,
  SHOP_USE_CASES,
  sortCategoriesForChips,
  STORE_NAV_CATEGORIES,
} from "../lib/shop";
import {
  STORE_CATEGORY_TILES,
  STORE_COPY,
  STORE_EDITORIAL_IMAGES,
  STORE_FEATURED_IMAGE,
  STORE_HERO_IMAGE,
  STORE_HOMEPAGE_PRODUCT_IMAGES,
  STORE_HOMEPAGE_PRODUCT_IDS,
  STORE_MAX_WIDTH,
} from "../lib/storeUi";

const sectionLabelSx = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.15em",
  lineHeight: 1.3,
  textTransform: "uppercase",
  mb: 1.25,
} as const;

const displayHeadingSx = {
  fontFamily: '"Secular One", Heebo, sans-serif',
  fontWeight: 400,
  lineHeight: 1.04,
  letterSpacing: "-0.025em",
} as const;

function categoryTitle(category: string, lang: "he" | "en") {
  const nav = STORE_NAV_CATEGORIES.find((item) => item.category === category);
  if (nav) {
    const labels = {
      navApparel: { he: "לבוש", en: "Apparel" },
      navBracelets: { he: "צמידים", en: "Bracelets" },
      navAccessories: { he: "אביזרים", en: "Accessories" },
    };
    return labels[nav.labelKey][lang];
  }
  const chip = SHOP_CATEGORY_CHIPS.find((item) => item.category === category);
  if (chip) return chip.label[lang];
  const useCase = SHOP_USE_CASES.find(
    (item) => item.kind === "category" && item.category === category,
  );
  return useCase?.label[lang] ?? (lang === "en" ? "Collection" : "קולקציה");
}

function StoreHero() {
  const { lang, loc } = useLocale();
  const copy = STORE_COPY[lang];

  return (
    <Box
      component="section"
      sx={{
        minHeight: { xs: "92svh", md: "100svh" },
        bgcolor: "#161616",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <Box
        component="img"
        src={STORE_HERO_IMAGE}
        alt={
          lang === "en"
            ? "Three engraved metal bracelets"
            : "שלושה צמידי מתכת עם המסר"
        }
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: { xs: "center", md: "center 48%" },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(8,8,8,.08) 25%, rgba(8,8,8,.72) 100%)",
        }}
      />
      <Box
        sx={{
          width: "100%",
          maxWidth: STORE_MAX_WIDTH,
          mx: "auto",
          px: { xs: 2.5, sm: 4, md: 6 },
          pb: { xs: 6, md: 8 },
          pt: 18,
          position: "relative",
        }}
      >
        <Box sx={{ maxWidth: { xs: 520, md: 650 } }}>
          <Typography
            component="h1"
            sx={{
              ...displayHeadingSx,
              fontSize: {
                xs: "clamp(3.1rem, 15vw, 5rem)",
                md: "clamp(5rem, 8vw, 7.5rem)",
              },
              textWrap: "balance",
            }}
          >
            {copy.heroTitle}
          </Typography>
          <Button
            component={RouterLink}
            to={loc("/shop?category=146")}
            variant="contained"
            sx={{
              mt: 3.5,
              bgcolor: "#fff",
              color: "#111",
              px: 3.5,
              minHeight: 48,
              "&:hover": { bgcolor: "#f1eee7" },
            }}
          >
            {copy.heroCta}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function CategorySection() {
  const { lang, loc } = useLocale();
  const copy = STORE_COPY[lang];

  return (
    <Box
      component="section"
      sx={{ py: { xs: 5, md: 8 }, bgcolor: "#fffdf8", overflow: "hidden" }}
    >
      <Box
        sx={{ maxWidth: STORE_MAX_WIDTH, mx: "auto", px: { xs: 2, md: 3.5 } }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: { sm: "flex-end" },
            mb: { xs: 2.5, md: 3.5 },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              component="h2"
              sx={{ ...displayHeadingSx, fontSize: { xs: 30, md: 42 } }}
            >
              {copy.categoriesTitle}
            </Typography>
          </Box>
          <Link
            component={RouterLink}
            to={loc("/shop?view=catalog")}
            underline="always"
            sx={{ color: "inherit", fontSize: 13, textUnderlineOffset: 6 }}
          >
            {copy.allCategories}
          </Link>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: { xs: 1.25, md: 1.5 },
            height: { xs: "auto", md: 280 },
          }}
        >
          {STORE_CATEGORY_TILES.map((tile) => (
            <Box
              key={tile.category}
              sx={{
                minHeight: { xs: tile.variant === "band" ? 210 : 190, md: 0 },
                height: { md: "100%" },
              }}
            >
              <StoreCategoryTileCard tile={tile} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function FeaturedEdit({
  loading,
  products,
}: {
  loading: boolean;
  products: Map<
    number,
    Awaited<ReturnType<typeof fetchProductsByIds>>["items"][number]
  >;
}) {
  const { lang, loc } = useLocale();
  const copy = STORE_COPY[lang];
  const entries = STORE_HOMEPAGE_PRODUCT_IMAGES.slice(0, 4);

  return (
    <Box component="section" sx={{ bgcolor: "#e9e2d8", py: { xs: 7, md: 12 } }}>
      <Box
        sx={{
          maxWidth: STORE_MAX_WIDTH,
          mx: "auto",
          px: { xs: 2, md: 3.5 },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1.05fr) minmax(0, .95fr)",
          },
          gap: { xs: 5, md: 8 },
          alignItems: "start",
        }}
      >
        <Box sx={{ position: { md: "sticky" }, top: { md: 126 } }}>
          <Box
            component="img"
            src={STORE_FEATURED_IMAGE}
            loading="lazy"
            alt={
              lang === "en"
                ? "Fabric and metal bracelets from the collection"
                : "צמידי בד ומתכת מהקולקציה"
            }
            sx={{
              display: "block",
              width: "100%",
              aspectRatio: { xs: "4 / 4.5", md: "4 / 5" },
              objectFit: "cover",
            }}
          />
        </Box>
        <Box>
          <Box sx={{ maxWidth: 530, mb: { xs: 4, md: 6 } }}>
            <Typography sx={sectionLabelSx}>{copy.featuredEyebrow}</Typography>
            <Typography
              component="h2"
              sx={{ ...displayHeadingSx, fontSize: { xs: 40, md: 60 } }}
            >
              {copy.featuredTitle}
            </Typography>
            <Typography
              sx={{
                mt: 2,
                fontSize: { xs: 15, md: 17 },
                lineHeight: 1.7,
                color: "rgba(17,17,17,.7)",
              }}
            >
              {copy.featuredBody}
            </Typography>
          </Box>
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: { xs: 1.5, md: 3 },
              }}
            >
              {entries.map((entry) => {
                const product = products.get(entry.productId);
                if (!product) return null;
                return (
                  <ProductCard
                    key={entry.productId}
                    product={product}
                    imageOverride={{
                      src: entry.src,
                      hoverSrc:
                        entry.productId === 42537 ? entry.hoverSrc : undefined,
                      alt: entry.alt[lang],
                    }}
                  />
                );
              })}
            </Box>
          )}
          <Button
            component={RouterLink}
            to={loc("/shop?view=catalog")}
            endIcon={<ArrowOutwardIcon />}
            sx={{
              mt: 3,
              px: 0,
              color: "inherit",
              borderBottom: "1px solid",
              borderRadius: 0,
              minHeight: 38,
            }}
          >
            {copy.shopEdit}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function PopularSection({
  loading,
  products,
}: {
  loading: boolean;
  products: Map<
    number,
    Awaited<ReturnType<typeof fetchProductsByIds>>["items"][number]
  >;
}) {
  const { lang, loc } = useLocale();
  const copy = STORE_COPY[lang];
  const entries = STORE_HOMEPAGE_PRODUCT_IMAGES.slice(4, 8);

  return (
    <Box component="section" sx={{ bgcolor: "#fffdf8", py: { xs: 7, md: 12 } }}>
      <Box
        sx={{ maxWidth: STORE_MAX_WIDTH, mx: "auto", px: { xs: 2, md: 3.5 } }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: { sm: "flex-end" },
            gap: 2,
            mb: { xs: 3.5, md: 5 },
          }}
        >
          <Box>
            <Typography sx={sectionLabelSx}>{copy.popularEyebrow}</Typography>
            <Typography
              component="h2"
              sx={{ ...displayHeadingSx, fontSize: { xs: 38, md: 56 } }}
            >
              {copy.popularTitle}
            </Typography>
          </Box>
          <Link
            component={RouterLink}
            to={loc("/shop?view=catalog")}
            underline="always"
            sx={{ color: "inherit", fontSize: 13, textUnderlineOffset: 6 }}
          >
            {copy.viewAll}
          </Link>
        </Stack>
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: { xs: 1.5, sm: 2, md: 3 },
            }}
          >
            {entries.map((entry) => {
              const product = products.get(entry.productId);
              if (!product) return null;
              return (
                <ProductCard
                  key={entry.productId}
                  product={product}
                  imageOverride={{
                    src: entry.src,
                    hoverSrc:
                      entry.productId === 6065 || entry.productId === 6080
                        ? entry.hoverSrc
                        : undefined,
                    alt: entry.alt[lang],
                  }}
                />
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function StorySection() {
  const { lang, loc } = useLocale();
  const copy = STORE_COPY[lang];
  return (
    <Box component="section" sx={{ bgcolor: "#123e3e", color: "#fff" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.05fr .95fr" },
          minHeight: { md: 700 },
        }}
      >
        <Box
          component="img"
          src={STORE_EDITORIAL_IMAGES[1].src}
          loading="lazy"
          alt={STORE_EDITORIAL_IMAGES[1].alt[lang]}
          sx={{
            width: "100%",
            height: "100%",
            minHeight: { xs: 450, md: 700 },
            objectFit: "cover",
            display: "block",
          }}
        />
        <Stack
          sx={{
            px: { xs: 3, md: 9 },
            py: { xs: 7, md: 10 },
            justifyContent: "center",
            maxWidth: 700,
          }}
        >
          <Typography
            sx={{ ...sectionLabelSx, color: "rgba(255,255,255,.72)" }}
          >
            {copy.storyEyebrow}
          </Typography>
          <Typography
            component="h2"
            sx={{
              ...displayHeadingSx,
              fontSize: { xs: 48, md: 78 },
              whiteSpace: "pre-line",
            }}
          >
            {copy.storyTitle}
          </Typography>
          <Typography
            sx={{
              mt: 2.5,
              maxWidth: 500,
              fontSize: { xs: 16, md: 18 },
              lineHeight: 1.75,
              color: "rgba(255,255,255,.78)",
            }}
          >
            {copy.storyBody}
          </Typography>
          <Button
            component={RouterLink}
            to={loc("/movement")}
            sx={{
              alignSelf: "flex-start",
              mt: 3.5,
              px: 0,
              color: "#fff",
              borderBottom: "1px solid rgba(255,255,255,.7)",
              borderRadius: 0,
            }}
          >
            {copy.storyCta}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

type SortKey = "popularity" | "price-asc" | "price-desc" | "newest";

const SORT_PARAMS: Record<SortKey, { orderby: string; order: "asc" | "desc" }> =
  {
    popularity: { orderby: "popularity", order: "desc" },
    "price-asc": { orderby: "price", order: "asc" },
    "price-desc": { orderby: "price", order: "desc" },
    newest: { orderby: "date", order: "desc" },
  };

function isSortKey(value: string | null): value is SortKey {
  return (
    value === "popularity" ||
    value === "price-asc" ||
    value === "price-desc" ||
    value === "newest"
  );
}

function categoryHref(params: URLSearchParams, categoryId: string | null) {
  const next = new URLSearchParams(params);
  next.delete("page");
  if (categoryId) {
    next.set("category", categoryId);
    next.delete("view");
  } else {
    next.delete("category");
    next.set("view", "catalog");
  }
  return `/shop?${next.toString()}`;
}

function CollectionPage({ category }: { category: string }) {
  const [params, setParams] = useSearchParams();
  const { lang, loc } = useLocale();
  const copy = STORE_COPY[lang];
  const page = Number(params.get("page") ?? "1");
  const sort: SortKey = isSortKey(params.get("sort"))
    ? (params.get("sort") as SortKey)
    : "popularity";
  const topRef = useRef<HTMLDivElement>(null);
  const query = useQuery({
    queryKey: ["products", "collection", page, category, sort],
    queryFn: () => {
      const search = new URLSearchParams({
        page: String(page),
        per_page: "24",
        ...SORT_PARAMS[sort],
      });
      if (category) search.set("category", category);
      return fetchProducts(search.toString());
    },
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories", "collection"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });
  const sortedCategories = sortCategoriesForChips(categoriesQuery.data ?? []);
  const title = category ? categoryTitle(category, lang) : copy.catalogTitle;

  function handleSortChange(value: string) {
    const next = new URLSearchParams(params);
    next.set("sort", value);
    next.delete("page");
    if (!category) next.set("view", "catalog");
    setParams(next);
  }

  return (
    <>
      <Box
        ref={topRef}
        sx={{
          bgcolor: "#f8f6f1",
          pt: { xs: 6, md: 10 },
          pb: { xs: 7, md: 12 },
        }}
      >
        <Box
          sx={{ maxWidth: STORE_MAX_WIDTH, mx: "auto", px: { xs: 2, md: 3.5 } }}
        >
          <Box sx={{ mb: { xs: 3, md: 4 } }}>
            <Typography
              component="h1"
              sx={{ ...displayHeadingSx, fontSize: { xs: 48, md: 76 } }}
            >
              {title}
            </Typography>
          </Box>

          <Stack
            direction="row"
            sx={{
              gap: 1,
              overflowX: "auto",
              pb: 1.5,
              mb: { xs: 2.5, md: 3.5 },
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}
          >
            <Chip
              label={copy.allCategoriesChip}
              clickable
              component={RouterLink}
              to={loc(categoryHref(params, null))}
              variant={!category ? "filled" : "outlined"}
              color={!category ? "secondary" : undefined}
              sx={{ flexShrink: 0 }}
            />
            {categoriesQuery.isLoading
              ? Array.from({ length: 8 }, (_, i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    width={64 + (i % 3) * 20}
                    height={32}
                    sx={{ flexShrink: 0, borderRadius: 999 }}
                  />
                ))
              : sortedCategories.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.name}
                    clickable
                    component={RouterLink}
                    to={loc(categoryHref(params, String(cat.id)))}
                    variant={category === String(cat.id) ? "filled" : "outlined"}
                    color={category === String(cat.id) ? "secondary" : undefined}
                    sx={{ flexShrink: 0 }}
                  />
                ))}
          </Stack>

          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
              mb: { xs: 3, md: 4 },
            }}
          >
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              {query.data
                ? `${query.data.total} ${lang === "en" ? "products" : "מוצרים"}`
                : <Skeleton width={70} sx={{ display: "inline-block", fontSize: 13 }} animation="wave" />}
            </Typography>
            <FormControl size="small" sx={{ minWidth: 190 }}>
              <Select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                aria-label={copy.sortLabel}
              >
                <MenuItem value="popularity">{copy.sortPopularity}</MenuItem>
                <MenuItem value="price-asc">{copy.sortPriceAsc}</MenuItem>
                <MenuItem value="price-desc">{copy.sortPriceDesc}</MenuItem>
                <MenuItem value="newest">{copy.sortNewest}</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {query.isLoading && <ProductGridSkeleton count={12} columns={4} />}
          {query.isError && (
            <ErrorState
              message={
                lang === "en"
                  ? "The collection could not be loaded."
                  : "לא ניתן לטעון את הקולקציה."
              }
              onRetry={() => void query.refetch()}
            />
          )}
          {query.data?.items.length === 0 && (
            <EmptyState>{copy.noResults}</EmptyState>
          )}
          {query.data && query.data.items.length > 0 && (
            <>
              <ProductGrid products={query.data.items} columns={4} />
              {query.data.totalPages > 1 && (
                <Stack sx={{ mt: 7, alignItems: "center" }}>
                  <Pagination
                    count={query.data.totalPages}
                    page={page}
                    onChange={(_event, value) => {
                      const next = new URLSearchParams(params);
                      next.set("page", String(value));
                      if (!category) next.set("view", "catalog");
                      setParams(next);
                      topRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                  />
                </Stack>
              )}
            </>
          )}
        </Box>
      </Box>
    </>
  );
}

export function StorePageEditorial() {
  const [params] = useSearchParams();
  const category = params.get("category");
  const view = params.get("view");
  const showCatalog = Boolean(category) || view === "catalog";
  const homepageProducts = useQuery({
    queryKey: [
      "products",
      "homepage",
      "editorial-store",
      STORE_HOMEPAGE_PRODUCT_IDS,
    ],
    queryFn: async () => {
      const page = await fetchProductsByIds([...STORE_HOMEPAGE_PRODUCT_IDS]);
      return new Map(page.items.map((product) => [product.id, product]));
    },
    enabled: !showCatalog,
  });

  if (showCatalog) return <CollectionPage category={category ?? ""} />;

  return (
    <>
      <StoreHero />
      <CategorySection />
      <FeaturedEdit
        loading={homepageProducts.isLoading}
        products={homepageProducts.data ?? new Map()}
      />
      <PopularSection
        loading={homepageProducts.isLoading}
        products={homepageProducts.data ?? new Map()}
      />
      <StorySection />
    </>
  );
}
