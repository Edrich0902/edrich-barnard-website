import { ACCENTS, root, setAccent, setTheme, siteData, track, type Accent } from "./palette";
import { copyEmail } from "./ui";

const SHAPES = ["portrait", "field", "wave", "helix", "sphere", "ring"];
const HISTORY_KEY = "eb-history";

const data = siteData();
const cmd = document.getElementById("cmd")!;
const input = document.getElementById("cmdInput") as HTMLInputElement;
const out = document.getElementById("cmdOut")!;
const dock = document.getElementById("dock");

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const emit = (name: string, detail?: unknown) => dispatchEvent(new CustomEvent(name, { detail }));
const goTo = (id: string) => () => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); return null; };
const openUrl = (url: string) => () => { open(url, "_blank", "noopener"); return null; };

/** Returns HTML to print and keep the prompt open, or null to close it. */
type Command = { d: string; run: (args: string[]) => string | null; stay?: boolean };

const COMMANDS: Record<string, Command> = {
  about: { d: "who I am", run: goTo("about") },
  work: { d: "selected projects", run: goTo("work") },
  experience: { d: "where I've worked", run: goTo("experience") },
  currently: { d: "what I'm working on", run: goTo("currently") },
  contact: { d: "how to reach me", run: goTo("contact") },
  ls: {
    d: "list projects",
    stay: true,
    run: () => data.projects.map((p) => `<b>${esc(p.slug)}</b>  ${esc(p.title)}`).join("<br>") + "<br>try <b>open &lt;project&gt;</b>",
  },
  open: {
    d: "open <project>",
    stay: true,
    run: ([q]) => {
      if (!q) return "usage: open &lt;project&gt;. see <b>ls</b>";
      const p = data.projects.find((p) => p.slug === q) || data.projects.find((p) => p.slug.includes(q.toLowerCase()) || p.title.toLowerCase().includes(q.toLowerCase()));
      if (!p) return `no project matching <b>${esc(q)}</b>. see <b>ls</b>`;
      open(p.url, "_blank", "noopener");
      return `opening <b>${esc(p.title)}</b>`;
    },
  },
  email: { d: "copy my email address", stay: true, run: () => { copyEmail(); return `copied <b>${esc(data.email)}</b>`; } },
  cv: { d: "view my CV", run: () => { location.href = "/cv"; return null; } },
  github: { d: "open GitHub", run: openUrl(data.links.github) },
  linkedin: { d: "open LinkedIn", run: openUrl(data.links.linkedin) },
  theme: {
    d: "theme [light|dark]",
    stay: true,
    run: ([a]) => {
      setTheme(a === "light" || a === "dark" ? a : root.dataset.theme === "dark" ? "light" : "dark");
      return `theme set to <b>${root.dataset.theme}</b>`;
    },
  },
  accent: {
    d: `accent [${ACCENTS.join("|")}]`,
    stay: true,
    run: ([a]) => {
      if (!ACCENTS.includes(a as Accent)) return `usage: accent ${ACCENTS.join(" | ")}`;
      setAccent(a as Accent);
      return `accent set to <b>${a}</b>`;
    },
  },
  say: {
    d: "say <text> with particles",
    stay: true,
    run: (args) => {
      const text = args.join(" ").slice(0, 24);
      if (!text) return "usage: say &lt;text&gt;";
      emit("stage:say", text);
      return null;
    },
  },
  shape: {
    d: `shape [${SHAPES.join("|")}|reset]`,
    stay: true,
    run: ([s]) => {
      if (s === "reset") { emit("stage:reset"); return null; }
      if (!SHAPES.includes(s)) return `usage: shape ${SHAPES.join(" | ")} | reset`;
      emit("stage:shape", s);
      return null;
    },
  },
  scatter: { d: "scatter the particles", run: () => { emit("stage:scatter"); return null; } },
  history: {
    d: "show previous commands",
    stay: true,
    run: () => (history.length ? history.map((h, i) => `${String(i + 1).padStart(3)}  ${esc(h)}`).join("<br>") : "no history yet"),
  },
  clear: { d: "clear the output", stay: true, run: () => { log = []; return ""; } },
  help: { d: "list commands", stay: true, run: () => "commands: " + Object.keys(COMMANDS).map((k) => `<b>${k}</b>`).join(" ") },
};

