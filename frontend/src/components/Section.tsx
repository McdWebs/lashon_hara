import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { MEDIA } from "../lib/media";

function imagePosition(src: string) {
  if (src === MEDIA.bracelets) return "center 82%";
  if (src === MEDIA.neckWarmer) return "center 42%";
  if (src === MEDIA.fabric) return "center center";
  return "center 30%";
}

export function PageHeader({
  title,
  children,
  image = MEDIA.hoodie,
  imageAlt = "",
}: {
  title: string;
  children?: ReactNode;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        minHeight: { xs: 260, md: 400 },
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <Box
        component="img"
        src={image}
        alt={imageAlt}
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: imagePosition(image),
        }}
      />
      <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(17,17,17,0.42)" }} />
      <Container sx={{ position: "relative", maxWidth: 800, py: { xs: 4, md: 6 } }}>
        <Box sx={{ width: 48, height: 3, bgcolor: "primary.main", mb: 2 }} />
        <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "3rem" }, color: "inherit" }}>
          {title}
        </Typography>
        {children ? <Box sx={{ mt: 2, color: "inherit", "& .MuiTypography-root": { color: "inherit" } }}>{children}</Box> : null}
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
