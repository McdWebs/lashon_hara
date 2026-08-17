import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { ShopUseCase } from "../lib/shop";
import { useLocale } from "../i18n/useLocale";

export function UseCaseCard({ item, active }: { item: ShopUseCase; active?: boolean }) {
  const { loc, lang } = useLocale();
  const Icon = item.icon;

  const inner = (
    <>
      <Icon sx={{ fontSize: { xs: 32, sm: 40 }, color: "primary.main", mb: { xs: 1, sm: 1.5 } }} aria-hidden />
      <Typography variant="h3" sx={{ fontSize: { xs: "0.92rem", sm: "1.05rem" }, lineHeight: 1.35 }}>
        {item.label[lang]}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: "0.8rem", sm: "0.9rem" }, lineHeight: 1.45 }}>
        {item.body[lang]}
      </Typography>
    </>
  );

  const contentSx = { width: "100%", p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } };

  const cardSx = {
    height: "100%",
    borderColor: active ? "primary.main" : "divider",
    borderWidth: active ? 2 : 1,
    bgcolor: active ? "rgba(237, 27, 36, 0.04)" : "background.paper",
    transition: "border-color 0.15s ease, transform 0.15s ease",
    "&:hover": { transform: "translateY(-2px)" },
  };

  if (item.kind === "category") {
    return (
      <Card variant="outlined" sx={cardSx}>
        <CardActionArea
          component={RouterLink}
          to={loc(`/shop?category=${item.category}`)}
          sx={{ height: "100%", alignItems: "flex-start", p: 0 }}
        >
          <CardContent sx={contentSx}>{inner}</CardContent>
        </CardActionArea>
      </Card>
    );
  }

  if (item.kind === "link") {
    return (
      <Card variant="outlined" sx={cardSx}>
        <CardActionArea component={RouterLink} to={loc(item.to)} sx={{ height: "100%", alignItems: "flex-start" }}>
          <CardContent sx={contentSx}>{inner}</CardContent>
        </CardActionArea>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={cardSx}>
      <CardActionArea
        onClick={() => {
          document.getElementById("bundles")?.scrollIntoView({ behavior: "smooth" });
          window.history.replaceState(null, "", `${window.location.pathname}#bundles`);
        }}
        sx={{ height: "100%", alignItems: "flex-start" }}
      >
        <CardContent sx={contentSx}>{inner}</CardContent>
      </CardActionArea>
    </Card>
  );
}
