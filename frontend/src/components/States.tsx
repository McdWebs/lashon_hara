import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import type { ButtonProps } from "@mui/material";
import type { ReactNode } from "react";

export function LoadingState({ label }: { label?: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 8,
      }}
      role="status"
      aria-live="polite"
      aria-label={label ?? "טוען"}
    >
      <CircularProgress size={36} />
      {label ? (
        <Typography color="text.secondary" sx={{ fontSize: "0.95rem" }}>
          {label}
        </Typography>
      ) : null}
    </Box>
  );
}

export function LoadingButton({
  loading,
  children,
  startIcon,
  ...props
}: ButtonProps & { loading?: boolean }) {
  return (
    <Button
      {...props}
      disabled={loading || props.disabled}
      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : startIcon}
    >
      {children}
    </Button>
  );
}

export function ProductCardSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ overflow: "hidden", bgcolor: "#eee9e0", aspectRatio: "4 / 5", position: "relative" }}>
        <Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", bgcolor: "#eee9e0" }} animation="wave" />
      </Box>
      <Box sx={{ pt: { xs: 1.25, md: 1.6 }, pb: 1 }}>
        <Skeleton width="90%" height={16} sx={{ mb: 0.5 }} animation="wave" />
        <Skeleton width="60%" height={16} animation="wave" />
        <Skeleton width="30%" height={14} sx={{ mt: 0.55 }} animation="wave" />
      </Box>
    </Box>
  );
}

export function ProductGridSkeleton({ count = 8, columns = 3 }: { count?: number; columns?: 3 | 4 }) {
  return (
    <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <Grid key={i} size={{ xs: 6, sm: 6, md: columns === 4 ? 3 : 4 }}>
          <ProductCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

export function ProductPageSkeleton() {
  return (
    <Box sx={{ py: { xs: 5, md: 8 } }}>
      <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          <Box sx={{ flex: { md: "0 0 420px" } }}>
            <Skeleton variant="rounded" sx={{ width: "100%", aspectRatio: { xs: "4 / 5", md: "4 / 5.15" }, bgcolor: "#eee9e0" }} />
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} variant="rounded" width={72} height={72} />
              ))}
            </Stack>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Skeleton width="80%" height={40} />
            <Skeleton width="30%" height={36} sx={{ mt: 2 }} />
            <Skeleton width="100%" height={20} sx={{ mt: 3 }} />
            <Skeleton width="95%" height={20} sx={{ mt: 1 }} />
            <Skeleton width="88%" height={20} sx={{ mt: 1 }} />
            <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
            <Skeleton variant="rounded" width="100%" height={48} sx={{ mt: 3 }} />
            <Stack direction="row" spacing={2} sx={{ mt: 3, alignItems: "center" }}>
              <Skeleton variant="rounded" width={120} height={44} />
              <Skeleton variant="rounded" width={160} height={48} />
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export function StatsSkeleton() {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={3} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} sx={{ minWidth: 120 }}>
          <Skeleton width={48} height={32} />
          <Skeleton width={140} height={20} sx={{ mt: 0.75 }} />
        </Box>
      ))}
    </Stack>
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
