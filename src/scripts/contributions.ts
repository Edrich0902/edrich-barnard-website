// Swaps the build-time contribution graph for live data. GitHub's own endpoint sends no CORS headers,
// so this goes through a community API; any failure leaves the build-time graph in place.
import { graphLabel, graphMarkup, graphSize, toContributions, type ContributionDay } from "../lib/contributions";

const API = "https://github-contributions-api.jogruber.de/v4";

async function refresh(fig: HTMLElement) {
  const res = await fetch(`${API}/${encodeURIComponent(fig.dataset.user || "")}?y=last`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return;
  const body = (await res.json()) as { contributions?: ContributionDay[] };
  const graph = toContributions(Array.isArray(body.contributions) ? body.contributions : []);
  const svg = fig.querySelector("svg");
  if (!graph || !svg) return;
  const { width, height } = graphSize(graph);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("aria-label", graphLabel(graph));
  svg.innerHTML = graphMarkup(graph);
  const total = fig.querySelector("[data-contrib-total]");
  if (total) total.textContent = String(graph.total);
  fig.hidden = false;
}

const fig = document.getElementById("contrib");
if (fig) {
  const run = () => refresh(fig).catch(() => {});
  "requestIdleCallback" in window ? requestIdleCallback(run, { timeout: 3000 }) : setTimeout(run, 1000);
}
