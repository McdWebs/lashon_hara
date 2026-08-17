import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../i18n/useLocale";
import type { MockAmbassador } from "../lib/ambassadors";
import { AmbassadorProfileCard } from "./AmbassadorProfileCard";

type AmbassadorCarouselProps = {
  ambassadors: MockAmbassador[];
  autoPlayMs?: number;
};

const SWIPE_THRESHOLD = 48;
const DEFAULT_AUTO_PLAY_MS = 6500;

export function AmbassadorCarousel({
  ambassadors,
  autoPlayMs = DEFAULT_AUTO_PLAY_MS,
}: AmbassadorCarouselProps) {
  const { lang } = useLocale();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const count = ambassadors.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const pauseAutoPlay = () => {
    pausedRef.current = true;
  };

  const resumeAutoPlay = () => {
    pausedRef.current = false;
  };

  const resumeAfterInteraction = () => {
    window.setTimeout(resumeAutoPlay, autoPlayMs);
  };

  useEffect(() => {
    if (count <= 1 || autoPlayMs <= 0) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const id = window.setInterval(() => {
      if (!pausedRef.current) {
        setIndex((current) => (current + 1) % count);
      }
    }, autoPlayMs);

    return () => window.clearInterval(id);
  }, [autoPlayMs, count]);

  const onTouchStart = (e: React.TouchEvent) => {
    pauseAutoPlay();
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) {
      resumeAutoPlay();
      return;
    }
    const delta = e.changedTouches[0]?.clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta == null || Math.abs(delta) < SWIPE_THRESHOLD) {
      resumeAutoPlay();
      return;
    }
    const swipeNext = isRtl ? delta > 0 : delta < 0;
    goTo(swipeNext ? index + 1 : index - 1);
    resumeAfterInteraction();
  };

  if (count === 0) return null;

  return (
    <Box
      role="region"
      aria-roledescription="carousel"
      aria-label={lang === "en" ? "Ambassador testimonials" : "עדויות שגרירים"}
      sx={{ position: "relative", userSelect: "none", px: { xs: 0, sm: 5 } }}
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
      onFocus={pauseAutoPlay}
      onBlur={resumeAutoPlay}
    >
      <Box
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        sx={{ touchAction: "pan-y", maxWidth: 720, mx: "auto" }}
      >
        <Box
          sx={{
            display: "grid",
            "& > *": { gridArea: "1 / 1" },
          }}
          aria-live="polite"
        >
          {ambassadors.map((ambassador, i) => (
            <Box
              key={ambassador.id}
              aria-hidden={i !== index}
              sx={{
                opacity: i === index ? 1 : 0,
                transform: i === index ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)",
                transition: "opacity 0.55s ease, transform 0.55s ease",
                pointerEvents: i === index ? "auto" : "none",
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                  transform: "none",
                },
              }}
            >
              <AmbassadorProfileCard ambassador={ambassador} />
            </Box>
          ))}
        </Box>
      </Box>

      {count > 1 && (
        <>
          <IconButton
            aria-label={lang === "en" ? "Previous testimonial" : "עדות קודמת"}
            onClick={() => {
              pauseAutoPlay();
              goTo(index - 1);
              resumeAfterInteraction();
            }}
            size="small"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              position: "absolute",
              top: "50%",
              insetInlineStart: 0,
              transform: "translateY(-50%)",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: 1,
              "&:hover": { bgcolor: "background.paper", borderColor: "primary.main" },
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={lang === "en" ? "Next testimonial" : "עדות הבאה"}
            onClick={() => {
              pauseAutoPlay();
              goTo(index + 1);
              resumeAfterInteraction();
            }}
            size="small"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              position: "absolute",
              top: "50%",
              insetInlineEnd: 0,
              transform: "translateY(-50%)",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: 1,
              "&:hover": { bgcolor: "background.paper", borderColor: "primary.main" },
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>

          <Box
            sx={{
              mt: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", gap: 0.75 }}>
              {ambassadors.map((ambassador, i) => (
                <Box
                  key={ambassador.id}
                  component="button"
                  type="button"
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => {
                    pauseAutoPlay();
                    setIndex(i);
                    resumeAfterInteraction();
                  }}
                  sx={{
                    flexShrink: 0,
                    width: i === index ? 22 : 8,
                    height: 8,
                    p: 0,
                    border: "none",
                    borderRadius: 999,
                    bgcolor: i === index ? "primary.main" : "action.selected",
                    cursor: "pointer",
                    transition: "width 0.25s ease, background-color 0.25s ease",
                  }}
                />
              ))}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontVariantNumeric: "tabular-nums", minWidth: 40 }}
              aria-hidden
            >
              {index + 1}/{count}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
