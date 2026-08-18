import type { SvgIconComponent } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

export function SocialLink({ href, label, icon: Icon }: { href: string; label: string; icon: SvgIconComponent }) {
  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: 36,
        px: 1,
        borderRadius: 999,
        color: "inherit",
        textDecoration: "none",
        opacity: 0.78,
        overflow: "hidden",
        transition: "opacity 0.2s ease, color 0.2s ease, background-color 0.2s ease",
        "&:hover": {
          opacity: 1,
          color: "primary.main",
          bgcolor: "rgba(237, 27, 36, 0.06)",
          "& .social-label": {
            maxWidth: 120,
            opacity: 1,
            marginInlineEnd: 0.75,
          },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& .social-label": {
            maxWidth: 120,
            opacity: 1,
            marginInlineEnd: 0.75,
          },
        },
      }}
    >
      <Typography
        component="span"
        className="social-label"
        sx={{
          maxWidth: 0,
          opacity: 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1,
          marginInlineEnd: 0,
          transition: "max-width 0.28s ease, opacity 0.22s ease, margin-inline-end 0.28s ease",
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
          },
        }}
      >
        {label}
      </Typography>
      <Icon sx={{ fontSize: 20, flexShrink: 0 }} aria-hidden />
    </Box>
  );
}
