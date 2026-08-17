import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import { Avatar, Box, Card, CardContent, Typography } from "@mui/material";
import type { MockAmbassador } from "../lib/ambassadors";
import { useLocale } from "../i18n/useLocale";

function initials(name: string) {
  const parts = name.replace(/\./g, "").trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export function AmbassadorProfileCard({ ambassador }: { ambassador: MockAmbassador }) {
  const { lang } = useLocale();

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "primary.main",
              fontFamily: '"Secular One", Heebo, sans-serif',
              fontSize: "1.1rem",
            }}
          >
            {initials(ambassador.name)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>{ambassador.name}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
              {ambassador.city} · {ambassador.role[lang]}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            pl: 2.5,
            pr: 1,
            py: 1.5,
            mb: 2,
            borderInlineStart: "3px solid",
            borderColor: "primary.main",
            bgcolor: "rgba(237, 27, 36, 0.04)",
            borderRadius: 1,
            flex: 1,
          }}
        >
          <FormatQuoteOutlinedIcon
            sx={{
              position: "absolute",
              top: 8,
              insetInlineStart: 8,
              fontSize: 18,
              color: "primary.main",
              opacity: 0.35,
            }}
            aria-hidden
          />
          <Typography sx={{ fontSize: "0.98rem", lineHeight: 1.75, fontStyle: "italic" }}>
            {ambassador.quote[lang]}
          </Typography>
        </Box>

        <Typography color="text.secondary" sx={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
          <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
            {lang === "en" ? "Why I joined: " : "למה הצטרפתי: "}
          </Box>
          {ambassador.joined[lang]}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, fontSize: "0.88rem", lineHeight: 1.6 }}>
          <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
            {lang === "en" ? "What I do: " : "מה אני עושה: "}
          </Box>
          {ambassador.activity[lang]}
        </Typography>
      </CardContent>
    </Card>
  );
}
