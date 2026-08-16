import { Box, Button, Stack, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { track } from "../lib/analytics";
import { SITE, waLink } from "../lib/site";

const SHARE_LINES = ["אני בוחר/ת לדבר בכבוד.", "השינוי מתחיל בי.", "לשון הרע לא מדבר אליי"];

type Props = { firstName: string };

export function ShareCard({ firstName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ED1B24";
    ctx.fillRect(0, 0, w, 16);
    ctx.fillRect(0, h - 16, w, 16);

    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 36px Heebo, Arial, sans-serif";
    ctx.fillText(firstName.trim() || "אני", w / 2, 220);
    ctx.font = "700 48px Heebo, Arial, sans-serif";
    let y = 340;
    for (const line of SHARE_LINES) {
      ctx.fillText(line, w / 2, y);
      y += 72;
    }
    ctx.font = "400 28px Heebo, Arial, sans-serif";
    ctx.fillStyle = "#ED1B24";
    ctx.fillText(SITE.name, w / 2, h - 80);

    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.onload = () => {
      const lw = 280;
      const lh = (logo.height / logo.width) * lw;
      ctx.drawImage(logo, (w - lw) / 2, 60, lw, lh);
    };
    logo.src = SITE.logoSrc;
  }, [firstName]);

  const shareText = `${firstName} התחייב/ה: ${SHARE_LINES.join(" ")} ${SITE.name}`;

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    track("commitment_share_clicked", { channel: "download" });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "lashon-hara-commitment.png";
    a.click();
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 420 }}>
      <Typography variant="h2">התחייבת. עכשיו גם אתה חלק מהשינוי.</Typography>
      <Box
        component="canvas"
        ref={canvasRef}
        width={1080}
        height={1080}
        sx={{ width: "100%", height: "auto", borderRadius: 2, bgcolor: "#111" }}
        aria-label="כרטיס שיתוף"
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant="contained" onClick={download}>
          הורדת הכרטיס
        </Button>
        <Button
          variant="outlined"
          href={waLink(shareText)}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("commitment_share_clicked", { channel: "whatsapp" })}
        >
          שיתוף ב-WhatsApp
        </Button>
      </Stack>
    </Stack>
  );
}
