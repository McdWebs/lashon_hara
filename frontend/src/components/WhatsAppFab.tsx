import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Fab } from "@mui/material";
import { waLink } from "../lib/site";

export function WhatsAppFab() {
  return (
    <Fab
      color="success"
      aria-label="WhatsApp"
      href={waLink("שלום, הגעתי מהאתר")}
      target="_blank"
      rel="noreferrer"
      sx={{ position: "fixed", bottom: 20, left: 20, zIndex: 20 }}
    >
      <WhatsAppIcon />
    </Fab>
  );
}
