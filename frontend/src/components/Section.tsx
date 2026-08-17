import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  children,
  singleLine,
}: {
  title: string;
  children?: ReactNode;
  singleLine?: boolean;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "#F4F1EA",
        backgroundImage: `
          radial-gradient(circle at 88% 18%, rgba(237, 27, 36, 0.11) 0%, transparent 42%),
          radial-gradient(circle at 12% 88%, rgba(17, 17, 17, 0.05) 0%, transparent 38%),
          linear-gradient(160deg, #FFFCF7 0%, #F4F1EA 52%, #EBE4D8 100%)
        `,
        "&::after": {
          content: '""',
          position: "absolute",
          insetBlockEnd: -48,
          insetInlineEnd: -48,
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: "1px solid rgba(237, 27, 36, 0.14)",
          pointerEvents: "none",
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          insetBlockStart: 24,
          insetInlineEnd: { xs: -40, md: 48 },
          width: { xs: 180, md: 260 },
          height: { xs: 180, md: 260 },
          borderRadius: "50%",
          border: "1px solid rgba(17, 17, 17, 0.06)",
          pointerEvents: "none",
        }}
      />
      <Container sx={{ position: "relative", maxWidth: 800, py: { xs: 4.5, md: 6 } }}>
        <Box sx={{ width: 48, height: 3, bgcolor: "primary.main", mb: 2 }} />
        <Typography
          variant="h1"
          sx={{
            fontSize: singleLine
              ? { xs: "1.55rem", sm: "1.85rem", md: "2.15rem" }
              : { xs: "1.75rem", sm: "2.15rem", md: "2.5rem" },
            lineHeight: 1.12,
            ...(singleLine ? { whiteSpace: { xs: "normal", sm: "nowrap" } } : {}),
          }}
        >
          {title}
        </Typography>
        {children ? (
          <Box sx={{ mt: 2, maxWidth: 640, color: "text.secondary", "& .MuiTypography-root": { color: "inherit" } }}>
            {children}
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}

export function Section({ children, muted, wide }: { children: ReactNode; muted?: boolean; wide?: boolean }) {
  return (
    <Box
      sx={{
        py: { xs: 5, md: 8 },
        bgcolor: muted ? "background.default" : "background.paper",
      }}
    >
      <Container sx={{ maxWidth: wide ? 1120 : 800 }}>{children}</Container>
    </Box>
  );
}
