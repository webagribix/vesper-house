# Kickoff report — Vesper House

**Date:** 14 October 2026
**Repo:** [webagribix/vesper-house](https://github.com/webagribix/vesper-house)
**Property in the sample:** Vesper House, Naivasha — 18 keys and the Long Table

## Why this exists

Front office, housekeeping, and the restaurant are one house. The first cut is a single desk so a stay, a dirty room, and a table check can see each other. A night audit is something you kick off, not a spreadsheet rebuilt at midnight.

## What we are shipping now

1. **Today** — sellable occupancy, room revenue, ADR, RevPAR, who is still to arrive, who is still to leave, open checks.
2. **Rooms** — garden, lake, and suite rack. Mark clean, dirty, or out of order. Room 208 starts out of order (lake pump).
3. **Stays** — hold a free room of a type for a date range, walk someone in, cancel a confirmed stay, settle incidentals, check out to housekeeping.
4. **Long Table** — terrace, dining room, and bar. Seat, send to the pass, bill, close to cash, card, or an in-house folio. 86 a dish from the board.
5. **Kitchen pass** — queue, on the pass, cleared. Drinks ride the same rail and are marked as bar.
6. **Reports** — kick off a frozen sheet: night audit, occupancy, food & beverage, or arrivals & departures. The sheet does not move when the floor does. Yesterday's audit is already filed.

## Sample day

Nine keys are in house at the open (ten if you check Naomi Wanjiru into 104). Priya Shah and James Okello are due out. Lars Berg is due into suite 302. The Long Table already has covers, including a goat shoulder on the pass and a bill down on Terrace 3.

Rates in the sample: Garden Ksh 14,500, Lake Ksh 22,000, Suite Ksh 48,000.

## Decisions

- One property, one business date, Nairobi time.
- Checkout morning frees the room the same date. A departure and an arrival can share a key.
- Room revenue on the audit is occupied nightly rate, not the folio. Incidentals and the Long Table are separate.
- A check cannot close while the kitchen still holds the ticket.
- No accounts in this kickoff. The book is on the device. Real guest data does not belong here yet.

## Not in this kickoff

OTA two-way sync, payments, inventory, staff rotas, multi-property, and printing beyond the sheet on screen.

## Next, if we continue

Staff sign-in, then a shared book. Until then, **Restore sample day** is the reset.
