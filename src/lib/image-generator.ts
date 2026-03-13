import { createCanvas, loadImage } from 'canvas';

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = String(text).split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = (line ? line + ' ' : '') + w;
    const width = ctx.measureText(test).width;
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export interface GenerateOgImageOptions {
  title?: string;
  subtitle?: string;
  logoPath?: string;
  width?: number;
  height?: number;
  bg?: string;
}

export async function generateOgImage({
  title,
  subtitle,
  logoPath,
  width = 1200,
  height = 630,
  bg = '#111827',
}: GenerateOgImageOptions): Promise<Buffer> {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, '#1f2937');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  if (logoPath) {
    try {
      const img = await loadImage(logoPath);
      const lw = 140;
      const lh = (img.height / img.width) * lw;
      ctx.globalAlpha = 0.9;
      ctx.drawImage((img as unknown) as CanvasImageSource, 48, 40, lw, lh);
      ctx.globalAlpha = 1;
    } catch {}
  }

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 72px Sans';
  const maxWidth = width - 96;
  const lines = wrapText(ctx, title || 'TechPlay', maxWidth - 48);
  let y = 220;
  for (const line of lines.slice(0, 3)) {
    ctx.fillText(line, 48, y);
    y += 86;
  }

  if (subtitle) {
    ctx.font = '28px Sans';
    ctx.globalAlpha = 0.9;
    ctx.fillText(subtitle, 48, y + 12);
    ctx.globalAlpha = 1;
  }

  ctx.font = '24px Sans';
  ctx.globalAlpha = 0.8;
  ctx.fillText('techplay.fr', width - 220, height - 56);
  ctx.globalAlpha = 1;

  return canvas.toBuffer('image/png');
}

export default generateOgImage;
