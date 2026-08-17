import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RedeemOutlinedIcon from "@mui/icons-material/RedeemOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Stack, Typography } from "@mui/material";
import { useLocale } from "../i18n/useLocale";

const items = {
  he: [
    { icon: LocalShippingOutlinedIcon, text: "משלוח עד הבית" },
    { icon: StorefrontOutlinedIcon, text: "איסוף מנקודה" },
    { icon: RedeemOutlinedIcon, text: "משלוח חינם מעל 100 ₪" },
  ],
  en: [
    { icon: LocalShippingOutlinedIcon, text: "Home delivery" },
    { icon: StorefrontOutlinedIcon, text: "Pickup points" },
    { icon: RedeemOutlinedIcon, text: "Free shipping over ₪100" },
  ],
} as const;

export function ShippingStrip() {
  const { lang } = useLocale();
  const rows = items[lang];

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 1, sm: 3 }}
      sx={{
        py: 2,
        px: 2.5,
        borderRadius: 2,
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {rows.map(({ icon: Icon, text }) => (
        <Stack key={text} direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Icon sx={{ fontSize: 20, color: "primary.main" }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {text}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
