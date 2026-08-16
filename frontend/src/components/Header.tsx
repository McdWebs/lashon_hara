import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Link,
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
import { SITE, waLink } from "../lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const { loc, t, lang } = useLocale();
  const { pathname } = useLocation();
  const other = lang === "he" ? "en" : "he";

  const nav = [
    { to: loc("/message"), label: t("navMessage") },
    { to: loc("/join"), label: t("navJoin") },
    { to: loc("/schools"), label: t("navSchools") },
    { to: loc("/shop"), label: t("navShop") },
  ];

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
      <Toolbar sx={{ gap: 1, py: 1, minHeight: 64 }}>
        <Box component={RouterLink} to={loc("/")} sx={{ display: "flex", alignItems: "center", ml: 0.5 }}>
          <Box component="img" src={SITE.logoSrc} alt={t("slogan")} sx={{ height: { xs: 26, sm: 32 }, width: "auto" }} />
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" }, flex: 1, justifyContent: "center" }}>
          {nav.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              color="inherit"
              sx={{
                borderRadius: 0,
                "&.active": { fontWeight: 800, boxShadow: "inset 0 -2px 0 #ED1B24" },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
        <Link href={waLink()} underline="hover" sx={{ display: { xs: "none", sm: "inline" }, fontSize: 14, mr: 1 }}>
          WhatsApp
        </Link>
        <Button component={RouterLink} to={withLocale(pathname, other)} variant="text" size="small" color="inherit">
          {t("langSwitch")}
        </Button>
        <Button component={RouterLink} to={loc("/donate")} variant="outlined" sx={{ display: { xs: "none", md: "inline-flex" } }}>
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
            <ListItemButton component="a" href={waLink()} onClick={() => setOpen(false)}>
              <ListItemText primary="WhatsApp" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
