import AccessibleIcon from "@mui/icons-material/Accessible";
import CloseIcon from "@mui/icons-material/Close";
import ContrastIcon from "@mui/icons-material/Contrast";
import LinkIcon from "@mui/icons-material/Link";
import MotionPhotosOffIcon from "@mui/icons-material/MotionPhotosOff";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TextDecreaseIcon from "@mui/icons-material/TextDecrease";
import TextIncreaseIcon from "@mui/icons-material/TextIncrease";
import { Box, Button, IconButton, Popover, Stack, ToggleButton, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "../i18n/useLocale";

const STORAGE_KEY = "lh-a11y-prefs";
const ZOOM_STEPS = [1, 1.125, 1.25, 1.375, 1.5];

type Prefs = {
  zoomIndex: number;
  contrast: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
};

const defaultPrefs: Prefs = { zoomIndex: 0, contrast: false, underlineLinks: false, reduceMotion: false };

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPrefs;
    return { ...defaultPrefs, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    return defaultPrefs;
  }
}

function applyPrefs(prefs: Prefs) {
  const root = document.documentElement;
  root.style.setProperty("--a11y-zoom", String(ZOOM_STEPS[prefs.zoomIndex] ?? 1));
  root.classList.toggle("a11y-contrast", prefs.contrast);
  root.classList.toggle("a11y-underline-links", prefs.underlineLinks);
  root.classList.toggle("a11y-reduce-motion", prefs.reduceMotion);
}

export function AccessibilityWidget() {
  const { t } = useLocale();
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const initial = readPrefs();
    setPrefs(initial);
    applyPrefs(initial);
  }, []);

  function update(next: Partial<Prefs>) {
    setPrefs((prev) => {
      const merged = { ...prev, ...next };
      applyPrefs(merged);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        /* ignore */
      }
      return merged;
    });
  }

  function reset() {
    update(defaultPrefs);
  }

  const open = Boolean(anchorEl);

  return (
    <>
      <style>{`
        .a11y-zoom-scope { zoom: var(--a11y-zoom, 1); }
        html.a11y-underline-links a { text-decoration: underline !important; }
        html.a11y-reduce-motion, html.a11y-reduce-motion * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
        html.a11y-contrast { filter: invert(1) hue-rotate(180deg); }
        html.a11y-contrast img, html.a11y-contrast video, html.a11y-contrast picture { filter: invert(1) hue-rotate(180deg); }
      `}</style>
      <IconButton
        ref={buttonRef}
        onClick={() => setAnchorEl(buttonRef.current)}
        aria-label={t("a11yMenuLabel")}
        sx={{
          position: "fixed",
          insetBlockEnd: { xs: 88, sm: 16 },
          insetInlineStart: 16,
          zIndex: 1300,
          bgcolor: "#111",
          color: "#fff",
          width: 48,
          height: 48,
          boxShadow: "0 4px 16px rgba(0,0,0,.28)",
          "&:hover": { bgcolor: "#111", opacity: 0.9 },
        }}
      >
        <AccessibleIcon />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        disableScrollLock
      >
        <Box sx={{ p: 2.5, width: 280 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{t("a11yTitle")}</Typography>
            <IconButton size="small" onClick={() => setAnchorEl(null)} aria-label={t("a11yClose")}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.75 }}>{t("a11yFontSize")}</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <IconButton
              size="small"
              onClick={() => update({ zoomIndex: Math.max(0, prefs.zoomIndex - 1) })}
              disabled={prefs.zoomIndex <= 0}
              aria-label={t("a11yDecrease")}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <TextDecreaseIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => update({ zoomIndex: Math.min(ZOOM_STEPS.length - 1, prefs.zoomIndex + 1) })}
              disabled={prefs.zoomIndex >= ZOOM_STEPS.length - 1}
              aria-label={t("a11yIncrease")}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <TextIncreaseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack spacing={1}>
            <ToggleButton
              value="contrast"
              selected={prefs.contrast}
              onChange={() => update({ contrast: !prefs.contrast })}
              size="small"
              sx={{ justifyContent: "flex-start", gap: 1, textTransform: "none" }}
            >
              <ContrastIcon fontSize="small" />
              {t("a11yContrast")}
            </ToggleButton>
            <ToggleButton
              value="underline"
              selected={prefs.underlineLinks}
              onChange={() => update({ underlineLinks: !prefs.underlineLinks })}
              size="small"
              sx={{ justifyContent: "flex-start", gap: 1, textTransform: "none" }}
            >
              <LinkIcon fontSize="small" />
              {t("a11yUnderlineLinks")}
            </ToggleButton>
            <ToggleButton
              value="motion"
              selected={prefs.reduceMotion}
              onChange={() => update({ reduceMotion: !prefs.reduceMotion })}
              size="small"
              sx={{ justifyContent: "flex-start", gap: 1, textTransform: "none" }}
            >
              <MotionPhotosOffIcon fontSize="small" />
              {t("a11yReduceMotion")}
            </ToggleButton>
          </Stack>

          <Button
            onClick={reset}
            startIcon={<RestartAltIcon fontSize="small" />}
            fullWidth
            size="small"
            sx={{ mt: 2, color: "inherit", border: "1px solid", borderColor: "divider", textTransform: "none" }}
          >
            {t("a11yReset")}
          </Button>
        </Box>
      </Popover>
    </>
  );
}
