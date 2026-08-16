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
import { Link as RouterLink, NavLink } from "react-router-dom";
import { SITE } from "../lib/site";

const nav = [
  { to: "/message", label: "המסר" },
  { to: "/activities", label: "הפעילות" },
  { to: "/join", label: "הצטרפו" },
  { to: "/schools", label: "לבתי ספר" },
  { to: "/stories", label: "הסיפורים שלנו" },
  { to: "/shop", label: "חנות" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  const links = nav.map((item) => (
    <Button
      key={item.to}
      component={NavLink}
      to={item.to}
      color="inherit"
      sx={{
        "&.active": { fontWeight: 800, borderBottom: "2px solid", borderColor: "primary.main" },
      }}
    >
      {item.label}
    </Button>
  ));

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
      <Toolbar sx={{ gap: 1, py: 1 }}>
        <Box component={RouterLink} to="/" sx={{ display: "flex", alignItems: "center", ml: { md: 1 } }}>
          <Box component="img" src={SITE.logoSrc} alt={SITE.name} sx={{ height: { xs: 28, sm: 36 }, width: "auto" }} />
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" }, flex: 1, justifyContent: "center" }}>
          {links}
        </Stack>
        <Button component={RouterLink} to="/donate" variant="contained" sx={{ display: { xs: "none", md: "inline-flex" } }}>
          תרומה
        </Button>
        <IconButton
          aria-label="תפריט"
          onClick={() => setOpen(true)}
          sx={{ display: { md: "none" }, mr: "auto" }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, p: 2 }} role="presentation">
          <List>
            {nav.map((item) => (
              <ListItemButton key={item.to} component={RouterLink} to={item.to} onClick={() => setOpen(false)}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            <ListItemButton component={RouterLink} to="/donate" onClick={() => setOpen(false)}>
              <ListItemText primary="תרומה" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
