import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { useLocale } from "../i18n/useLocale";

const shopResources = [
  { to: "/shop?category=18", title: "מדבקות וסטיקרים", body: "מוצרים פיזיים מהקטלוג הקיים." },
  { to: "/shop?category=26", title: "לבית הספר", body: "מוצרים לילדים ולבית הספר בחנות." },
  { to: "/shop?category=24", title: "למשרד", body: "שלטים ומוצרים לסביבת עבודה." },
];

export function ResourcesPage() {
  const { loc } = useLocale();
  return (
    <>
      <PageHeader title="מרכז משאבים" />
      <Section>
        <Typography sx={{ mb: 3 }}>
          קבצי PDF מהעמותה עדיין לא הועלו. בינתיים אפשר להזמין חומרים שכבר קיימים בחנות.
        </Typography>
        {shopResources.map((item) => (
          <Box
            key={item.to}
            component={RouterLink}
            to={item.to}
            sx={{ display: "block", borderTop: "1px solid", borderColor: "divider", py: 2, color: "inherit", textDecoration: "none" }}
          >
            <Typography variant="h3">{item.title}</Typography>
            <Typography color="text.secondary">{item.body}</Typography>
          </Box>
        ))}
        <Button component={RouterLink} to={loc("/schools")} sx={{ mt: 3, px: 0 }}>
          פעילות לבית ספר
        </Button>
      </Section>
    </>
  );
}
