# Vesper House

Operations desk for an 18-key hotel and its restaurant. Kickoff for [webagribix/vesper-house](https://github.com/webagribix/vesper-house), 14 October 2026.

The sample property is **Vesper House, Naivasha**: garden rooms, lake rooms, two suites, and **the Long Table**.

## What the first cut covers

| Desk | What you can do |
| --- | --- |
| Today | Occupancy, ADR, RevPAR, arrivals, departures, open checks |
| Rooms | Rack by floor, housekeeping, out of order, check-in and check-out |
| Stays | Hold a room, walk-in, cancel, settle a folio |
| Long Table | Seat, order, 86 a dish, send, bill, close to cash, card, or a room |
| Kitchen pass | Queue, fire, clear |
| Reports | Kick off a night audit, occupancy, food & beverage, or movement sheet |

Figures are in Kenyan shillings. A sample night audit from the previous business date is already on file.

## How the data behaves

This kickoff keeps the book **in the browser** (no staff accounts yet). Names and phone numbers in the sample day are fictional. Use **Restore sample day** to put the house back.

Guest folios, room status, and checks stay on this device until accounts are added. Do not put real guest records in this cut.

## Source map

- `src/lib/vesper/model.ts` — rooms, stays, menu, checks, and the report snapshot
- `src/lib/vesper/store.ts` — the desk actions
- `src/routes/` — Today, rooms, stays, floor, kitchen, reports
- `src/components/vesper/shell.tsx` — the rail
- `KICKOFF.md` — the kickoff report

## Out of scope

Channel manager, card acquiring, payroll, stock, and more than one property. Those wait until the desk has accounts.
