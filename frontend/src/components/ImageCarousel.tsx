import { Box, IconButton, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useCallback, useEffect, useRef, useState } from "react";

export type CarouselSlide = {
  src: string;
  alt: string;
};

type ImageCarouselProps = {
  slides: CarouselSlide[];
  height?: number;
  autoPlayMs?: number;
};

const SWIPE_THRESHOLD = 48;
const DEFAULT_AUTO_PLAY_MS = 4000;

export function ImageCarousel({ slides, height = 240, autoPlayMs = DEFAULT_AUTO_PLAY_MS }: ImageCarouselProps) {
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const count = slides.length;
  const slideShare = count > 0 ? 100 / count : 100;

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
    window.setTimeout(resumeAutoPlay, autoPlayMs);
  };

  if (count === 0) return null;

  return (
    <Box
      sx={{ position: "relative", userSelect: "none" }}
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
      onFocus={pauseAutoPlay}
      onBlur={resumeAutoPlay}
    >
      <Box
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        sx={{
          overflow: "hidden",
          borderRadius: 1,
          touchAction: "pan-y",
          bgcolor: "rgba(255,255,255,0.06)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: `${count * 100}%`,
            transform: `translateX(-${index * slideShare}%)`,
            transition: "transform 0.45s ease",
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
            },
          }}
        >
          {slides.map((slide) => (
            <Box
              key={slide.src}
              sx={{
                width: `${slideShare}%`,
                flexShrink: 0,
                height,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src={slide.src}
                alt=""
                aria-hidden
                draggable={false}
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "blur(16px) brightness(0.92)",
                  transform: "scale(1.08)",
                  pointerEvents: "none",
                }}
              />
              <Box
                component="img"
                src={slide.src}
                alt={slide.alt}
                draggable={false}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {count > 1 && (
        <>
          <IconButton
            aria-label="Previous slide"
            onClick={() => {
              pauseAutoPlay();
              goTo(index - 1);
              window.setTimeout(resumeAutoPlay, autoPlayMs);
            }}
            size="small"
            sx={{
              position: "absolute",
              top: "50%",
              insetInlineStart: 8,
              transform: "translateY(-50%)",
              bgcolor: "rgba(17,17,17,0.45)",
              color: "#fff",
              "&:hover": { bgcolor: "rgba(17,17,17,0.65)" },
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="Next slide"
            onClick={() => {
              pauseAutoPlay();
              goTo(index + 1);
              window.setTimeout(resumeAutoPlay, autoPlayMs);
            }}
            size="small"
            sx={{
              position: "absolute",
              top: "50%",
              insetInlineEnd: 8,
              transform: "translateY(-50%)",
              bgcolor: "rgba(17,17,17,0.45)",
              color: "#fff",
              "&:hover": { bgcolor: "rgba(17,17,17,0.65)" },
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>

          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 0.5,
              maxWidth: "90%",
              overflowX: "auto",
              px: 0.5,
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}
          >
            {slides.map((slide, i) => (
              <Box
                key={slide.src}
                component="button"
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => {
                  pauseAutoPlay();
                  setIndex(i);
                  window.setTimeout(resumeAutoPlay, autoPlayMs);
                }}
                sx={{
                  flexShrink: 0,
                  width: i === index ? 14 : 6,
                  height: 6,
                  p: 0,
                  border: "none",
                  borderRadius: 999,
                  bgcolor: i === index ? "primary.main" : "rgba(255,255,255,0.55)",
                  cursor: "pointer",
                  transition: "width 0.2s ease, background-color 0.2s ease",
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
