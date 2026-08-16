import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Box sx={{ bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider", py: { xs: 5, md: 8 } }}>
      <Container sx={{ maxWidth: 800 }}>
        <Box sx={{ width: 48, height: 3, bgcolor: "primary.main", mb: 2 }} />
        <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
          {title}
        </Typography>
        {children}
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
