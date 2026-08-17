import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";

type Step = "shop" | "cart" | "checkout";

const labels = {
  he: { shop: "חנות", cart: "סל", checkout: "קופה" },
  en: { shop: "Shop", cart: "Cart", checkout: "Checkout" },
} as const;

export function CommerceSteps({ current }: { current: Step }) {
  const { loc, lang } = useLocale();
  const steps: Array<{ key: Step; to: string }> = [
    { key: "shop", to: loc("/shop") },
    { key: "cart", to: loc("/cart") },
    { key: "checkout", to: loc("/checkout") },
  ];
  const idx = steps.findIndex((s) => s.key === current);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 2,
        px: { xs: 2, md: 3 },
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        flexWrap: "wrap",
      }}
    >
      {steps.map((step, i) => {
        const active = i === idx;
        const done = i < idx;
        const label = labels[lang][step.key];
        return (
          <Box key={step.key} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {i > 0 && (
              <Typography color="text.secondary" sx={{ mx: 0.5 }}>
                /
              </Typography>
            )}
            {done || active ? (
              <Typography
                component={RouterLink}
                to={step.to}
                sx={{
                  color: active ? "primary.main" : "text.secondary",
                  fontWeight: active ? 700 : 600,
                  textDecoration: "none",
                  fontSize: 15,
                  "&:hover": { color: "primary.main" },
                }}
              >
                {label}
              </Typography>
            ) : (
              <Typography color="text.disabled" sx={{ fontSize: 15 }}>
                {label}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
