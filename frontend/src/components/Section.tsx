import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid", borderColor: "divider", py: { xs: 4, md: 6 } }}>
      <Container>
        <Typography variant="h1" sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" } }}>
          {title}
        </Typography>
        {children}
      </Container>
    </Box>
  );
}

export function Section({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <Box sx={{ py: { xs: 5, md: 8 }, bgcolor: muted ? "background.default" : "background.paper" }}>
      <Container>{children}</Container>
    </Box>
  );
}
