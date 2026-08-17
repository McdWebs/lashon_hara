import { Box, Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { MEDIA } from "../lib/media";

export function JoinPage() {
  return (
    <>
      <PageHeader title="הצטרפו" image={MEDIA.neckWarmer} imageAlt="חם צוואר עם המשפט" />
      <Section>
        <Typography sx={{ mb: 4 }}>איך תרצו להיות שותפים?</Typography>
        <Stack spacing={4} sx={{ maxWidth: 640 }}>
          <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
            <Typography variant="h3">התחייבות אישית</Typography>
            <Typography sx={{ my: 1 }}>השינוי מתחיל בי.</Typography>
            <Button component={RouterLink} to="/join/commitment" variant="contained">
              להתחייב
            </Button>
          </Box>
          <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
            <Typography variant="h3">נבחרת השגרירים</Typography>
            <Typography sx={{ my: 1 }}>לעזור בחלוקות ולנקות את השיח ברשת.</Typography>
            <Button component={RouterLink} to="/join/ambassadors" variant="text" sx={{ px: 0 }}>
              להצטרף כשגריר/ה
            </Button>
          </Box>
        </Stack>
      </Section>
    </>
  );
}
