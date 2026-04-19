import type { MouseEvent as ReactMouseEvent } from 'react';

export function spawnRipple(e: ReactMouseEvent<HTMLElement>) {
  if (typeof window === 'undefined') return;

  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const size = Math.max(rect.width, rect.height);

  const span = document.createElement('span');
  span.style.cssText = `
    position:absolute;
    left:${x - size / 2}px;
    top:${y - size / 2}px;
    width:${size}px;
    height:${size}px;
    border-radius:9999px;
    pointer-events:none;
    background:rgba(255,255,255,0.35);
    mix-blend-mode:overlay;
  `;

  if (!target.style.position) target.style.position = 'relative';
  target.appendChild(span);

  span.animate(
    [
      { transform: 'scale(0.6)', opacity: 0.35 },
      { transform: 'scale(1.3)', opacity: 0 },
    ],
    { duration: 520, easing: 'ease-out' }
  ).onfinish = () => span.remove();
}

const dotPool: HTMLDivElement[] = [];
const DOT_POOL_SIZE = 4;

function acquireDot(): HTMLDivElement {
  return dotPool.pop() ?? document.createElement('div');
}

function releaseDot(dot: HTMLDivElement) {
  dot.style.cssText = '';
  dot.remove();
  if (dotPool.length < DOT_POOL_SIZE) dotPool.push(dot);
}

export function flyTo(source: HTMLElement, target: HTMLElement, prefersReduced: boolean) {
  if (typeof window === 'undefined') return;

  const dot = acquireDot();
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const startX = from.left + from.width / 2;
  const startY = from.top + from.height / 2;
  const endX = to.left + to.width / 2;
  const endY = to.top + to.height / 2;

  dot.style.cssText = `
    position:fixed;
    left:${startX}px;
    top:${startY}px;
    width:10px;
    height:10px;
    border-radius:9999px;
    background:hsl(var(--accent));
    box-shadow:0 0 0 6px rgba(20,184,166,0.15);
    z-index:999999;
    pointer-events:none;
  `;

  document.body.appendChild(dot);

  const duration = prefersReduced ? 200 : 650;
  const curveX = startX + (endX - startX) * 0.6;
  const curveY = Math.min(startY, endY) - 120;

  dot.animate(
    [
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0 },
      {
        transform: `translate(${curveX - startX}px, ${curveY - startY}px) scale(0.9)`,
        opacity: 0.95,
        offset: 0.6,
      },
      {
        transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.6)`,
        opacity: 0,
        offset: 1,
      },
    ],
    {
      duration,
      easing: prefersReduced ? 'linear' : 'cubic-bezier(.2,.8,.2,1)',
    }
  ).onfinish = () => releaseDot(dot);
}
