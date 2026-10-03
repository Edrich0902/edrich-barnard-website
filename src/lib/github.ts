// Fetched once at build time. Returns null when GitHub is unreachable so the build never fails on it.
import { toContributions, type ContributionDay, type Contributions } from "./contributions";

export async function getContributions(user: string): Promise<Contributions | null> {
  try {
    const res = await fetch(`https://github.com/users/${user}/contributions`, {
      headers: { "User-Agent": "edrich-barnard-website build" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const counts = new Map<string, number>();
    for (const m of html.matchAll(/<tool-tip[^>]*for="(contribution-day-component-[\d-]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      const n = m[2].match(/^(\d+) contributions?/);
      counts.set(m[1], n ? Number(n[1]) : 0);
    }

    const days: ContributionDay[] = [];
    for (const m of html.matchAll(/<td[^>]*data-date="([\d-]+)"[^>]*id="(contribution-day-component-\d+-\d+)"[^>]*data-level="(\d)"/g)) {
      days.push({ date: m[1], level: Number(m[3]), count: counts.get(m[2]) ?? 0 });
    }
    return toContributions(days);
  } catch {
    return null;
  }
}
