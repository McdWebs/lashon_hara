import { Card, CardActionArea, CardContent, Grid, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { stories } from "../lib/stories";

export function StoriesPage() {
  return (
    <>
      <PageHeader title="הסיפורים שלנו" />
      <Section>
        <Typography sx={{ mb: 3 }} color="text.secondary">
          רק סיפורי ארגון שפורסמו באתר. אין כאן עדויות אישיות מומצאות.
        </Typography>
        <Grid container spacing={2}>
          {stories.map((story) => (
            <Grid key={story.slug} size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardActionArea component={RouterLink} to={`/stories/${story.slug}`} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="overline">{story.kind}</Typography>
                    <Typography variant="h3">{story.title}</Typography>
                    <Typography sx={{ mt: 1 }} color="text.secondary">
                      {story.person}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>
    </>
  );
}

