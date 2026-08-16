import { Button, Card, CardActionArea, CardContent, Grid, Pagination, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { PageHeader, Section } from "../components/Section";
import { BUNDLE_PRODUCT_IDS } from "../lib/bundles";
import { fetchProducts } from "../lib/catalog";
import { SITE } from "../lib/site";

const useCases = [
  { label: "לבית הספר", category: "26" },
  { label: "למשרד", category: "24" },
  { label: "צמידי סיליקון", category: "20" },
  { label: "חולצות ופריטי לבוש", category: "146" },
  { label: "מוצרים מיוחדים", category: "23" },
  { label: "מדבקות וסטיקרים", category: "18" },
];

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") ?? "1");
  const category = params.get("category") ?? "";

  const query = useQuery({
    queryKey: ["products", page, category],
    queryFn: () => {
      const s = new URLSearchParams({ page: String(page), per_page: "24" });
      if (category) s.set("category", category);
      return fetchProducts(s.toString());
    },
  });

  const bundles = useQuery({
    queryKey: ["bundles"],
    queryFn: () => fetchProducts(`include=${BUNDLE_PRODUCT_IDS.join(",")}&per_page=20`),
  });

  return (
    <>
      <PageHeader title="חנות">
        <Typography sx={{ mt: 2, maxWidth: 640 }}>
          ברוכים הבאים לאתר המכירות של מוצרי &quot;לשון הרע לא מדבר אלי&quot;. המכירות מאפשרות להמשיך ולחלק מוצרים בחינם לבתי ספר ומוסדות חינוך.
        </Typography>
      </PageHeader>
      <Section>
        <Typography variant="h3" gutterBottom>
          למה אתם צריכים את זה?
        </Typography>
        <Grid container spacing={1} sx={{ mb: 3 }}>
          {useCases.map((uc) => (
            <Grid key={uc.category}>
              <Button
                variant={category === uc.category ? "contained" : "outlined"}
                onClick={() => setParams({ category: uc.category, page: "1" })}
              >
                {uc.label}
              </Button>
            </Grid>
          ))}
          {category && (
            <Grid>
              <Button onClick={() => setParams({})}>הכול</Button>
            </Grid>
          )}
        </Grid>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
          <Button component={RouterLink} to="/organizations" variant="outlined">
            הזמנה לקבוצה / סיטונאות
          </Button>
          <Button href={`${SITE.wcOrigin}/cart/`} variant="outlined">
            לסל הקיים
          </Button>
        </Stack>

        {bundles.data && bundles.data.items.length > 0 && (
          <>
            <Typography variant="h3" sx={{ mb: 2 }}>
              סטים מהקטלוג הקיים
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              אלה מוצרים שכבר נמכרים כסט ב-WooCommerce. לא הורכבו חבילות חדשות עם מחירים מומצאים.
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {bundles.data.items.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {query.isLoading && <LoadingState />}
        {query.isError && <ErrorState message="לא ניתן לטעון את הקטלוג כרגע." onRetry={() => void query.refetch()} />}
        {query.data && query.data.items.length === 0 && <EmptyState>אין מוצרים בתצוגה הזו.</EmptyState>}
        {query.data && query.data.items.length > 0 && (
          <>
            <Grid container spacing={2}>
              {query.data.items.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
            <Stack sx={{ mt: 4, alignItems: "center" }}>
              <Pagination
                count={query.data.totalPages}
                page={page}
                onChange={(_e, value) => {
                  const next = new URLSearchParams(params);
                  next.set("page", String(value));
                  setParams(next);
                }}
                color="primary"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {query.data.total} מוצרים בקטלוג WooCommerce
              </Typography>
            </Stack>
          </>
        )}

        <Card variant="outlined" sx={{ mt: 4 }}>
          <CardActionArea href={`${SITE.wcOrigin}/shop/`}>
            <CardContent>
              <Typography sx={{ fontWeight: 700 }}>מעבר לחנות המלאה באתר הקיים</Typography>
              <Typography color="text.secondary">כולל קופה, חשבון ומשלוחים כפי שהם עובדים היום.</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Section>
    </>
  );
}
