// Text "decode": letters flicker through glyphs and resolve left to right.
// `prepareDecode` hides the text straight away (so it never flashes), `start` runs the animation.

const GLYPHS = "#%&*+=<>/\\[]{}01";
const FRAME_MS = 55;

type Options = { delay?: number; stagger?: number; scramble?: number };

export function prepareDecode(el: HTMLElement, { delay = 0, stagger = 55, scramble = 380 }: Options = {}) {
  const text = el.textContent?.trim() || "";
  el.setAttribute("aria-label", text);
  el.textContent = "";

  // Each real letter keeps its width (hidden) while a glyph is drawn over it, so nothing reflows.
  const cells = [...text].map((ch) => {
    const cell = document.createElement("span");
    cell.setAttribute("aria-hidden", "true");
    if (ch === " ") {
      cell.textContent = " ";
      el.append(cell);
      return null;
    }
    cell.style.cssText = "position:relative;display:inline-block";
    const letter = document.createElement("span");
    letter.textContent = ch;
    letter.style.visibility = "hidden";
    const glyph = document.createElement("span");
    glyph.style.cssText = "position:absolute;inset:0;display:grid;place-items:center;font-family:var(--font-mono);font-weight:400;font-size:0.8em;color:var(--faint)";
    cell.append(letter, glyph);
    el.append(cell);
    return { letter, glyph };
  });

  let started = false;
  return {
    start() {
      if (started) return;
      started = true;
      const t0 = performance.now();
      let last = 0;
      const step = (now: number) => {
        const t = now - t0;
        const shuffle = now - last > FRAME_MS;
        if (shuffle) last = now;
        let pending = false;
        cells.forEach((c, i) => {
          if (!c || !c.glyph.isConnected) return;
          if (t >= delay + i * stagger + scramble) {
            c.letter.style.visibility = "";
            c.glyph.remove();
            return;
          }
          pending = true;
          if (shuffle && t >= delay + i * stagger * 0.4) {
            c.glyph.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
            c.glyph.style.color = Math.random() < 0.12 ? "var(--accent)" : "var(--faint)";
          }
        });
        if (pending) requestAnimationFrame(step);
        else {
          el.textContent = text;
          el.removeAttribute("aria-label");
        }
      };
      requestAnimationFrame(step);
    },
  };
}
