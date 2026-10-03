// Fixed dot-matrix particle field behind the page. Points snap to a screen-space pixel grid and
// morph between shapes as sections scroll into view. Listens for `stage:*` events from the command line.
import { BufferAttribute, BufferGeometry, Color, Group, PerspectiveCamera, Points, Scene, ShaderMaterial, Vector2, WebGLRenderer } from "three";
import { css, root, reduceMotion } from "./palette";
import { BAYER, ditherTone } from "./tone";

export type ShapeName = "portrait" | "field" | "wave" | "helix" | "sphere" | "ring";
export const SHAPES: ShapeName[] = ["portrait", "field", "wave", "helix", "sphere", "ring"];

const canvas = document.getElementById("stage") as HTMLCanvasElement | null;
const COUNT = innerWidth < 760 ? 4000 : 7000;
const PORTRAIT_H = 5.4;

let renderer: WebGLRenderer | null = null;
try {
  if (canvas) renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true });
} catch {
  renderer = null;
}

if (canvas && renderer) {
  const dpr = Math.min(devicePixelRatio, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight);
  const scene = new Scene();
  const camera = new PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 9;
  const halfH = () => Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;

  /* shapes */
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const make = (fn: (i: number) => number[]) => {
    const out = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) out.set(fn(i), i * 3);
    return out;
  };
  const sphere = () => {
    const g = Math.PI * (3 - Math.sqrt(5));
    return make((i) => { const y = 1 - (i / (COUNT - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i; return [Math.cos(th) * r * 2.2, y * 2.2, Math.sin(th) * r * 2.2]; });
  };
  const field = () => make(() => [rand(-11, 11), rand(-6.5, 6.5), rand(-3, 1)]);
  const wave = () => {
    const side = Math.ceil(Math.sqrt(COUNT));
    return make((i) => { const x = ((i % side) / side - 0.5) * 18, z = (Math.floor(i / side) / side - 0.5) * 10; return [x, Math.sin(x * 0.5) * 0.45 + Math.cos(z * 0.7) * 0.35 - 2.8, z]; });
  };
  const helix = () =>
    make((i) => {
      const t = (i / COUNT) * Math.PI * 7, y = (i / COUNT - 0.5) * 5.6, s = i % 2 ? Math.PI : 0;
      if (Math.random() < 0.15) { const k = rand(-1, 1); return [Math.cos(t) * 1.1 * k, y, Math.sin(t) * 1.1 * k]; }
      return [Math.cos(t + s) * 1.1, y, Math.sin(t + s) * 1.1];
    });
  const ring = () =>
    make(() => {
      const u = Math.random() * Math.PI * 2, v = Math.random() * Math.PI * 2, R = 2.6, r = 0.3 + Math.random() * 0.2;
      return [(R + r * Math.cos(v)) * Math.cos(u), (R + r * Math.cos(v)) * Math.sin(u), r * Math.sin(v)];
    });

  /** One grid cell per on-screen dot, so ordered-dither patterns survive the shader's pixel snapping. */
  // `sample` returns the point's depth, or null to leave the cell empty.
  function fromPixels(c: HTMLCanvasElement, worldH: number, sample: (d: Uint8ClampedArray, i: number, x: number, y: number) => number | null) {
    const ctx = c.getContext("2d", { willReadFrequently: true })!, d = ctx.getImageData(0, 0, c.width, c.height).data;
    const sc = worldH / c.height, pts: number[][] = [];
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const z = sample(d, (y * c.width + x) * 4, x, y);
      if (z !== null) pts.push([(x - c.width / 2 + 0.5) * sc, -(y - c.height / 2 + 0.5) * sc, z]);
    }
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    return make((i) => pts[i < pts.length ? i : (Math.random() * pts.length) | 0] || [0, 0, 0]);
  }
  const gridRows = (worldH: number, scale: number, min: number) => Math.max(min, Math.round((worldH * scale * (innerHeight / (2 * halfH()))) / 5));

  function portrait(img: HTMLImageElement) {
    const h = gridRows(PORTRAIT_H, L.portrait.s, 60), w = Math.round(h * (img.width / img.height));
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
    c.getContext("2d")!.drawImage(img, 0, 0, w, h);
    const light = root.dataset.theme === "light";
    return fromPixels(c, PORTRAIT_H, (d, i, x, y) => {
      const b = ditherTone(d[i], d[i + 1], d[i + 2], d[i + 3], y / h, light);
      return b > BAYER[(y % 4) * 4 + (x % 4)] ? b * 0.12 : null;
    });
  }

  function text(str: string) {
    const hw = halfH() * camera.aspect, font = `500 120px "IBM Plex Sans", sans-serif`;
    const m = document.createElement("canvas").getContext("2d")!;
    m.font = font;
    const tw = m.measureText(str).width + 40, worldW = innerWidth < 900 ? hw * 1.8 : hw * 0.9;
    const worldH = Math.min((worldW * 170) / tw, 2.6);
    const h = gridRows(worldH, 1, 24), w = Math.round((h * tw) / 170);
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
    const ctx = c.getContext("2d")!;
    ctx.scale(w / tw, h / 170);
    ctx.font = font;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(str, 20, 92);
    return fromPixels(c, worldH, (d, i) => (d[i + 3] > 110 ? 0 : null));
  }

  const shapes: Record<ShapeName, Float32Array> = { portrait: sphere(), field: field(), wave: wave(), helix: helix(), sphere: sphere(), ring: ring() };
  type Pose = { x: number; y: number; s: number; spin: number; sway: number; o: number; tilt?: number };
  function layout(): Record<ShapeName | "text", Pose> {
    const m = innerWidth < 900, hw = halfH() * camera.aspect;
    return {
      portrait: { x: m ? 0 : hw * 0.5, y: m ? 0.4 : -0.1, s: m ? 0.8 : Math.min(1.08, hw / 6.6), spin: 0, sway: 0.22, o: m ? 0.1 : 1 },
      field: { x: 0, y: 0, s: 1, spin: 0.01, sway: 0.05, o: 0.28 },
      wave: { x: 0, y: 0, s: 1, spin: 0, sway: 0.06, tilt: 0.32, o: 0.45 },
      helix: { x: m ? 0 : -hw * 0.52, y: -0.75, s: 0.85, spin: 0.22, sway: 0.08, o: m ? 0.12 : 0.85 },
      sphere: { x: m ? 0 : hw * 0.56, y: -0.2, s: m ? 0.8 : 0.82, spin: 0.14, sway: 0.12, o: m ? 0.12 : 0.8 },
      ring: { x: m ? 0 : hw * 0.55, y: -0.3, s: m ? 0.8 : 0.82, spin: 0.05, sway: 0.18, tilt: 0.35, o: m ? 0.12 : 0.9 },
      text: { x: m ? 0 : hw * 0.5, y: m ? 1.2 : 0, s: 1, spin: 0, sway: 0.08, o: m ? 0.55 : 0.9 },
    };
  }
  let L = layout();
  let current: ShapeName = "portrait", pose: ShapeName | "text" = "portrait", target = shapes.portrait, override = false;

  const img = new Image();
  let portraitTheme: string | undefined;
  function buildPortrait() {
    if (!img.naturalWidth || portraitTheme === root.dataset.theme) return;
    portraitTheme = root.dataset.theme;
    shapes.portrait = portrait(img);
    if (current === "portrait" && !override) target = shapes.portrait;
  }
  img.onload = buildPortrait;
  img.src = "/images/edrich-dither.png";
  addEventListener("palettechange", buildPortrait);

  /* points */
  const geo = new BufferGeometry();
  const pos = field(), rnd = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) rnd[i] = Math.random();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("aRnd", new BufferAttribute(rnd, 1));
  const mat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uRes: { value: new Vector2() }, uCell: { value: 5 * dpr }, uSize: { value: 2.6 * dpr },
      uColor: { value: new Color() }, uAccent: { value: new Color() }, uOpacity: { value: 1 }, uWobble: { value: 0.003 },
    },
    vertexShader: /* glsl */ `
      attribute float aRnd; uniform float uTime; uniform vec2 uRes; uniform float uCell; uniform float uSize; uniform float uWobble;
      varying float vRnd; varying float vFade;
      void main() {
        vec3 p = position + uWobble * vec3(sin(uTime * .7 + aRnd * 40.), cos(uTime * .6 + aRnd * 30.), 0.);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        vec4 clip = projectionMatrix * mv;
        vec2 px = (clip.xy / clip.w * .5 + .5) * uRes;
        px = (floor(px / uCell) + .5) * uCell;
        gl_Position = vec4((px / uRes * 2. - 1.) * clip.w, clip.z, clip.w);
        gl_PointSize = uSize;
        vRnd = aRnd;
        vFade = clamp(1.25 - (-mv.z - 7.) / 5., .3, 1.);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform vec3 uAccent; uniform float uOpacity; varying float vRnd; varying float vFade;
      void main() {
        bool a = vRnd < .045;
        gl_FragColor = vec4(a ? uAccent : uColor, uOpacity * vFade * (a ? 1. : .5));
      }`,
    transparent: true,
    depthWrite: false,
  });
  const group = new Group();
  group.add(new Points(geo, mat));
  scene.add(group);

  const applyPalette = () => { mat.uniforms.uColor.value.set(css("--fg")); mat.uniforms.uAccent.value.set(css("--accent")); };
  applyPalette();
  addEventListener("palettechange", applyPalette);

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer!.setSize(innerWidth, innerHeight);
    const v = new Vector2();
    renderer!.getDrawingBufferSize(v);
    mat.uniforms.uRes.value.copy(v);
    L = layout();
  }
  resize();
  addEventListener("resize", resize);

  /* section tracking + command line hooks */
  function pick() {
    let active: ShapeName = "portrait";
    document.querySelectorAll<HTMLElement>("main section[data-shape]").forEach((s) => {
      if (s.getBoundingClientRect().top < innerHeight * 0.55) active = s.dataset.shape as ShapeName;
    });
    if (active !== current) {
      current = active;
      override = false;
    }
    if (!override) { pose = current; target = shapes[current]; }
  }
  addEventListener("scroll", pick, { passive: true });
  addEventListener("stage:scatter", () => { const s = field(); for (let i = 0; i < pos.length; i++) pos[i] = s[i] * 1.3; });
  addEventListener("stage:shape", (e) => {
    const name = (e as CustomEvent<ShapeName>).detail;
    override = true; pose = name; target = shapes[name];
  });
  addEventListener("stage:say", (e) => {
    override = true; pose = "text"; target = text((e as CustomEvent<string>).detail);
  });
  addEventListener("stage:reset", () => { override = false; pick(); });

  const mouse = { x: 0, y: 0, wx: 99, wy: 99 };
  addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
    mouse.wx = mouse.x * halfH() * camera.aspect;
    mouse.wy = mouse.y * halfH();
  });

  let last = performance.now(), elapsed = 0;
  let spin = 0;
  function frame() {
    const now = performance.now(), dt = Math.min((now - last) / 1000, 0.25), f = dt * 60;
    last = now;
    elapsed += dt;
    mat.uniforms.uTime.value = elapsed;
    const c = L[pose], k4 = reduceMotion ? 1 : 1 - Math.pow(0.96, f), k5 = reduceMotion ? 1 : 1 - Math.pow(0.95, f);
    group.position.x += (c.x - group.position.x) * k4;
    group.position.y += (c.y - group.position.y) * k4;
    const sc = group.scale.x + (c.s - group.scale.x) * k4;
    group.scale.setScalar(sc);
    mat.uniforms.uOpacity.value += (c.o - mat.uniforms.uOpacity.value) * k4;
    mat.uniforms.uWobble.value += ((pose === "portrait" || pose === "text" || reduceMotion ? 0.003 : 0.02) - mat.uniforms.uWobble.value) * k4;
    if (!reduceMotion) spin += c.spin * dt;
    const sway = reduceMotion ? 0 : c.sway;
    group.rotation.y += (spin + mouse.x * sway - group.rotation.y) * k5;
    group.rotation.x += ((c.tilt || 0) - mouse.y * sway * 0.6 - group.rotation.x) * k5;
    const lx = (mouse.wx - group.position.x) / sc, ly = (mouse.wy - group.position.y) / sc, cy = Math.cos(group.rotation.y);
    for (let i = 0; i < COUNT; i++) {
      const j = i * 3, e = reduceMotion ? 1 : 1 - Math.pow(1 - (0.03 + rnd[i] * 0.04), f);
      let px = pos[j] + (target[j] - pos[j]) * e, py = pos[j + 1] + (target[j + 1] - pos[j + 1]) * e;
      if (!reduceMotion) {
        const dx = px * cy - lx, dy = py - ly, d2 = dx * dx + dy * dy;
        if (d2 < 0.5) { const k = (0.5 - d2) * 0.14; px += dx * k; py += dy * k; }
      }
      pos[j] = px; pos[j + 1] = py; pos[j + 2] += (target[j + 2] - pos[j + 2]) * e;
    }
    geo.attributes.position.needsUpdate = true;
    renderer!.render(scene, camera);
    requestAnimationFrame(frame);
  }
  pick();
  frame();
}
dispatchEvent(new Event("stage:ready"));