let history: string[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
let log: string[] = [];
let matches: string[] = [];
let sel = 0;
let recall = -1;

function render() {
  const q = input.value.trim().split(/\s+/)[0].toLowerCase();
  const browsing = input.value.trim() !== "" || log.length === 0;
  matches = !browsing || input.value.includes(" ") ? [] : Object.keys(COMMANDS).filter((k) => k.startsWith(q));
  sel = Math.min(sel, Math.max(0, matches.length - 1));
  out.innerHTML =
    log.map((l) => `<div class="o">${l}</div>`).join("") +
    matches.map((k, i) => `<div class="sugg ${i === sel ? "sel" : ""}" data-k="${k}"><span>${k}</span><span>${esc(COMMANDS[k].d)}</span></div>`).join("");
  out.scrollTop = out.scrollHeight;
}

function openCmd() {
  cmd.classList.add("open");
  dock?.classList.add("hide");
  input.value = "";
  sel = 0;
  recall = -1;
  render();
  setTimeout(() => input.focus(), 30);
}

function closeCmd() {
  cmd.classList.remove("open");
  dock?.classList.remove("hide");
  input.blur();
}

function exec(line: string) {
  const [name, ...args] = line.trim().split(/\s+/);
  if (!name) return;
  history = [...history.filter((h) => h !== line), line].slice(-30);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  track("command", { name });
  const c = COMMANDS[name.toLowerCase()];
  input.value = "";
  sel = 0;
  recall = -1;
  if (!c) {
    log.push(`command not found: ${esc(name)}. try <b>help</b>`);
    return render();
  }
  const res = c.run(args);
  if (res) log.push(res);
  log = log.slice(-12);
  if (c.stay && res !== null) render();
  else closeCmd();
}

input.addEventListener("input", () => { sel = 0; recall = -1; render(); });
input.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && (input.value === "" || recall >= 0) && history.length) {
    e.preventDefault();
    recall = recall < 0 ? history.length - 1 : Math.max(0, recall - 1);
    input.value = history[recall];
    render();
  } else if (e.key === "ArrowDown" && recall >= 0) {
    e.preventDefault();
    recall = recall + 1 < history.length ? recall + 1 : -1;
    input.value = recall < 0 ? "" : history[recall];
    render();
  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const n = Math.max(1, matches.length);
    sel = (sel + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
    render();
  } else if (e.key === "Tab") {
    e.preventDefault();
    if (matches[sel]) { input.value = matches[sel] + " "; render(); }
  } else if (e.key === "Enter") {
    const v = input.value.trim();
    const first = v.split(/\s+/)[0];
    exec(!v || (!COMMANDS[first] && !v.includes(" ") && matches[sel]) ? matches[sel] || "" : v);
  } else if (e.key === "Escape") closeCmd();
});
out.addEventListener("click", (e) => {
  const s = (e.target as HTMLElement).closest<HTMLElement>(".sugg");
  if (s?.dataset.k) exec(s.dataset.k);
});

document.querySelectorAll("#cmdBtn, [data-open-cmd]").forEach((b) => b.addEventListener("click", openCmd));
addEventListener("keydown", (e) => {
  const el = document.activeElement as HTMLElement | null;
  const typing = !!el && (["INPUT", "TEXTAREA"].includes(el.tagName) || el.isContentEditable);
  if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
    e.preventDefault();
    cmd.classList.contains("open") ? closeCmd() : openCmd();
  } else if (e.key === "Escape" && cmd.classList.contains("open")) closeCmd();
});

/* shareable links: /?cmd=say%20hello */
const fromUrl = new URLSearchParams(location.search).get("cmd");
if (fromUrl) {
  let ran = false;
  const run = () => {
    if (ran) return;
    ran = true;
    const before = log.length;
    exec(fromUrl);
    if (log.length > before) openCmd();
  };
  addEventListener("stage:ready", run, { once: true });
  setTimeout(run, 2500);
}
