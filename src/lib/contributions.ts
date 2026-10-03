// Shared by the build-time render and the in-browser refresh, so both draw identical markup.

export type ContributionDay = { date: string; level: number; count: number };
export type Contributions = { weeks: (ContributionDay | undefined)[][]; total: number };

const CELL = 11;
const DOT = [2.5, 4.5, 6, 7.5, 9];

/** Lays days out GitHub-style: one column per week, one row per weekday (Sunday first). */
export function toContributions(days: ContributionDay[]): Contributions | null {
  if (!days.length) return null;
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const weeks: (ContributionDay | undefined)[][] = [];
  let col = -1;
  for (const d of sorted) {
    const row = new Date(`${d.date}T00:00:00Z`).getUTCDay();
    if (col < 0 || row === 0) weeks[++col] = [];
    weeks[col][row] = d;
  }
  return { weeks, total: sorted.reduce((s, d) => s + d.count, 0) };
}

export const graphSize = (c: Contributions) => ({ width: c.weeks.length * CELL, height: 7 * CELL });

export function graphLabel(c: Contributions) {
  return `${c.total} GitHub contributions in the last year`;
}

/** Inner SVG markup; dates and counts are the only interpolated values. */
export function graphMarkup(c: Contributions) {
  let out = "";
  c.weeks.forEach((week, x) =>
    week.forEach((d, y) => {
      if (!d) return;
      const level = Math.max(0, Math.min(4, Math.round(d.level)));
      const s = DOT[level];
      const fill = level === 4 ? `class="fill-accent"` : `class="fill-fg" fill-opacity="${(0.18 + level * 0.2).toFixed(2)}"`;
      const count = Math.max(0, Math.round(d.count));
      const date = /^\d{4}-\d{2}-\d{2}$/.test(d.date) ? d.date : "";
      out += `<rect x="${x * CELL + (CELL - s) / 2}" y="${y * CELL + (CELL - s) / 2}" width="${s}" height="${s}" ${fill}><title>${count} contribution${count === 1 ? "" : "s"} on ${date}</title></rect>`;
    }),
  );
  return out;
}
