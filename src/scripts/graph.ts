// The GitHub contribution graph: live refresh, the entrance (weekly bars lifted into the calendar by a
// sweeping playhead), hover readout and an occasional twinkle.
import { CELL, graphLabel, graphMarkup, graphSize, streakLabel, toContributions, type ContributionDay, type Contributions } from "../lib/contributions";
import { reduceMotion } from "./palette";

// GitHub's own endpoint sends no CORS headers, so the live data comes from a community API.
const API = "https://github-contributions-api.jogruber.de/v4";
const RISE_MS = 450;
const SWEEP_MS = 1700;
const SETTLE_MS = 600;
const TWINKLE_MS = 3200;

const fig = document.getElementById("contrib");
if (fig) setup(fig);

function setup(fig: HTMLElement) {
  const svg = fig.querySelector("svg")!;
  const dots = fig.querySelector<SVGGElement>("[data-dots]")!;
  const xhCol = fig.querySelector<SVGRectElement>("[data-xh-col]")!;
  const xhRow = fig.querySelector<SVGRectElement>("[data-xh-row]")!;
  const line = fig.querySelector<HTMLElement>("[data-ph-line]")!;
  const label = fig.querySelector<HTMLElement>("[data-ph-label]")!;
  const caption = fig.querySelector<HTMLElement>("[data-contrib-caption]")!;
  const readout = fig.querySelector<HTMLElement>("[data-contrib-readout]")!;
  const total = fig.querySelector<HTMLElement>("[data-contrib-total]")!;
  const streak = fig.querySelector<HTMLElement>("[data-contrib-streak]")!;

  let state: "idle" | "playing" | "done" = reduceMotion ? "done" : "idle";
  let visible = false;
  let hovering = false;
  let raf = 0;
  if (state === "idle") fig.classList.add("pre");

  const rects = () => [...dots.querySelectorAll<SVGRectElement>("rect")];
  const num = (r: SVGRectElement, k: string) => Number(r.dataset[k]);
  const fmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const month = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
  const dateOf = (r: SVGRectElement) => new Date(`${r.dataset.date}T00:00:00Z`);

  /* live data */
  function render(c: Contributions) {
    const { width, height } = graphSize(c);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("aria-label", graphLabel(c));
    xhRow.setAttribute("width", String(width));
    dots.innerHTML = graphMarkup(c);
    total.textContent = String(c.total);
    const s = streakLabel(c.streak);
    streak.textContent = s ? ` · ${s}` : "";
    fig.hidden = false;
    if (state === "playing") finish();
  }

  async function refresh() {
    const res = await fetch(`${API}/${encodeURIComponent(fig.dataset.user || "")}?y=last`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return;
    const body = (await res.json()) as { contributions?: ContributionDay[] };
    const c = toContributions(Array.isArray(body.contributions) ? body.contributions : []);
    if (c) render(c);
  }

  /* entrance */
  function play() {
    if (state !== "idle") return;
    state = "playing";
    const rs = rects();
    if (!rs.length) return finish();
    fig.classList.remove("pre");
    fig.classList.add("animating");

    // Bars: each week's active days stacked at the bottom of its column, biggest first.
    const cols: SVGRectElement[][] = [];
    for (const r of rs) (cols[num(r, "c")] ||= []).push(r);
    cols.forEach((list) => {
      list.filter((r) => num(r, "level") > 0)
        .sort((a, b) => num(b, "level") - num(a, "level"))
        .forEach((r, i) => (r.style.transform = `translateY(${(6 - i - num(r, "r")) * CELL}px)`));
      list.filter((r) => num(r, "level") === 0).forEach((r) => (r.style.transform = "scale(0)"));
    });

    const running: number[] = [];
    let sum = 0;
    cols.forEach((list, i) => (running[i] = sum += (list || []).reduce((s, r) => s + num(r, "count"), 0)));
    const width = cols.length * CELL;
    let landed = 0;
    total.textContent = "0";

    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0 - RISE_MS) / SWEEP_MS));
      if (now - t0 >= RISE_MS) fig.classList.add("sweeping");
      const p = k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2;
      const x = p * width;
      line.style.transform = `translateX(${x}px)`;
      label.style.left = `${Math.min(Math.max(x, 24), width - 24)}px`;

      // Lift every column the playhead has passed into its calendar position.
      while (landed < cols.length && landed * CELL + CELL / 2 <= x) {
        (cols[landed] || []).forEach((r) => {
          r.style.transform = "";
          if (num(r, "level") > 0) {
            r.classList.add("flash");
            setTimeout(() => r.classList.remove("flash"), 90);
          }
        });
        const first = cols[landed]?.[0];
        if (first) label.textContent = month.format(dateOf(first)).toLowerCase();
        total.textContent = String(running[landed] ?? 0);
        landed++;
      }

      if (k < 1) raf = requestAnimationFrame(step);
      else setTimeout(finish, SETTLE_MS);
    };
    raf = requestAnimationFrame(step);
  }

  function finish() {
    cancelAnimationFrame(raf);
    rects().forEach((r) => {
      r.style.transform = "";
      r.classList.remove("flash");
    });
    fig.classList.remove("pre", "animating", "sweeping");
    total.textContent = String(rects().reduce((s, r) => s + num(r, "count"), 0));
    state = "done";
  }

  /* hover readout */
  function clearHover() {
    hovering = false;
    fig.classList.remove("hovering");
    dots.querySelector(".hot")?.classList.remove("hot");
    readout.hidden = true;
    caption.hidden = false;
  }
  svg.addEventListener("pointermove", (e) => {
    if (state !== "done") return;
    const box = svg.getBoundingClientRect();
    const c = Math.floor((e.clientX - box.left) / CELL), r = Math.floor((e.clientY - box.top) / CELL);
    const hit = dots.querySelector<SVGRectElement>(`rect[data-c="${c}"][data-r="${r}"]`);
    if (!hit) return clearHover();
    hovering = true;
    fig.classList.add("hovering");
    xhCol.setAttribute("x", String(c * CELL));
    xhRow.setAttribute("y", String(r * CELL));
    if (!hit.classList.contains("hot")) {
      dots.querySelector(".hot")?.classList.remove("hot");
      hit.classList.add("hot");
    }
    const n = num(hit, "count");
    const week = [...dots.querySelectorAll<SVGRectElement>(`rect[data-c="${c}"]`)].reduce((s, x) => s + num(x, "count"), 0);
    readout.textContent = `${n} contribution${n === 1 ? "" : "s"} · ${fmt.format(dateOf(hit)).replace(",", "").toLowerCase()} · week ${week}`;
    readout.hidden = false;
    caption.hidden = true;
  });
  svg.addEventListener("pointerleave", clearHover);

  /* twinkle */
  if (!reduceMotion)
    setInterval(() => {
      if (state !== "done" || !visible || hovering || document.hidden) return;
      const pool = rects().filter((r) => num(r, "level") > 0 && !("today" in r.dataset) && !("streak" in r.dataset));
      const r = pool[(Math.random() * pool.length) | 0];
      if (!r) return;
      r.classList.add("twinkle");
      setTimeout(() => r.classList.remove("twinkle"), 260);
    }, TWINKLE_MS);

  new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        visible = e.isIntersecting;
        if (visible && e.intersectionRatio >= 0.5) play();
      }),
    { threshold: [0, 0.5] },
  ).observe(fig);

  const run = () => refresh().catch(() => {});
  "requestIdleCallback" in window ? requestIdleCallback(run, { timeout: 3000 }) : setTimeout(run, 1000);
}
