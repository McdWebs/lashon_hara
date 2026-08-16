import { Button, Card, CardActionArea, CardContent, Grid, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";

const shopResources = [
  { to: "/shop?category=18", title: "מדבקות וסטיקרים", body: "מוצרים פיזיים מהקטלוג הקיים." },
  { to: "/shop?category=26", title: "לבית הספר", body: "מוצרים לילדים ולבית הספר בחנות." },
  { to: "/shop?category=24", title: "למשרד", body: "שלטים ומוצרים לסביבת עבודה." },
];

const pending = ["פוסטרים להורדה", "מדריכי מורה", "מדריכי הורים", "מצגות", "נכסי רשתות"];

export function ResourcesPage() {
  return (
    <>
      <PageHeader title="מרכז משאבים" />
      <Section>
        <Typography sx={{ mb: 2 }}>
          קבצי PDF ומצגות מהעמותה עדיין לא הועלו. בינתיים אפשר להזמין חומרים פיזיים שכבר קיימים בחנות.
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {shopResources.map((item) => (
            <Grid key={item.to} size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardActionArea component={RouterLink} to={item.to} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h3">{item.title}</Typography>
                    <Typography sx={{ mt: 1 }} color="text.secondary">
                      {item.body}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Typography variant="h3" sx={{ mb: 1 }}>
          ממתין לתוכן מאושר
        </Typography>
        {pending.map((label) => (
          <Typography key={label} color="text.secondary">
            {label} — [ממתין לקובץ מהעמותה]
          </Typography>
        ))}
        <Button component={RouterLink} to="/schools" sx={{ mt: 3 }}>
          פעילות לבית ספר
        </Button>
      </Section>
    </>
  );
}
