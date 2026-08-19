import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Dialog, IconButton, InputBase, Link, Skeleton, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { fetchProducts } from "../lib/catalog";
import { formatIls } from "../lib/site";
import { STORE_COPY, STORE_MAX_WIDTH } from "../lib/storeUi";

function SearchResultSkeleton() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "82px 1fr auto",
        gap: 2,
        alignItems: "center",
        py: 2,
        borderBottom: "1px solid rgba(17,17,17,.12)",
      }}
      aria-hidden
    >
      <Skeleton variant="rectangular" width={82} height={96} sx={{ bgcolor: "#eee9e0" }} />
      <Skeleton width="70%" height={20} />
      <Skeleton width={54} height={18} />
    </Box>
  );
}

export function StoreSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { lang, loc } = useLocale();
  const copy = STORE_COPY[lang];
  const [value, setValue] = useState("");
  const query = useDeferredValue(value.trim());
  const results = useQuery({
    queryKey: ["store-search", query],
    queryFn: () =>
      fetchProducts(new URLSearchParams({ search: query, per_page: "6" }).toString()),
    enabled: query.length >= 2,
  });

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      transitionDuration={360}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "#f8f6f1",
            backgroundImage: "none",
          },
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: STORE_MAX_WIDTH,
          mx: "auto",
          px: { xs: 2.5, md: 5 },
          pt: { xs: 2, md: 3 },
          pb: 8,
        }}
      >
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: { xs: 6, md: 10 } }}>
          <Typography sx={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
            {copy.search}
          </Typography>
          <IconButton onClick={onClose} aria-label={lang === "en" ? "Close search" : "סגירת חיפוש"}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              borderBottom: "1px solid #111",
              pb: 1.5,
            }}
          >
            <SearchIcon sx={{ fontSize: { xs: 24, md: 30 }, me: 1.5 }} />
            <InputBase
              autoFocus
              fullWidth
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={copy.searchPlaceholder}
              inputProps={{ "aria-label": copy.search }}
              sx={{
                fontFamily: '"Secular One", Heebo, sans-serif',
                fontSize: { xs: "1.65rem", md: "2.6rem" },
                lineHeight: 1.2,
              }}
            />
          </Stack>
          {query.length < 2 && (
            <Typography sx={{ mt: 2, color: "rgba(17,17,17,.65)", fontSize: 14 }}>
              {copy.searchHint}
            </Typography>
          )}

          {query.length >= 2 && results.isFetching && (
            <Box sx={{ mt: { xs: 4, md: 6 } }}>
              {Array.from({ length: 4 }, (_, i) => (
                <SearchResultSkeleton key={i} />
              ))}
            </Box>
          )}

          {query.length >= 2 && !results.isFetching && results.data && results.data.items.length === 0 && (
            <Typography sx={{ mt: 6, fontSize: 18 }}>{copy.noResults}</Typography>
          )}

          {!results.isFetching && results.data && results.data.items.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                columnGap: 4,
                mt: { xs: 4, md: 6 },
              }}
            >
              {results.data.items.map((product) => {
                const image = product.images[0];
                return (
                  <Link
                    key={product.id}
                    component={RouterLink}
                    to={loc(`/shop/product/${product.id}`)}
                    onClick={onClose}
                    underline="none"
                    sx={{
                      color: "inherit",
                      display: "grid",
                      gridTemplateColumns: "82px 1fr auto",
                      gap: 2,
                      alignItems: "center",
                      py: 2,
                      borderBottom: "1px solid rgba(17,17,17,.12)",
                    }}
                  >
                    <Box
                      component="img"
                      src={image?.thumbnail || image?.src}
                      alt={image?.alt || product.name}
                      sx={{ width: 82, height: 96, objectFit: "cover", bgcolor: "#eee9e0" }}
                    />
                    <Typography sx={{ fontSize: 15, lineHeight: 1.35 }}>{product.name}</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {formatIls(product.prices.price, product.prices.currency_minor_unit ?? 2)}
                    </Typography>
                  </Link>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
