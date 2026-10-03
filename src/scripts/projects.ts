// Generated dot-matrix visuals for project cards without media; they animate while hovered.
import { css } from "./palette";

type Field = (x: number, y: number, w: number, h: number, t: number) => number;

const fields: Record<string, Field> = {
  bars: (x, y, _w, h, t) => {
    const col = Math.floor(x / 14), hh = h * (0.25 + 0.5 * (0.5 + 0.5 * Math.sin(col * 0.9 + t * 1.2) * Math.cos(col * 0.37 - t * 0.5)));
    return x % 14 < 10 ? (h - y < hh ? (h - y > hh - 6 ? 1 : 0.6) : 0.05) : 0;
  },
  nodes: (x, y, w, h, t) => {
    let v = 0.04;
    for (let k = 0; k < 5; k++) {
      const cx = w * (0.15 + 0.7 * (0.5 + 0.5 * Math.sin(k * 2.1 + t * 0.6))), cy = h * (0.2 + 0.6 * (0.5 + 0.5 * Math.cos(k * 1.3 + t * 0.45)));
      v = Math.max(v, Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (h * h * 0.012)));
    }
    return v;
  },
  routes: (x, y, _w, h, t) => {
    let v = 0.04;
    for (let k = 0; k < 3; k++) {
      const yk = h * (0.28 + 0.22 * k) + Math.sin(x * 0.018 + t + k * 1.7) * h * 0.13;
      v = Math.max(v, Math.exp(-(((y - yk) / 5) ** 2)));
    }
    return v;
  },
  waves: (x, y, w, h, t) => {
    const d1 = Math.hypot(x - w * 0.3, y - h * 0.5), d2 = Math.hypot(x - w * 0.72, y - h * 0.45);
    return Math.max(0, (Math.sin(d1 * 0.09 - t * 2) + Math.sin(d2 * 0.09 - t * 2)) / 4 + 0.5) ** 2;
  },
  grid: (x, y, w, _h, t) => {
    // table rows filling in, like records landing in a database
    const row = Math.floor(y / 12), colW = w / 5, col = Math.floor(x / colW);
    if (y % 12 > 8 || x % colW < 6) return 0;
    const fill = (Math.sin(row * 1.7 + col * 2.3) * 0.5 + 0.5) * colW * 0.9;
    const active = (Math.floor(t * 3) % 9) === row % 9;
    return x % colW < fill ? (active && col === 0 ? 1 : 0.35 + 0.25 * ((row + col) % 2)) : 0.05;
  },
  rings: (x, y, w, h, t) => {
    const d = Math.hypot(x - w * 0.5, y - h * 0.5), ring = Math.sin(d * 0.11 - t * 1.6);
    const spokes = Math.abs(Math.sin(Math.atan2(y - h * 0.5, x - w * 0.5) * 3 + t * 0.4));
    return Math.max(0.04, ring > 0.86 ? 0.8 : 0, d < 14 ? 1 : 0, spokes > 0.985 && d < h * 0.45 ? 0.55 : 0);
  },
};

function draw(cv: HTMLCanvasElement, t: number) {
  const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2);
  if (!r.width) return;
  if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
  const ctx = cv.getContext("2d")!, cell = 6, w = r.width, h = r.height, fg = css("--fg"), acc = css("--accent");
  const field = fields[cv.dataset.visual || "waves"];
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  for (let y = cell / 2; y < h; y += cell) for (let x = cell / 2; x < w; x += cell) {
    const v = field(x, y, w, h, t);
    if (v < 0.03) continue;
    const s = Math.max(1, v * (cell - 1.5));
    ctx.fillStyle = v > 0.96 ? acc : fg;
    ctx.globalAlpha = v > 0.96 ? 1 : 0.25 + v * 0.6;
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
}

const canvases = [...document.querySelectorAll<HTMLCanvasElement>("canvas[data-visual]")];
const drawAll = () => canvases.forEach((c) => draw(c, 0));
drawAll();
addEventListener("resize", drawAll);
addEventListener("palettechange", drawAll);
canvases.forEach((cv) => {
  const card = cv.closest(".proj");
  let raf = 0, t0 = 0;
  const loop = (now: number) => { draw(cv, (now - t0) / 1000); raf = requestAnimationFrame(loop); };
  card?.addEventListener("mouseenter", () => { t0 = performance.now(); raf = requestAnimationFrame(loop); });
  card?.addEventListener("mouseleave", () => { cancelAnimationFrame(raf); draw(cv, 0); });
});
