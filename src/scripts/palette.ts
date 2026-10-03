export const root = document.documentElement;
export const css = (v: string) => getComputedStyle(root).getPropertyValue(v).trim();
export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

export const ACCENTS = ["lime", "orange", "blue", "mono"] as const;
export type Accent = (typeof ACCENTS)[number];
export type Theme = "light" | "dark";

const emit = () => dispatchEvent(new Event("palettechange"));

export function setTheme(t: Theme) {
  root.dataset.theme = t;
  localStorage.setItem("eb-theme", t);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "dark" ? "#0f0f0e" : "#f3f3f1");
  syncControls();
  emit();
}

export function setAccent(a: Accent) {
  root.dataset.accent = a;
  localStorage.setItem("eb-accent", a);
  syncControls();
  emit();
}

export function syncControls() {
  const btn = document.getElementById("themeBtn");
  if (btn) btn.textContent = root.dataset.theme === "dark" ? "light" : "dark";
  document.querySelectorAll<HTMLElement>("[data-accent-swatch]").forEach((s) => s.classList.toggle("on", s.dataset.accentSwatch === root.dataset.accent));
}

export function track(event: string, data?: Record<string, string>) {
  (window as unknown as { umami?: { track: (e: string, d?: object) => void } }).umami?.track(event, data);
}

export type SiteData = {
  email: string;
  tz: string;
  links: Record<string, string>;
  projects: { slug: string; title: string; url: string }[];
};
export const siteData = (): SiteData => JSON.parse(document.getElementById("site-data")?.textContent || "{}");
