import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { useLocale } from "../i18n/useLocale";
import { stories } from "../lib/stories";

export function StoriesPage() {
  const { loc } = useLocale();
  return (
    <>
      <PageHeader title="הסיפורים שלנו" />
      <Section>
        <Typography sx={{ mb: 3 }} color="text.secondary">
          סיפורי הארגון כפי שפורסמו באתר.
        </Typography>
        {stories.map((story) => (
          <Box
            key={story.slug}
            component={RouterLink}
            to={loc(`/stories/${story.slug}`)}
            sx={{
              display: "block",
              borderTop: "1px solid",
              borderColor: "divider",
              py: 2.5,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Typography variant="overline">{story.kind}</Typography>
            <Typography variant="h3">{story.title}</Typography>
            <Typography color="text.secondary">{story.person}</Typography>
          </Box>
        ))}
      </Section>
    </>
  );
}
