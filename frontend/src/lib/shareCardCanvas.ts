import { joinCommitmentUrl, SHARE_INVITE, SITE } from "./site";

export type ShareCardFormat = "story" | "square";

const RED = "#ED1B24";
const INK = "#111111";
const CREAM = "#F4F1EA";
const PAPER = "#FFFCF7";
const MUTED = "rgba(17,17,17,0.62)";
const SHARE_LINES = ["אני בוחר/ת לדבר בכבוד.", "השינוי מתחיל בי."];

type DrawOptions = {
  firstName: string;
  signerNumber?: number;
  format: ShareCardFormat;
};

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();
}

function drawChip(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  fill: string,
  color: string,
  fontSize = 32,
) {
  ctx.save();
  ctx.font = `600 ${fontSize}px Heebo, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const padX = 30;
  const h = fontSize + 30;
  const w = ctx.measureText(text).width + padX * 2;
  ctx.fillStyle = fill;
  fillRoundRect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fillStyle = color;
  ctx.fillText(text, cx, cy + 1);
  ctx.restore();
}

async function waitForFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load('400 120px "Secular One"'),
      document.fonts.load("500 36px Heebo"),
      document.fonts.load("600 32px Heebo"),
      document.fonts.load("700 48px Heebo"),
      document.fonts.ready,
    ]);
  } catch {
    /* draw with fallbacks */
  }
}

async function drawQr(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, size: number) {
  const { default: QRCode } = await import("qrcode");
  const dataUrl = await QRCode.toDataURL(url, {
    width: size * 2,
    margin: 1,
    color: { dark: INK, light: "#ffffff" },
  });
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("qr_load_failed"));
    img.src = dataUrl;
  });
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(17,17,17,0.12)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  fillRoundRect(ctx, x - 18, y - 18, size + 36, size + 36, 28);
  ctx.restore();
  ctx.strokeStyle = "rgba(17,17,17,0.08)";
  ctx.lineWidth = 2;
  strokeRoundRect(ctx, x - 18, y - 18, size + 36, size + 36, 28);
  ctx.drawImage(img, x, y, size, size);
}

function loadLogo(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.onload = () => resolve(logo);
    logo.onerror = () => reject(new Error("logo_load_failed"));
    logo.src = SITE.logoSrc;
  });
}

function drawPaper(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, PAPER);
  gradient.addColorStop(0.45, CREAM);
  gradient.addColorStop(1, "#EFE8DA");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.18, 40, w * 0.5, h * 0.18, w * 0.72);
  glow.addColorStop(0, "rgba(237,27,36,0.10)");
  glow.addColorStop(1, "rgba(237,27,36,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = RED;
  ctx.fillRect(0, 0, w, 14);
}

function drawRules(ctx: CanvasRenderingContext2D, cx: number, y: number, label: string) {
  ctx.save();
  ctx.font = "700 34px Heebo, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = RED;
  ctx.fillText(label, cx, y);
  const labelW = ctx.measureText(label).width;
  ctx.strokeStyle = RED;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - labelW / 2 - 180, y);
  ctx.lineTo(cx - labelW / 2 - 28, y);
  ctx.moveTo(cx + labelW / 2 + 28, y);
  ctx.lineTo(cx + labelW / 2 + 180, y);
  ctx.stroke();
  ctx.restore();
}

export async function drawShareCard(canvas: HTMLCanvasElement, options: DrawOptions) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  await waitForFonts();

  const { firstName, signerNumber, format } = options;
  const w = canvas.width;
  const h = canvas.height;
  const joinUrl = joinCommitmentUrl();
  const name = firstName.trim() || "אני";
  const cx = w / 2;
  const story = format === "story";

  ctx.clearRect(0, 0, w, h);
  drawPaper(ctx, w, h);

  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  let y = story ? 240 : 72;

  try {
    const logo = await loadLogo();
    const lw = story ? 980 : 780;
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, (w - lw) / 2, y, lw, lh);
    y += lh + (story ? 80 : 48);
  } catch {
    ctx.fillStyle = INK;
    ctx.font = '400 52px "Secular One", Heebo, sans-serif';
    ctx.fillText(SITE.name, cx, y + 48);
    y += 108;
  }

  drawRules(ctx, cx, y, "חתמתי");
  y += story ? 110 : 80;

  ctx.fillStyle = INK;
  let nameSize = story ? 118 : 80;
  ctx.font = `400 ${nameSize}px "Secular One", Heebo, sans-serif`;
  while (ctx.measureText(name).width > w - 120 && nameSize > 56) {
    nameSize -= 4;
    ctx.font = `400 ${nameSize}px "Secular One", Heebo, sans-serif`;
  }
  ctx.fillText(name, cx, y);
  y += nameSize + (story ? 40 : 26);

  if (signerNumber != null) {
    drawChip(
      ctx,
      `חותם/ת #${signerNumber.toLocaleString("he-IL")}`,
      cx,
      y,
      "rgba(237,27,36,0.12)",
      RED,
      story ? 34 : 28,
    );
    y += story ? 108 : 80;
  } else {
    y += story ? 36 : 16;
  }

  ctx.fillStyle = MUTED;
  ctx.font = story ? "500 44px Heebo, Arial, sans-serif" : "500 32px Heebo, Arial, sans-serif";
  for (const line of SHARE_LINES) {
    ctx.fillText(line, cx, y);
    y += story ? 62 : 46;
  }

  y += story ? 40 : 20;
  ctx.save();
  ctx.font = story ? "700 42px Heebo, Arial, sans-serif" : "700 30px Heebo, Arial, sans-serif";
  const cta = SHARE_INVITE;
  const ctaH = story ? 92 : 68;
  const ctaW = Math.min(w - 120, ctx.measureText(cta).width + 88);
  ctx.fillStyle = RED;
  fillRoundRect(ctx, cx - ctaW / 2, y, ctaW, ctaH, ctaH / 2);
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(cta, cx, y + ctaH / 2 + 1);
  ctx.restore();

  const qrSize = story ? 236 : 168;
  const qrLabelGap = 56;
  const qrY = h - 64 - qrLabelGap - qrSize;
  await drawQr(ctx, joinUrl, cx - qrSize / 2, qrY, qrSize);

  ctx.fillStyle = INK;
  ctx.font = story ? "600 32px Heebo, Arial, sans-serif" : "600 26px Heebo, Arial, sans-serif";
  ctx.fillText("סריקה להצטרפות", cx, qrY + qrSize + qrLabelGap);

  ctx.fillStyle = INK;
  ctx.fillRect(0, h - 18, w, 18);
  ctx.fillStyle = RED;
  ctx.fillRect(0, h - 18, w, 6);
}

export function shareCardText() {
  return `${SHARE_INVITE}\n${SITE.name}\n${joinCommitmentUrl()}`;
}

export async function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvas_blob_failed"));
    }, "image/png");
  });
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = filename;
  a.click();
}
