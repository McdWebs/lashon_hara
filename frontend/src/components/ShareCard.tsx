import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { track } from "../lib/analytics";
import {
  canvasToBlob,
  downloadCanvas,
  drawShareCard,
  shareCardText,
  type ShareCardFormat,
} from "../lib/shareCardCanvas";
import { waLink } from "../lib/site";

type Props = {
  firstName: string;
  signerNumber?: number;
};

const FORMATS: { key: ShareCardFormat; label: string; w: number; h: number; filename: string }[] = [
  { key: "story", label: "סטורי (9:16)", w: 1080, h: 1920, filename: "lashon-hara-commitment-story.png" },
  { key: "square", label: "ריבוע (1:1)", w: 1080, h: 1080, filename: "lashon-hara-commitment.png" },
];

export function ShareCard({ firstName, signerNumber }: Props) {
  const [format, setFormat] = useState<ShareCardFormat>("story");
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spec = FORMATS.find((f) => f.key === format) ?? FORMATS[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setReady(false);
    canvas.width = spec.w;
    canvas.height = spec.h;

    let cancelled = false;
    drawShareCard(canvas, { firstName, signerNumber, format })
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [firstName, signerNumber, format, spec.w, spec.h]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    track("commitment_share_clicked", { channel: "download", format });
    downloadCanvas(canvas, spec.filename);
  }

  function shareWhatsApp() {
    track("commitment_share_clicked", { channel: "whatsapp", format });
    window.open(waLink(shareCardText()), "_blank", "noopener,noreferrer");
  }

  async function shareNative() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    track("commitment_share_clicked", { channel: "native", format });

    const text = shareCardText();
    if (!navigator.share) {
      shareWhatsApp();
      return;
    }

    try {
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], spec.filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: "לשון הרע לא מדבר אליי" });
        return;
      }
      await navigator.share({ text, title: "לשון הרע לא מדבר אליי" });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      shareWhatsApp();
    }
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 420, mx: "auto" }}>
      <Stack direction="row" spacing={1}>
        {FORMATS.map((f) => (
          <Button
            key={f.key}
            size="small"
            variant={format === f.key ? "contained" : "outlined"}
            onClick={() => setFormat(f.key)}
            sx={{ flex: 1 }}
          >
            {f.label}
          </Button>
        ))}
      </Stack>

      <Box
        component="canvas"
        ref={canvasRef}
        width={spec.w}
        height={spec.h}
        sx={{
          width: "100%",
          height: "auto",
          borderRadius: 2,
          bgcolor: "#111",
          opacity: ready ? 1 : 0.4,
          transition: "opacity 0.2s ease",
          maxHeight: format === "story" ? 560 : 420,
          objectFit: "contain",
        }}
        aria-label="כרטיס שיתוף"
      />

      <Typography color="text.secondary" sx={{ fontSize: "0.85rem", textAlign: "center" }}>
        גם אני חתמתי. גם את/ה? — סרקו את הקוד או שלחו לחבר/ה.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant="contained" startIcon={<WhatsAppIcon />} onClick={shareWhatsApp} fullWidth>
          WhatsApp
        </Button>
        <Button variant="outlined" startIcon={<ShareOutlinedIcon />} onClick={shareNative} fullWidth>
          שיתוף
        </Button>
        <Button variant="outlined" onClick={download} fullWidth>
          הורדה
        </Button>
      </Stack>
    </Stack>
  );
}
