import { root, setTheme, setAccent, syncControls, siteData, track, type Accent } from "./palette";

const data = siteData();

/* header + active nav */
const hdr = document.getElementById("hdr");
const navLinks = [...document.querySelectorAll<HTMLAnchorElement>("#nav a")];
const sections = [...document.querySelectorAll<HTMLElement>("main section[id]")];
function onScroll() {
  hdr?.classList.toggle("scrolled", scrollY > 20);
  let active: string | null = null;
  for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * 0.4) active = s.id;
  navLinks.forEach((a) => a.classList.toggle("active", a.dataset.section === active));
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* reveal on scroll */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* clocks in Edrich's timezone, whoever is visiting */
const clocks = [...document.querySelectorAll<HTMLElement>("[data-clock]")];
const tick = () => {
  const t = new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: data.tz });
  clocks.forEach((c) => (c.textContent = c.dataset.clock === "short" ? t.slice(0, 5) : t));
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
    b.textContent = "copied";
    setTimeout(() => (b.textContent = "copy"), 1600);
  }),
);

/* theme + accent controls */
syncControls();
document.getElementById("themeBtn")?.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
document.querySelectorAll<HTMLElement>("[data-accent-swatch]").forEach((s) => s.addEventListener("click", () => setAccent(s.dataset.accentSwatch as Accent)));
