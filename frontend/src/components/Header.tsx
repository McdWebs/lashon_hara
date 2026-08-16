import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, NavLink, useLocation } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { withLocale } from "../i18n/locale";
import { SITE } from "../lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const { loc, t, lang } = useLocale();
  const { pathname } = useLocation();
  const other = lang === "he" ? "en" : "he";

  const nav = [
    { to: loc("/message"), label: t("navMessage") },
    { to: loc("/activities"), label: t("navActivity") },
    { to: loc("/join"), label: t("navJoin") },
    { to: loc("/schools"), label: t("navSchools") },
    { to: loc("/stories"), label: t("navStories") },
    { to: loc("/shop"), label: t("navShop") },
    { to: loc("/map"), label: t("navMap") },
  ];

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
      <Toolbar sx={{ gap: 1, py: 1 }}>
        <Box component={RouterLink} to={loc("/")} sx={{ display: "flex", alignItems: "center" }}>
          <Box component="img" src={SITE.logoSrc} alt={t("slogan")} sx={{ height: { xs: 28, sm: 36 }, width: "auto" }} />
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" }, flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
          {nav.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              color="inherit"
              sx={{ "&.active": { fontWeight: 800, borderBottom: "2px solid", borderColor: "primary.main" } }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
        <Button component={RouterLink} to={withLocale(pathname, other)} variant="text" size="small">
          {t("langSwitch")}
        </Button>
        <Button component={RouterLink} to={loc("/donate")} variant="contained" sx={{ display: { xs: "none", md: "inline-flex" } }}>
          {t("navDonate")}
        </Button>
        <IconButton aria-label={t("menu")} onClick={() => setOpen(true)} sx={{ display: { md: "none" } }}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Drawer anchor={lang === "he" ? "right" : "left"} open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, p: 2 }} role="presentation">
          <List>
            {nav.map((item) => (
              <ListItemButton key={item.to} component={RouterLink} to={item.to} onClick={() => setOpen(false)}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            <ListItemButton component={RouterLink} to={loc("/donate")} onClick={() => setOpen(false)}>
              <ListItemText primary={t("navDonate")} />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
