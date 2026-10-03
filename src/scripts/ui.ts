import { root, setTheme, setAccent, syncControls, siteData, track, type Accent } from "./palette";

const data = siteData();

/* header + active nav */
const hdr = document.getElementById("hdr");
const navLinks = [...document.querySelectorAll<HTMLAnchorElement>("#nav a")];
const menuLinks = [...document.querySelectorAll<HTMLAnchorElement>("#menu a[data-section]")];
const navMarker = document.getElementById("navMarker");
const sections = [...document.querySelectorAll<HTMLElement>("main section[id]")];
function placeMarker(a: HTMLAnchorElement | undefined) {
  if (!navMarker) return;
  navMarker.style.opacity = a ? "1" : "0";
  if (a) navMarker.style.transform = `translateX(${a.offsetLeft}px) scaleX(${a.offsetWidth})`;
}
const reached = new Set<string>();
function onScroll() {
  hdr?.classList.toggle("scrolled", scrollY > 20);
  let active: string | null = null;
  for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * 0.4) active = s.id;
  if (active && active !== "hero" && !reached.has(active)) {
    reached.add(active);
    track("section", { name: active });
  }
  [...navLinks, ...menuLinks].forEach((a) => a.classList.toggle("active", a.dataset.section === active));
  placeMarker(navLinks.find((a) => a.dataset.section === active));
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
onScroll();

/* clocks in Edrich's timezone, whoever is visiting */
const clocks = [...document.querySelectorAll<HTMLElement>("[data-clock]")];
const tick = () => {
  const t = new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: data.tz });
  clocks.forEach((c) => {
    if (c.dataset.clock === "short") c.innerHTML = `${t.slice(0, 2)}<span class="tick">:</span>${t.slice(3, 5)}`;
    else c.textContent = t;
  });
};
tick();
setInterval(tick, 1000);

/* copy email */
export function copyEmail() {
  navigator.clipboard?.writeText(data.email);
  track("copy-email");
}
document.querySelectorAll<HTMLButtonElement>("[data-copy-email]").forEach((b) =>
  b.addEventListener("click", () => {
    copyEmail();
    b.innerHTML = `<span class="text-accent">&check;</span> copied`;
    setTimeout(() => (b.textContent = "copy"), 1600);
  }),
);

/* theme + accent controls */
syncControls();
document.getElementById("themeBtn")?.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
document.querySelectorAll<HTMLElement>("[data-accent-swatch]").forEach((s) => s.addEventListener("click", () => setAccent(s.dataset.accentSwatch as Accent)));

/* header popovers: accent picker (desktop) and section menu (mobile) */
function popover(btn: HTMLElement | null, panel: HTMLElement | null, onToggle?: (open: boolean) => void) {
  if (!btn || !panel) return () => {};
  const set = (open: boolean) => {
    panel.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    onToggle?.(open);
  };
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    set(!panel.classList.contains("open"));
  });
  document.addEventListener("click", (e) => {
    if (panel.classList.contains("open") && !panel.contains(e.target as Node)) set(false);
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) {
      set(false);
      btn.focus();
    }
  });
  return () => set(false);
}

popover(document.getElementById("accentBtn"), document.getElementById("accentPop"));
const menuBtn = document.getElementById("menuBtn");
const closeMenu = popover(menuBtn, document.getElementById("menu"), (open) => {
  hdr?.classList.toggle("menu-open", open);
  if (menuBtn) menuBtn.textContent = open ? "close" : "menu";
});
menuLinks.forEach((a) => a.addEventListener("click", closeMenu));
addEventListener("resize", () => innerWidth >= 900 && closeMenu());
