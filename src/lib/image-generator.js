import { createCanvas, loadImage } from 'canvas';

export async function generateOgImage({ title }) {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, width, height);

  ctx.font = 'bold 60pt Sans';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, height / 2);

  return canvas.toBuffer('image/png');
}
