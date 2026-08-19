import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import { useLocale } from "../i18n/useLocale";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  size = "medium",
  loading = false,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: "small" | "medium";
  loading?: boolean;
}) {
  const { lang } = useLocale();
  const btnSize = size === "small" ? "small" : "medium";

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{
        alignItems: "center",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        px: 0.5,
        py: 0.25,
      }}
    >
      <IconButton
        size={btnSize}
        aria-label={lang === "en" ? "Decrease quantity" : "הפחתה"}
        disabled={value <= min || loading}
        onClick={() => onChange(Math.max(min, value - step))}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Typography
        aria-live="polite"
        aria-atomic="true"
        sx={{
          minWidth: 28,
          textAlign: "center",
          fontWeight: 700,
          position: "relative",
          opacity: loading ? 0.35 : 1,
          transition: "opacity .2s ease",
        }}
      >
        {value}
        {loading && (
          <CircularProgress
            size={12}
            thickness={5}
            sx={{
              position: "absolute",
              inset: 0,
              margin: "auto",
              color: "text.primary",
            }}
          />
        )}
      </Typography>
      <IconButton
        size={btnSize}
        aria-label={lang === "en" ? "Increase quantity" : "הוספה"}
        disabled={value >= max || loading}
        onClick={() => onChange(Math.min(max, value + step))}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}
