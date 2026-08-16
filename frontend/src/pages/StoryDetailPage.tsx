import { Button, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { getStory } from "../lib/stories";

export function StoryDetailPage() {
  const { slug } = useParams();
  const story = slug ? getStory(slug) : undefined;

  if (!story) {
    return (
      <>
        <PageHeader title="הסיפור לא נמצא" />
        <Section>
          <Button component={RouterLink} to="/stories">
            חזרה לסיפורים
          </Button>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader title={story.title} />
      <Section>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {story.kind} · {story.person}
        </Typography>
        <Typography sx={{ fontWeight: 700 }}>המצב</Typography>
        <Typography sx={{ mb: 2 }}>{story.situation}</Typography>
        <Typography sx={{ fontWeight: 700 }}>הבעיה</Typography>
        <Typography sx={{ mb: 2 }}>{story.problem}</Typography>
        <Typography sx={{ fontWeight: 700 }}>מה קרה</Typography>
        <Typography sx={{ mb: 2 }}>{story.happened}</Typography>
        <Typography sx={{ fontWeight: 700 }}>מה השתנה</Typography>
        <Typography sx={{ mb: 2 }}>{story.changed}</Typography>
        <Typography sx={{ fontWeight: 700 }}>הלקח</Typography>
        <Typography sx={{ mb: 2 }}>{story.lesson}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          מקור: {story.source}
        </Typography>
        <Button component={RouterLink} to="/join/commitment" variant="contained">
          גם אני מצטרף/ת
        </Button>
        <Button component={RouterLink} to="/schools" sx={{ ml: 1 }}>
          לבתי ספר
        </Button>
      </Section>
    </>
  );
}
