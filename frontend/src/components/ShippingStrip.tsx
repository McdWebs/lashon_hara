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

export function ShippingStrip({ compact = false }: { compact?: boolean }) {
  const { lang } = useLocale();
  const rows = items[lang];

  return (
    <Stack
      direction={compact ? "column" : { xs: "column", md: "row" }}
      spacing={compact ? 1.25 : { xs: 1.25, md: 2 }}
      useFlexGap
      sx={{
        py: compact ? 1.5 : 2,
        px: compact ? 1.75 : 2.5,
        borderRadius: 2,
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
        ...(compact
          ? {}
          : {
              flexWrap: "wrap",
            }),
      }}
    >
      {rows.map(({ icon: Icon, text }) => (
        <Stack
          key={text}
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            minWidth: compact ? "100%" : { md: 0 },
            flex: compact ? "none" : { md: "1 1 auto" },
          }}
        >
          <Icon sx={{ fontSize: compact ? 18 : 20, color: "primary.main", flexShrink: 0 }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: compact ? "0.82rem" : undefined,
              lineHeight: 1.35,
            }}
          >
            {text}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
