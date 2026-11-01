// The problems inside one merged ticket, counted the desk's way: causes.ts ties every report to
// one cause (causeOf), and each cause is one problem with one ticket. The desk's own reading
// (desk-notes.json) of a one-day move is a note on the cause the reports are filed under,
// never a ticket of its own: those reports already belong to that cause.
import { groupByCause, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint'];

export const PROBLEM_TITLE: Record<Problem, string> = {
  parser: 'Shared parser reads every date month first',
  hint: 'booking-v3 form prints an MM/DD/YYYY hint to day-first tenants',
};

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  // Reports where intake's tag (a guess from the browser) differs from the cause they are filed under.
  intakeDisagrees: number;
  // Of these, how many the desk read as a one-day move (desk-notes.json).
  readAsOneDay: number;
  firstSeen: string;
  lastSeen: string;
};

function row(problem: ProblemRow['problem'], rs: Report[], oneDayMove: readonly string[]): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    intakeDisagrees: rs.filter((r) => r.meta.intakeTag !== problem).length,
    readAsOneDay: rs.filter((r) => oneDayMove.includes(r.id)).length,
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
  const rows = groupByCause(merged, tenantOf).map((g) => row(g.cause, g.reports, oneDayMove));
  const order = (p: ProblemRow['problem']) => (p === 'unplaced' ? 99 : PROBLEMS.indexOf(p));
  rows.sort((a, b) => order(a.problem) - order(b.problem));
  return { merged, exportRows: all.filter((r) => r.mergedInto === ticket).length, rows };
}
