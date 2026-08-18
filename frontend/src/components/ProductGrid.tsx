import { Grid } from "@mui/material";
import type { WcProduct } from "../lib/catalog";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: WcProduct[] }) {
  return (
    <Grid container spacing={{ xs: 2, md: 3.5 }}>
      {products.map((p) => (
        <Grid key={p.id} size={{ xs: 6, sm: 6, md: 4 }} sx={{ display: "flex" }}>
          <ProductCard product={p} />
        </Grid>
      ))}
    </Grid>
  );
}
