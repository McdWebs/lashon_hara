import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { IconButton, Stack, Typography } from "@mui/material";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "medium",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  size?: "small" | "medium";
}) {
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
        aria-label="הפחתה"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Typography sx={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}>{value}</Typography>
      <IconButton
        size={btnSize}
        aria-label="הוספה"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}
