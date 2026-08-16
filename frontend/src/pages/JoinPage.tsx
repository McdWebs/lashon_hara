import { Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";

export function JoinPage() {
  return (
    <>
      <PageHeader title="הצטרפו" />
      <Section>
        <Typography sx={{ mb: 2 }}>איך תרצו להיות שותפים?</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h3">התחייבות אישית</Typography>
                <Typography sx={{ my: 1 }}>השינוי מתחיל בי.</Typography>
                <Button component={RouterLink} to="/join/commitment" variant="contained">
                  להתחייב
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h3">נבחרת השגרירים</Typography>
                <Typography sx={{ my: 1 }}>לעזור בחלוקות ולנקות את השיח ברשת.</Typography>
                <Button component={RouterLink} to="/join/ambassadors">
                  להצטרף כשגריר/ה
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Section>
    </>
  );
}
