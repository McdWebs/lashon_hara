import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";
import { useLocale } from "../i18n/useLocale";
import { ACTIVITIES } from "../lib/activities";

function ActivitySection({ activity }: { activity: (typeof ACTIVITIES)[number] }) {
  const { loc } = useLocale();
  const Icon = activity.icon;

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 3,
        bgcolor: "background.paper",
        scrollMarginTop: 96,
      }}
      id={activity.id}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 1,
              bgcolor: "rgba(237, 27, 36, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 28, color: "primary.main" }} aria-hidden />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h3" sx={{ fontSize: { xs: "1.2rem", md: "1.4rem" }, lineHeight: 1.3 }}>
              {activity.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, fontSize: "0.95rem", lineHeight: 1.6 }}>
              {activity.teaser}
            </Typography>
          </Box>
        </Stack>

        {activity.paragraphs.map((paragraph, i) => (
          <Typography key={i} sx={{ mb: 2, fontSize: "1rem", lineHeight: 1.85 }}>
            {paragraph}
          </Typography>
        ))}

        {activity.bullets?.length ? (
          <Box
            component="ul"
            sx={{
              m: 0,
              mb: activity.quote || activity.ctas?.length ? 2.5 : 0,
              pr: 2.5,
              "& li": { mb: 1, lineHeight: 1.75, fontSize: "0.98rem" },
            }}
          >
            {activity.bullets.map((item) => {
              const key = typeof item === "string" ? item : item.label;
              if (typeof item === "string") {
                return <li key={key}>{item}</li>;
              }
              return (
                <li key={key}>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontWeight: 600,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {item.label}
                    <OpenInNewOutlinedIcon sx={{ fontSize: 16, opacity: 0.7 }} aria-hidden />
                  </Link>
                </li>
              );
            })}
          </Box>
        ) : null}

        {activity.quote ? (
          <Box
            sx={{
              position: "relative",
              my: 2.5,
              py: 2,
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
                top: 10,
                insetInlineStart: 10,
                fontSize: 18,
                color: "primary.main",
                opacity: 0.35,
              }}
              aria-hidden
            />
            <Typography sx={{ fontSize: "1rem", lineHeight: 1.8, fontStyle: "italic", fontWeight: 600 }}>
              {activity.quote}
            </Typography>
          </Box>
        ) : null}

        {activity.ctas?.length ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", mt: 1 }}>
            {activity.ctas.map((cta) => (
              <Button
                key={cta.to}
                component={RouterLink}
                to={loc(cta.to)}
                variant={cta.primary ? "contained" : "outlined"}
                size="small"
              >
                {cta.label}
              </Button>
            ))}
          </Stack>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ActivitiesPage() {
  return (
    <>
      <PageHeader title="הפעילות שלנו">
        <Typography sx={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
          יחד מחזקים מודעות לשיח מכבד, מזכירים שמילים יכולות לפגוע — ומובילים שינוי חברתי דרך חינוך,
          חלוקות, שגרירים ברשת, וקמפיינים ציבוריים.
        </Typography>
      </PageHeader>
      <Section wide>
        {ACTIVITIES.map((activity) => (
          <ActivitySection key={activity.id} activity={activity} />
        ))}
      </Section>
    </>
  );
}
