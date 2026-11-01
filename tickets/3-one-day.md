## Dates move by one day (time zone), not by a day/month swap

**Reports covered: 5** (of the 412 unique reports merged into #4471)

These reports describe a date shifted by exactly one day, not a swap: Tuesday 12 May shown as Monday 11 May; an invite that arrived before the booking was made; one meeting shown as Tuesday in Lisbon and Monday in Toronto; every June booking one day off. That is a time-zone conversion problem. Neither the parser fix nor the form hint fix touches it.

- Reports: R-41202, R-41209, R-41236, R-41344, R-41620 (the desk's own `desk-notes.json` lists them as a one-day move, but they stayed filed under the parser)
- Channels: email ×3 · app ×2
- Tenants (5): alder.physio, kettle.books, lantern.row, nine.lanterns, pale.harbour
- Seen: 2026-04-02 → 2026-10-04

How counted: `src/lib/kb/problems.ts` (`splitTicket`) over `reports-4471.json`. Page: `src/routes/kb/incidents/4471-split/+page.svx`.
