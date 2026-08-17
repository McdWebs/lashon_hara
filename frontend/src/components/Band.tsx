import { Box, Container } from "@mui/material";
import type { ReactNode } from "react";

type Tone = "paper" | "dark" | "flush";

export function Band({
  children,
  tone = "paper",
  contained = true,
}: {
  children: ReactNode;
  tone?: Tone;
  contained?: boolean;
}) {
  const bg = tone === "dark" ? "#111111" : tone === "flush" ? "transparent" : "background.paper";
  const color = tone === "dark" ? "#fff" : "text.primary";
  const inner = contained ? <Container sx={{ maxWidth: 1120 }}>{children}</Container> : children;
  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: bg,
        color,
      }}
    >
      {inner}
    </Box>
  );
}
