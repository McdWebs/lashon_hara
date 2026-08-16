import { Box, Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { formatIls } from "../lib/site";
import type { WcProduct } from "../lib/catalog";

export function ProductCard({ product }: { product: WcProduct }) {
  const img = product.images[0];
  const unit = product.prices.currency_minor_unit ?? 2;
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        image={img?.src || img?.thumbnail}
        alt={img?.alt || product.name}
        sx={{ aspectRatio: "1 / 1", objectFit: "cover", bgcolor: "#eee" }}
      />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700 }}>
          {product.name}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography color="primary" sx={{ fontWeight: 800 }}>
            {formatIls(product.prices.price, unit)}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button component={RouterLink} to={`/shop/product/${product.id}`} size="small">
          למוצר
        </Button>
      </CardActions>
    </Card>
  );
}
