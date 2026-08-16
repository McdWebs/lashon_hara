import { Box, Button, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ErrorState, LoadingState } from "../components/States";
import { Section } from "../components/Section";
import { track } from "../lib/analytics";
import { fetchProduct } from "../lib/catalog";
import { formatIls, SITE } from "../lib/site";

export function ProductPage() {
  const { id } = useParams();
  const query = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id ?? ""),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (query.data) track("product_viewed", { id: query.data.id, name: query.data.name });
  }, [query.data]);

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return (
      <Section>
        <ErrorState message="המוצר לא נמצא." />
      </Section>
    );
  }

  const p = query.data;
  const img = p.images[0];
  const unit = p.prices.currency_minor_unit ?? 2;
  const cartUrl = p.add_to_cart?.url || p.permalink || `${SITE.wcOrigin}/?add-to-cart=${p.id}`;

  return (
    <Section>
      <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
        {img && (
          <Box
            component="img"
            src={img.src}
            alt={img.alt || p.name}
            sx={{ width: { xs: "100%", md: 420 }, borderRadius: 2, objectFit: "cover" }}
          />
        )}
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }}>
            {p.name}
          </Typography>
          <Typography variant="h4" color="primary" sx={{ my: 2, fontWeight: 800 }}>
            {formatIls(p.prices.price, unit)}
          </Typography>
          <Box
            sx={{ "& p": { m: 0 }, color: "text.secondary" }}
            dangerouslySetInnerHTML={{ __html: p.short_description || p.description || "" }}
          />
          <Typography variant="body2" sx={{ mt: 2 }}>
            התשלום והמשלוח ממשיכים בקופה של החנות הקיימת עד שספק הסליקה יאושר מחדש.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              href={cartUrl}
              onClick={() => track("product_added_to_cart", { id: p.id })}
            >
              הוספה לסל / רכישה
            </Button>
            <Button href={p.permalink} variant="outlined">
              לעמוד המקורי
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Section>
  );
}
