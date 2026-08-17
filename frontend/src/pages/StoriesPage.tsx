import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { useLocale } from "../i18n/useLocale";
import { stories, type Story } from "../lib/stories";

type StoryMeta = {
  icon: SvgIconComponent;
  featured?: boolean;
};

const STORY_META: Record<string, StoryMeta> = {
  "2007-halperin": { icon: AutoStoriesOutlinedIcon, featured: true },
  "from-guerrilla-to-amutah": { icon: TrendingUpOutlinedIcon },
  "shop-funds-schools": { icon: StorefrontOutlinedIcon },
};

function StoryCard({ story, horizontal }: { story: Story; horizontal?: boolean }) {
  const { loc } = useLocale();
  const meta = STORY_META[story.slug];
  const Icon = meta?.icon ?? AutoStoriesOutlinedIcon;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        bgcolor: meta?.featured ? "rgba(237, 27, 36, 0.04)" : "background.paper",
        borderColor: meta?.featured ? "primary.main" : "divider",
        borderWidth: meta?.featured ? 2 : 1,
        transition: "border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "primary.main",
          boxShadow: "0 8px 24px rgba(17, 17, 17, 0.06)",
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={loc(`/stories/${story.slug}`)}
        sx={{ height: "100%", alignItems: "stretch", p: 0 }}
      >
        <CardContent
          sx={{
            width: "100%",
            p: { xs: 2.5, md: 3 },
            display: horizontal ? { sm: "flex" } : "block",
            gap: horizontal ? { sm: 3 } : 0,
            alignItems: horizontal ? { sm: "flex-start" } : "stretch",
          }}
        >
          <Icon
            sx={{
              fontSize: horizontal ? { xs: 40, sm: 48 } : 40,
              color: "primary.main",
              mb: horizontal ? { xs: 1.5, sm: 0 } : 1.5,
              flexShrink: 0,
            }}
            aria-hidden
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Chip
              label={story.kind}
              size="small"
              sx={{
                mb: 1.25,
                height: 24,
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: story.kind === "קמפיין" ? "rgba(237, 27, 36, 0.08)" : "rgba(17, 17, 17, 0.06)",
                color: story.kind === "קמפיין" ? "primary.main" : "text.secondary",
              }}
            />
            <Typography
              variant="h3"
              sx={{ fontSize: horizontal ? { xs: "1.15rem", sm: "1.35rem" } : "1.15rem", lineHeight: 1.3 }}
            >
              {story.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: "0.9rem" }}>
              {story.person}
            </Typography>
            <Typography
              sx={{
                mt: 1.5,
                mb: horizontal ? { xs: 2, sm: 1.5 } : 2,
                fontSize: "0.95rem",
                lineHeight: 1.65,
                color: "text.secondary",
                maxWidth: horizontal ? 560 : "none",
              }}
            >
              {story.teaser}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                color: meta?.featured ? "primary.main" : "text.primary",
                fontSize: "0.95rem",
              }}
            >
              קראו את הסיפור ←
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function StoriesPage() {
  const featured = stories.find((s) => STORY_META[s.slug]?.featured);
  const rest = stories.filter((s) => !STORY_META[s.slug]?.featured);

  return (
    <>
      <PageHeader title="הסיפורים שלנו">
        <Typography sx={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
          מאחורי המשפט «לשון הרע לא מדבר אלי» עומדים אנשים, רגעים ושינוי אמיתי. בחרו סיפור
          והתחילו לקרוא.
        </Typography>
      </PageHeader>
      <Section wide>
        {featured ? (
          <Box sx={{ mb: 3 }}>
            <StoryCard story={featured} horizontal />
          </Box>
        ) : null}

        <Grid container spacing={2}>
          {rest.map((story) => (
            <Grid key={story.slug} size={{ xs: 12, sm: 6 }}>
              <StoryCard story={story} />
            </Grid>
          ))}
        </Grid>
      </Section>
    </>
  );
}
