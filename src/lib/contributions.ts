// Shared by the build-time render and the in-browser graph, so both draw identical markup.

export type ContributionDay = { date: string; level: number; count: number };
export type Streak = { days: number; start: string; end: string };
export type Contributions = { weeks: (ContributionDay | undefined)[][]; total: number; streak: Streak | null };

export const CELL = 11;
export const DOT = [2.5, 4.5, 6, 7.5, 9];

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

  let streak: Streak | null = null;
  let runDays = 0;
  let runStart = "";
  for (const d of sorted) {
    if (d.count === 0) {
      runDays = 0;
      continue;
    }
    if (runDays === 0) runStart = d.date;
    runDays++;
    if (!streak || runDays > streak.days) streak = { days: runDays, start: runStart, end: d.date };
  }

  return { weeks, total: sorted.reduce((s, d) => s + d.count, 0), streak };
}

export const graphSize = (c: Contributions) => ({ width: c.weeks.length * CELL, height: 7 * CELL });

export function graphLabel(c: Contributions) {
  return `${c.total} GitHub contributions in the last year`;
}

export function streakLabel(s: Streak | null) {
  return s && s.days > 1 ? `longest streak ${s.days} days` : "";
}

/** Inner SVG markup. Each dot carries its date, count, column and row for the client-side graph. */
export function graphMarkup(c: Contributions) {
  let out = "";
  const lastDate = c.weeks.flat().reduce((m, d) => (d && d.date > m ? d.date : m), "");
  const { streak } = c;
  c.weeks.forEach((week, x) =>
    week.forEach((d, y) => {
      if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return;
      const level = Math.max(0, Math.min(4, Math.round(d.level)));
      const count = Math.max(0, Math.round(d.count));
      const s = DOT[level];
      const fill = level === 4 ? `class="fill-accent"` : `class="fill-fg" fill-opacity="${(0.18 + level * 0.2).toFixed(2)}"`;
      const flags =
        (d.date === lastDate ? " data-today" : "") +
        (streak && streak.days > 1 && d.date >= streak.start && d.date <= streak.end ? " data-streak" : "");
      out += `<rect x="${x * CELL + (CELL - s) / 2}" y="${y * CELL + (CELL - s) / 2}" width="${s}" height="${s}" ${fill} data-date="${d.date}" data-count="${count}" data-level="${level}" data-c="${x}" data-r="${y}"${flags}></rect>`;
    }),
  );
  return out;
}
