import { joinCommitmentUrl, SHARE_INVITE, SITE } from "./site";

export type ShareCardFormat = "story" | "square";

const RED = "#ED1B24";
const BG = "#111111";
const SHARE_LINES = ["אני בוחר/ת לדבר בכבוד.", "השינוי מתחיל בי."];

type DrawOptions = {
  firstName: string;
  signerNumber?: number;
  format: ShareCardFormat;
};

function drawBars(ctx: CanvasRenderingContext2D, w: number, h: number, barH: number) {
  ctx.fillStyle = RED;
  ctx.fillRect(0, 0, w, barH);
  ctx.fillRect(0, h - barH, w, barH);
}

function fontSizePx(font: string) {
  const match = font.match(/(\d+)px/);
  return match ? Number(match[1]) : 32;
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = words[0] ?? "";

  for (let i = 1; i < words.length; i += 1) {
    const next = `${line} ${words[i]}`;
    if (ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = words[i] ?? "";
    } else {
      line = next;
    }
  }
  lines.push(line);

  const lineHeight = fontSizePx(ctx.font) * 1.25;
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

async function drawQr(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, size: number) {
  const { default: QRCode } = await import("qrcode");
  const dataUrl = await QRCode.toDataURL(url, {
    width: size,
    margin: 1,
    color: { dark: "#111111", light: "#ffffff" },
  });
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("qr_load_failed"));
    img.src = dataUrl;
  });
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 8, y - 8, size + 16, size + 16);
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

export async function drawShareCard(canvas: HTMLCanvasElement, options: DrawOptions) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { firstName, signerNumber, format } = options;
  const w = canvas.width;
  const h = canvas.height;
  const joinUrl = joinCommitmentUrl();
  const name = firstName.trim() || "אני";
  const barH = format === "story" ? 24 : 16;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  drawBars(ctx, w, h, barH);

  ctx.direction = "rtl";
  ctx.textAlign = "center";

  try {
    const logo = await loadLogo();
    const lw = format === "story" ? 320 : 280;
    const lh = (logo.height / logo.width) * lw;
    const logoY = format === "story" ? 72 : 60;
    ctx.drawImage(logo, (w - lw) / 2, logoY, lw, lh);
  } catch {
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 40px Heebo, Arial, sans-serif";
    ctx.fillText(SITE.name, w / 2, format === "story" ? 160 : 120);
  }

  if (format === "story") {
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(w / 2, 420, 88, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 52px Heebo, Arial, sans-serif";
    ctx.fillText("חתמת!", w / 2, 438);

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 56px Heebo, Arial, sans-serif";
    ctx.fillText(name, w / 2, 580);

    ctx.font = "800 64px Heebo, Arial, sans-serif";
    drawCenteredText(ctx, SITE.name, w / 2, 760, w - 120);

    ctx.font = "500 40px Heebo, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    let y = 920;
    for (const line of SHARE_LINES) {
      ctx.fillText(line, w / 2, y);
      y += 56;
    }

    ctx.fillStyle = RED;
    ctx.font = "700 44px Heebo, Arial, sans-serif";
    ctx.fillText(SHARE_INVITE, w / 2, 1080);

    if (signerNumber != null) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "400 32px Heebo, Arial, sans-serif";
      ctx.fillText(`את/ה החותם/ת #${signerNumber.toLocaleString("he-IL")}`, w / 2, 1160);
    }

    const qrSize = 200;
    const qrY = h - barH - qrSize - 120;
    await drawQr(ctx, joinUrl, (w - qrSize) / 2, qrY, qrSize);

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "400 28px Heebo, Arial, sans-serif";
    ctx.fillText("lashonhara.co.il/join", w / 2, qrY + qrSize + 48);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 36px Heebo, Arial, sans-serif";
    ctx.fillText(name, w / 2, 220);
    ctx.font = "700 48px Heebo, Arial, sans-serif";
    let y = 340;
    for (const line of [...SHARE_LINES, SITE.name]) {
      ctx.fillText(line, w / 2, y);
      y += 72;
    }

    ctx.font = "700 36px Heebo, Arial, sans-serif";
    ctx.fillStyle = RED;
    ctx.fillText(SHARE_INVITE, w / 2, y + 24);

    if (signerNumber != null) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "400 28px Heebo, Arial, sans-serif";
      ctx.fillText(`#${signerNumber.toLocaleString("he-IL")}`, w / 2, y + 88);
    }

    const qrSize = 160;
    const qrX = w / 2 - qrSize / 2;
    const qrY = h - barH - qrSize - 56;
    await drawQr(ctx, joinUrl, qrX, qrY, qrSize);

    ctx.fillStyle = RED;
    ctx.font = "400 28px Heebo, Arial, sans-serif";
    ctx.fillText(SITE.name, w / 2, h - 36);
  }
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
