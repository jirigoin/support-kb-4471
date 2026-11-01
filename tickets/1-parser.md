## Shared parser reads every date month first

**Reports covered: 379** (of the 412 unique reports merged into #4471, counted with the desk's cause table)

The shared date parser reads every date month first. Tenants whose locale writes the day first get day and month swapped: a booking for 7 April arrives as 4 July. This is the bug #4471 names, and the queued parser fix addresses it.

- Channels: app ×204 · email ×150 · form ×25
- Tenants (11): alder.physio, copper.studio, harbour.dental, kettle.books, lantern.row, long.table, morrow.tax, nine.lanterns, pale.harbour, ridge.clinic, stone.and.sons
- Seen: 2026-04-01 → 2026-10-04
- Rule (`causeOf` in `src/lib/kb/causes.ts`): the tenant's locale is day-first, and the report did not come through a booking-v3 form.
- 5 of these the desk read as a one-day move; they are also counted in #3.

How counted: `src/lib/kb/problems.ts` (`splitTicket`) over `reports-4471.json`, one report per id (the export repeats 15 rows). Page: `src/routes/kb/incidents/4471-split/+page.svx`.
