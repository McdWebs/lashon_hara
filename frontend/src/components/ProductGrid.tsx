import { Grid } from "@mui/material";
import type { WcProduct } from "../lib/catalog";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  columns = 3,
}: {
  products: WcProduct[];
  columns?: 3 | 4;
}) {
  return (
    <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
      {products.map((p) => (
        <Grid
          key={p.id}
          size={{ xs: 6, sm: 6, md: columns === 4 ? 3 : 4 }}
          sx={{ display: "flex" }}
        >
          <ProductCard product={p} />
        </Grid>
      ))}
    </Grid>
  );
}
