<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { PROBLEM_TITLE, splitTicket } from '#lib/kb/problems';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // issues: problem → URL of its own ticket.
  let { ticket, issues = {} }: { ticket: number; issues?: Record<string, string> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const chans = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k} ×${n}`)
      .join(' · ');
  const num = (url: string) => url.split('/').pop();
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports in #{ticket}
  ({split.exportRows - split.merged.length} repeated rows in the export, counted once) ·
  <strong>{split.rows.length}</strong>
  {split.rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>channels</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.rows as row (row.problem)}
      <tr>
        <td><code>{row.problem}</code><br /><span class="title">{PROBLEM_TITLE[row.problem as keyof typeof PROBLEM_TITLE] ?? 'no tenant on file'}</span></td>
        <td><strong>{row.reports.length}</strong></td>
        <td class="small">{chans(row.channels)}</td>
        <td class="small">{row.tenants.length}: {row.tenants.join(', ')}</td>
        <td class="small">{row.firstSeen} → {row.lastSeen}</td>
        <td>{#if issues[row.problem]}<a href={issues[row.problem]}>#{num(issues[row.problem])}</a>{:else}<span class="none">none yet</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="small">
  Intake tagged {split.rows.reduce((n, r) => n + r.intakeDisagrees, 0)} of these reports with a different
  cause than the one their tenant and channel point to.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .title { color: var(--muted); font-size: 0.85em; }
  .small { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
</style>
