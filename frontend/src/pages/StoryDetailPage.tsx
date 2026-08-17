import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { useLocale } from "../i18n/useLocale";
import { getAdjacentStories, getStory, type Story, type StoryBlock } from "../lib/stories";

const ARC_STEPS: { key: keyof Pick<Story, "situation" | "problem" | "happened" | "changed">; label: string }[] = [
  { key: "situation", label: "המצב" },
  { key: "problem", label: "הבעיה" },
  { key: "happened", label: "מה קרה" },
  { key: "changed", label: "מה השתנה" },
];

function StoryQuote({ text, attribution }: { text: string; attribution?: string }) {
  return (
    <Box
      sx={{
        position: "relative",
        my: 3,
        py: 2.5,
        px: 3,
        pl: 4,
        borderInlineStart: "3px solid",
        borderColor: "primary.main",
        bgcolor: "rgba(237, 27, 36, 0.04)",
        borderRadius: 1,
      }}
    >
      <FormatQuoteOutlinedIcon
        sx={{
          position: "absolute",
          top: 12,
          insetInlineStart: 12,
          fontSize: 20,
          color: "primary.main",
          opacity: 0.35,
        }}
        aria-hidden
      />
      <Typography sx={{ fontSize: "1.05rem", lineHeight: 1.8, fontStyle: "italic" }}>{text}</Typography>
      {attribution ? (
        <Typography sx={{ mt: 1.5, fontWeight: 600, fontSize: "0.9rem", color: "text.secondary" }}>
          {attribution}
        </Typography>
      ) : null}
    </Box>
  );
}

function ArcStep({ label, text, index }: { label: string; text: string; index: number }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        py: 2.5,
        borderTop: index === 0 ? "none" : "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: "rgba(237, 27, 36, 0.08)",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "0.85rem",
          mt: 0.25,
        }}
        aria-hidden
      >
        {index + 1}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, mb: 0.75, fontSize: "1rem" }}>{label}</Typography>
        <Typography sx={{ fontSize: "1rem", lineHeight: 1.85, color: "text.secondary" }}>{text}</Typography>
      </Box>
    </Box>
  );
}

function StoryBlocks({ blocks }: { blocks: StoryBlock[] }) {
  return (
    <Box sx={{ mt: 4 }}>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <Typography
              key={i}
              component="h2"
              sx={{ mt: i === 0 ? 0 : 5, mb: 2, fontWeight: 700, fontSize: "1.35rem", lineHeight: 1.35 }}
            >
              {block.text}
            </Typography>
          );
        }
        if (block.type === "quote") {
          return <StoryQuote key={i} text={block.text} attribution={block.attribution} />;
        }
        return (
          <Typography key={i} sx={{ mb: 2, fontSize: "1rem", lineHeight: 1.85 }}>
            {block.text}
            {block.attribution ? (
              <Typography component="span" sx={{ display: "block", mt: 1.5, fontWeight: 600, color: "text.secondary" }}>
                {block.attribution}
              </Typography>
            ) : null}
          </Typography>
        );
      })}
    </Box>
  );
}

function StoryDetailContent({ story }: { story: Story }) {
  const { loc } = useLocale();
  const { prev, next } = getAdjacentStories(story.slug);

  return (
    <>
      <PageHeader title={story.title}>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
          <Chip
            label={story.kind}
            size="small"
            sx={{
              height: 26,
              fontWeight: 600,
              bgcolor: story.kind === "קמפיין" ? "rgba(237, 27, 36, 0.08)" : "rgba(17, 17, 17, 0.06)",
              color: story.kind === "קמפיין" ? "primary.main" : "text.secondary",
            }}
          />
          <Typography component="span" color="text.secondary" sx={{ alignSelf: "center", fontSize: "0.95rem" }}>
            {story.person}
          </Typography>
        </Stack>
      </PageHeader>

      <Section>
        <StoryQuote text={story.lesson} />

        <Typography sx={{ mb: 4, fontSize: "1.05rem", lineHeight: 1.85, color: "text.primary" }}>
          {story.intro}
        </Typography>

        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            px: { xs: 2, md: 3 },
            pb: 1,
            bgcolor: "background.default",
          }}
        >
          {ARC_STEPS.map((step, index) => (
            <ArcStep key={step.key} label={step.label} text={story[step.key]} index={index} />
          ))}
        </Box>

        {story.extra?.length ? <StoryBlocks blocks={story.extra} /> : null}

        <Box
          sx={{
            mt: 5,
            p: { xs: 2.5, md: 3 },
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(237, 27, 36, 0.03)",
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 2, fontSize: "1.05rem" }}>רוצים להיות חלק מהסיפור?</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
            {story.ctas.map((cta) => (
              <Button
                key={cta.to}
                component={RouterLink}
                to={loc(cta.to)}
                variant={cta.primary ? "contained" : "outlined"}
              >
                {cta.label}
              </Button>
            ))}
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          מקור: {story.source}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            mt: 4,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            justifyContent: "space-between",
            alignItems: { sm: "center" },
          }}
        >
          <Button
            component={RouterLink}
            to={loc("/stories")}
            startIcon={<ArrowForwardOutlinedIcon />}
            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
          >
            חזרה לכל הסיפורים
          </Button>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            {prev ? (
              <Button
                component={RouterLink}
                to={loc(`/stories/${prev.slug}`)}
                variant="outlined"
                size="small"
                startIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 18 }} />}
              >
                {prev.title}
              </Button>
            ) : null}
            {next ? (
              <Button
                component={RouterLink}
                to={loc(`/stories/${next.slug}`)}
                variant="outlined"
                size="small"
                endIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />}
              >
                {next.title}
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Section>
    </>
  );
}

export function StoryDetailPage() {
  const { slug } = useParams();
  const { loc } = useLocale();
  const story = slug ? getStory(slug) : undefined;

  if (!story) {
    return (
      <>
        <PageHeader title="הסיפור לא נמצא" />
        <Section>
          <Typography sx={{ mb: 3, color: "text.secondary" }}>
            הסיפור שחיפשתם לא קיים. אפשר לבחור סיפור אחר מהרשימה.
          </Typography>
          <Button component={RouterLink} to={loc("/stories")} variant="contained">
            חזרה לסיפורים
          </Button>
        </Section>
      </>
    );
  }

  return <StoryDetailContent story={story} />;
}
