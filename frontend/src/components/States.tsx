import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function LoadingState() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }} role="status" aria-live="polite">
      <CircularProgress />
    </Box>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            נסו שוב
          </Button>
        ) : undefined
      }
    >
      {message}
    </Alert>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Typography color="text.secondary" sx={{ py: 4 }}>
      {children}
    </Typography>
  );
}
