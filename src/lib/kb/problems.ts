// The problems inside one merged ticket, each counted once. causes.ts says which bug a
// report's tenant and channel point to; the desk's own reading (desk-notes.json) says
// which reports describe a different failure: a date that moved by one day, not a swap.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day'];

export const PROBLEM_TITLE: Record<Problem, string> = {
  parser: 'Shared parser reads every date month first',
  hint: 'booking-v3 form prints an MM/DD/YYYY hint to day-first tenants',
  'one-day': 'Dates move by one day (time zone), not by a day/month swap',
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | 'unplaced' {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  // Reports where intake's tag (a guess from the browser) differs from the problem.
  intakeDisagrees: number;
  firstSeen: string;
  lastSeen: string;
};

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; exportRows: number; rows: ProblemRow[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemRow['problem'], Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const order = (p: ProblemRow['problem']) => (p === 'unplaced' ? 99 : PROBLEMS.indexOf(p));
  const rows = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
        intakeDisagrees: rs.filter((r) => r.meta.intakeTag !== problem).length,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => order(a.problem) - order(b.problem));
  return { merged, exportRows: all.filter((r) => r.mergedInto === ticket).length, rows };
}
