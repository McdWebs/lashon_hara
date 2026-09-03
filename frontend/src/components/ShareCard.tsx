import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { track } from "../lib/analytics";
import {
  canvasToBlob,
  downloadCanvas,
  drawShareCard,
  shareCardText,
} from "../lib/shareCardCanvas";

type Props = {
  firstName: string;
  signerNumber?: number;
};

const STORY = {
  w: 1080,
  h: 1920,
  filename: "lashon-hara-commitment-story.png",
} as const;

export function ShareCard({ firstName, signerNumber }: Props) {
  const [ready, setReady] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintTimer = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setReady(false);
    canvas.width = STORY.w;
    canvas.height = STORY.h;

    let cancelled = false;
    drawShareCard(canvas, { firstName, signerNumber, format: "story" })
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [firstName, signerNumber]);

  useEffect(() => {
    return () => {
      if (hintTimer.current != null) window.clearTimeout(hintTimer.current);
    };
  }, []);

  function showHint(message: string, ms = 6000) {
    if (hintTimer.current != null) window.clearTimeout(hintTimer.current);
    setShareHint(message);
    hintTimer.current = window.setTimeout(() => setShareHint(null), ms);
  }

  function download(channel: "download" | "share_fallback" = "download") {
    const canvas = canvasRef.current;
    if (!canvas) return;
    track("commitment_share_clicked", { channel, format: "story" });
    downloadCanvas(canvas, STORY.filename);
  }

  async function shareImage() {
    const canvas = canvasRef.current;
    if (!canvas || !ready || busy) return;

    setBusy(true);
    try {
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], STORY.filename, { type: "image/png" });
      const text = shareCardText();
      const title = "לשון הרע לא מדבר אליי";

      if (typeof navigator.share === "function") {
        const sharePayloads: ShareData[] = [
          { files: [file], text, title },
          { files: [file], title },
          { files: [file] },
          { text, title },
        ];

        for (const payload of sharePayloads) {
          if (navigator.canShare?.(payload) === false) continue;

          try {
            track("commitment_share_clicked", {
              channel: "native",
              format: "story",
              withFiles: Boolean(payload.files?.length),
            });
            await navigator.share(payload);
            showHint("אם בחרתם Instagram — פתחו סטורי והדביקו/הוסיפו את התמונה.", 5000);
            return;
          } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") return;
          }
        }
      }

      download("share_fallback");
      showHint(
        "הורדנו את הכרטיס. WhatsApp: שלחו את הקובץ לצ'אט. Instagram: הוסיפו לסטורי מהגלריה.",
        8000,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      sx={{
        height: "100%",
        p: { xs: 2.5, md: 3 },
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2} sx={{ height: "100%" }}>
        <Box>
          <Typography
            sx={{
              fontFamily: '"Secular One", Heebo, sans-serif',
              fontSize: { xs: "1.15rem", md: "1.3rem" },
              lineHeight: 1.25,
            }}
          >
            כרטיס לסטורי
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 1.5, md: 2 },
            borderRadius: 2,
            bgcolor: "#F4F1EA",
            backgroundImage:
              "radial-gradient(circle at 50% 0%, rgba(237,27,36,0.10) 0%, transparent 55%)",
            minHeight: { xs: 360, md: 420 },
          }}
        >
          <Box
            component="canvas"
            ref={canvasRef}
            width={STORY.w}
            height={STORY.h}
            sx={{
              width: "100%",
              maxWidth: { xs: 300, md: 340 },
              height: "auto",
              borderRadius: 1.5,
              opacity: ready ? 1 : 0.35,
              transition: "opacity 0.2s ease",
              boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
            }}
            aria-label="כרטיס שיתוף לסטורי"
          />
        </Box>

        {shareHint ? (
          <Typography
            sx={{
              fontSize: "0.82rem",
              textAlign: "center",
              color: "primary.main",
              fontWeight: 700,
              lineHeight: 1.55,
            }}
          >
            {shareHint}
          </Typography>
        ) : null}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button
            variant="contained"
            startIcon={<ShareOutlinedIcon />}
            onClick={() => void shareImage()}
            fullWidth
            disabled={!ready || busy}
          >
            {busy ? "פותחים שיתוף..." : "שיתוף"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadOutlinedIcon />}
            onClick={() => download("download")}
            fullWidth
            disabled={!ready || busy}
          >
            הורדה
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
