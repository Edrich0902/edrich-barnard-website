// Scroll-triggered motion: each effect plays once, the first time its element comes into view.
import { reduceMotion } from "./palette";
import { prepareDecode } from "./decode";

const TYPE_MS = 38;
const MAX_STAGGER = 10;

/** Types the label out behind a zero-width caret, which blinks a few times and goes away. */
function typeOut(el: HTMLElement) {
  const text = el.textContent || "";
  const typed = document.createElement("span");
  const caret = document.createElement("span");
  const rest = document.createElement("span");
  caret.className = "caret-z";
  caret.setAttribute("aria-hidden", "true");
  rest.style.visibility = "hidden";
  rest.textContent = text;
  el.setAttribute("aria-label", text);
  el.replaceChildren(typed, caret, rest);
  let i = 0;
  const tick = () => {
    i++;
    typed.textContent = text.slice(0, i);
    rest.textContent = text.slice(i);
    if (i < text.length) setTimeout(tick, TYPE_MS);
    else
      setTimeout(() => {
        el.textContent = text;
        el.removeAttribute("aria-label");
      }, 1400);
  };
  setTimeout(tick, 350);
}

const onEnter = new Map<Element, () => void>();
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      onEnter.get(e.target)?.();
      io.unobserve(e.target);
    }),
  { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
);

document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((list) =>
  [...list.children].forEach((c, i) => (c as HTMLElement).style.setProperty("--si", String(Math.min(i, MAX_STAGGER)))),
);
document.querySelectorAll(".reveal, [data-stagger]").forEach((el) => io.observe(el));

document.querySelectorAll<HTMLElement>(".sec-head").forEach((head) => {
  const file = head.querySelector<HTMLElement>(".file");
  if (file && !reduceMotion && file.offsetParent) {
    const text = file.textContent || "";
    file.style.visibility = "hidden";
    onEnter.set(head, () => {
      file.style.visibility = "";
      file.textContent = text;
      typeOut(file);
    });
  }
  io.observe(head);
});

const email = document.querySelector<HTMLElement>("[data-decode-email]");
if (email && !reduceMotion) {
  const d = prepareDecode(email, { delay: 150, stagger: 28, scramble: 320 });
  onEnter.set(email, () => d.start());
  io.observe(email);
}
