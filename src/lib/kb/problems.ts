// The problems inside one merged ticket, counted the desk's way. causes.ts files every report
// under its tenant's cause (groupByCause, as CauseTable shows it). The desk's own reading
// (desk-notes.json) names reports that describe a different failure, a date moved by one day:
// they stay counted where they are filed, and they are also counted as their own problem.
import { groupByCause, readAs, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day'];

export const PROBLEM_TITLE: Record<Problem, string> = {
  parser: 'Shared parser reads every date month first',
  hint: 'booking-v3 form prints an MM/DD/YYYY hint to day-first tenants',
  'one-day': 'Dates move by one day (time zone), not by a day/month swap',
};

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  // Reports where intake's tag (a guess from the browser) differs from the cause they are filed under.
  intakeDisagrees: number;
  // one-day only: where these reports are filed, cause → count.
  filedUnder?: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

function row(problem: ProblemRow['problem'], rs: Report[], filedAs: (r: Report) => string): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    intakeDisagrees: rs.filter((r) => r.meta.intakeTag !== filedAs(r)).length,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; exportRows: number; rows: ProblemRow[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const causeOfId = new Map(groups.flatMap((g) => g.reports.map((r) => [r.id, g.cause] as const)));
  const filedAs = (r: Report) => causeOfId.get(r.id) ?? 'unplaced';
  const rows = groups.map((g) => row(g.cause, g.reports, filedAs));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const oneDay = row('one-day', moved, filedAs);
    oneDay.filedUnder = Object.fromEntries(groups.filter((g) => readAs(g, oneDayMove)).map((g) => [g.cause, readAs(g, oneDayMove)]));
    rows.push(oneDay);
  }
  const order = (p: ProblemRow['problem']) => (p === 'unplaced' ? 99 : PROBLEMS.indexOf(p));
  rows.sort((a, b) => order(a.problem) - order(b.problem));
  return { merged, exportRows: all.filter((r) => r.mergedInto === ticket).length, rows };
}
