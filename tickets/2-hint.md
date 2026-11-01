## booking-v3 form prints an MM/DD/YYYY hint to day-first tenants

**Reports covered: 33** (of the 412 unique reports merged into #4471)

booking-v3's web form prints `MM/DD/YYYY` under its date field, even for tenants whose locale writes the day first. People type what the hint says, month first, and the form reads it the tenant's way. The result looks like the parser swap, but the parser fix does not touch it: the fix is in the form's hint.

- Channel: form ×33 (only the web form)
- Tenants (3, all on booking-v3): alder.physio (de-DE), copper.studio (es-ES), pale.harbour (pt-PT)
- Seen: 2026-04-17 → 2026-09-22
- Intake tagged some of these as `parser` and tagged some parser reports as `hint`, because intake guesses from the browser, not the tenant.

How counted: `src/lib/kb/problems.ts` (`splitTicket`) over `reports-4471.json`. Page: `src/routes/kb/incidents/4471-split/+page.svx`.
