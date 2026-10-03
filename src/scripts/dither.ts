// About portrait: a 1-bit ordered dither that resolves into the photo cell by cell,
// spreading from the cursor in Bayer order, with an accent scan line on the moving edge.
import { css, root, reduceMotion } from "./palette";
import { BAYER, ditherTone } from "./tone";

const BAND = 0.05, IN_MS = 950, OUT_MS = 700;
const box = document.getElementById("dither");
const cv = document.getElementById("ditherCanvas") as HTMLCanvasElement | null;
const cap = document.getElementById("ditherCap");
const hint = document.getElementById("ditherHint");

if (box && cv && cap && hint) {
  const ditherImg = new Image(), photoImg = new Image();
  const touchOnly = matchMedia("(hover: none)").matches;
  const layer = (w: number, h: number) => Object.assign(document.createElement("canvas"), { width: w, height: h });
  const cover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) => {
    const s = Math.max(W / img.width, H / img.height), w = img.width * s, h = img.height * s;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  };

  let W = 0, H = 0, cell = 0, cols = 0, rows = 0, accent = "";
  let dith: HTMLCanvasElement, photo: HTMLCanvasElement, mask: HTMLCanvasElement, comp: HTMLCanvasElement;
  let mctx: CanvasRenderingContext2D, mdata: ImageData, on: Uint8Array, thr: Float32Array;
  let ready = false, raw = 0, p = 0, dir = 0, last = 0, raf = 0, ox = 0.5, oy = 0.3;

  function build() {
    const r = cv!.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2);
    if (!ditherImg.naturalWidth || !r.width) return;
    W = cv!.width = Math.round(r.width * dpr);
    H = cv!.height = Math.round(r.height * dpr);
    cell = 3 * dpr; cols = Math.ceil(W / cell); rows = Math.ceil(H / cell);
    const o = layer(cols, rows).getContext("2d", { willReadFrequently: true })!;
    cover(o, ditherImg, cols, rows);
    const d = o.getImageData(0, 0, cols, rows).data, light = root.dataset.theme === "light";
    dith = layer(W, H);
    const dc = dith.getContext("2d")!;
    dc.fillStyle = css("--fg");
    on = new Uint8Array(cols * rows);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (ditherTone(d[i * 4], d[i * 4 + 1], d[i * 4 + 2], d[i * 4 + 3], y / rows, light) > BAYER[(y % 4) * 4 + (x % 4)]) {
        on[i] = 1;
        dc.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    photo = layer(W, H);
    if (photoImg.naturalWidth) cover(photo.getContext("2d")!, photoImg, W, H);
    mask = layer(cols, rows); mctx = mask.getContext("2d")!; mdata = mctx.createImageData(cols, rows);
    comp = layer(W, H);
    accent = css("--accent");
    ready = true;
    setOrigin(ox, oy);
    render();
  }

  function setOrigin(x: number, y: number) {
    ox = x; oy = y;
    if (!ready) return;
    thr = new Float32Array(cols * rows);
    const max = Math.max(...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([cx, cy]) => Math.hypot((cx - x) * cols, (cy - y) * rows)));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
      thr[r * cols + c] = (Math.hypot(c - x * cols, r - y * rows) / max) * 0.9 + BAYER[(r % 4) * 4 + (c % 4)] * 0.1;
  }

  function render() {
    if (!ready) return;
    const ctx = cv!.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, W, H);
    if (p <= 0) return void ctx.drawImage(dith, 0, 0);
    if (p >= 1 + BAND) return void ctx.drawImage(photo, 0, 0);
    const md = mdata.data, edge: number[] = [];
    for (let i = 0, n = cols * rows; i < n; i++) {
      const t = thr[i];
      md[i * 4 + 3] = t < p - BAND ? 255 : 0;
      if (t >= p - BAND && t < p - BAND * 0.45 && on[i]) edge.push(i);
    }
    mctx.putImageData(mdata, 0, 0);
    const cc = comp.getContext("2d")!;
    cc.globalCompositeOperation = "source-over";
    cc.clearRect(0, 0, W, H);
    cc.imageSmoothingEnabled = false;
    cc.drawImage(mask, 0, 0, W, H);
    cc.globalCompositeOperation = "source-in";
    cc.drawImage(photo, 0, 0);
    ctx.drawImage(dith, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(mask, 0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(comp, 0, 0);
    ctx.fillStyle = accent;
    for (const i of edge) ctx.fillRect((i % cols) * cell, ((i / cols) | 0) * cell, cell, cell);
  }

  function caption(revealed: boolean) {
    cap!.innerHTML = revealed ? "fig. 02 &mdash; photograph, background removed" : "fig. 02 &mdash; 1-bit ordered dither";
    hint!.textContent = touchOnly ? (revealed ? "tap to dither" : "tap to resolve") : revealed ? "move away to dither" : "hover to resolve";
  }

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  function step(now: number) {
    const dt = now - (last || now);
    last = now;
    raw = Math.min(1, Math.max(0, raw + (dir * dt) / (dir > 0 ? IN_MS : OUT_MS)));
    p = ease(raw) * (1 + BAND);
    render();
    caption(raw > 0.5);
    raf = (dir > 0 && raw < 1) || (dir < 0 && raw > 0) ? requestAnimationFrame(step) : 0;
  }

  function resolve(d: number, e?: PointerEvent | MouseEvent) {
    if (reduceMotion) {
      raw = d > 0 ? 1 : 0;
      p = d > 0 ? 1 + BAND : 0;
      render();
      caption(d > 0);
      return;
    }
    if (d > 0 && raw === 0 && e) {
      const r = cv!.getBoundingClientRect();
      setOrigin((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    }
    dir = d;
    last = 0;
    if (!raf) raf = requestAnimationFrame(step);
  }

  caption(false);
  box.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && resolve(1, e));
  box.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && resolve(-1, e));
  box.addEventListener("click", (e) => (e as PointerEvent).pointerType !== "mouse" && resolve(raw > 0.5 ? -1 : 1, e));

  let loaded = 0;
  ditherImg.onload = photoImg.onload = () => { if (++loaded === 2) build(); };
  ditherImg.src = "/images/edrich-dither.webp";
  photoImg.src = "/images/edrich-about.webp";
  let t = 0;
  addEventListener("resize", () => { clearTimeout(t); t = window.setTimeout(build, 150); });
  addEventListener("palettechange", build);
}
