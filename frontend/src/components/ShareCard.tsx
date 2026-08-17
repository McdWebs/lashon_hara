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

const WHATSAPP_APP_URL = "https://wa.me/";

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
  const [shareHint, setShareHint] = useState<string | null>(null);
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

  async function shareWhatsApp() {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;

    track("commitment_share_clicked", { channel: "whatsapp", format });

    const text = shareCardText();

    try {
      const blob = await canvasToBlob(canvas);
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
      setShareHint("התמונה והטקסט הועתקו — בחרו צ'אט והדביקו");
    } catch {
      setShareHint("לא ניתן להעתיק מהדפדפן הזה. נסו מהטלפון.");
      window.setTimeout(() => setShareHint(null), 4000);
      return;
    }

    window.open(WHATSAPP_APP_URL, "_blank", "noopener,noreferrer");
    window.setTimeout(() => setShareHint(null), 5000);
  }

  async function shareImage() {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;

    if (!navigator.share) {
      setShareHint("שיתוף לא נתמך בדפדפן זה. נסו מהטלפון, או הורידו את התמונה.");
      window.setTimeout(() => setShareHint(null), 4000);
      return;
    }

    const blob = await canvasToBlob(canvas);
    const file = new File([blob], spec.filename, { type: "image/png" });
    const text = shareCardText();
    const title = "לשון הרע לא מדבר אליי";
    const sharePayloads: ShareData[] = [
      { files: [file], text, title },
      { files: [file], title },
      { files: [file] },
    ];

    for (const payload of sharePayloads) {
      if (navigator.canShare?.(payload) === false) continue;

      try {
        track("commitment_share_clicked", { channel: "native", format });
        await navigator.share(payload);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    setShareHint("לא ניתן לשתף את התמונה מהדפדפן הזה. נסו מהטלפון, או הורידו את התמונה.");
    window.setTimeout(() => setShareHint(null), 4000);
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
        {shareHint ?? "גם אני חתמתי. גם את/ה? — סרקו את הקוד או שלחו לחבר/ה."}
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant="contained" startIcon={<WhatsAppIcon />} onClick={shareWhatsApp} fullWidth>
          WhatsApp
        </Button>
        <Button variant="outlined" startIcon={<ShareOutlinedIcon />} onClick={shareImage} fullWidth>
          שיתוף
        </Button>
        <Button variant="outlined" onClick={download} fullWidth>
          הורדה
        </Button>
      </Stack>
    </Stack>
  );
}
