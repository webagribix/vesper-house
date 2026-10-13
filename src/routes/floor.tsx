import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, PageTitle, Shell, btn, btnQuiet, field } from "@/components/vesper/shell";
import {
  SERVERS,
  checkTotal,
  kes,
  type DiningTable,
  type MenuCategory,
  type Zone,
} from "@/lib/vesper/model";
import { useDesk } from "@/lib/vesper/store";

export const Route = createFileRoute("/floor")({
  component: FloorPage,
  head: () => ({ meta: [{ title: "Long Table · Vesper House" }] }),
});

const ZONES: Zone[] = ["Terrace", "Dining room", "Bar"];
const CATEGORIES: MenuCategory[] = ["Small plates", "Mains", "Grill", "Dessert", "Drinks"];

function FloorPage() {
  const data = useDesk();
  const firstBusy = data.tables.find((table) => table.status !== "open")?.id ?? data.tables[0].id;
  const [selected, setSelected] = useState(firstBusy);
  const table = data.tables.find((row) => row.id === selected) ?? data.tables[0];

  return (
    <Shell>
      <PageTitle
        kicker="The Long Table"
        title="Floor"
        lede="Seat a table, send the order, and close it to cash, card, or a room folio."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {ZONES.map((zone) => (
            <section key={zone}>
              <h2 className="text-sm font-medium text-muted">{zone}</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {data.tables
                  .filter((row) => row.zone === zone)
                  .map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => setSelected(row.id)}
                      className={
                        "min-h-28 rounded-2xl border p-3 text-left " +
                        tone(row) +
                        (table.id === row.id ? " outline-2 outline-offset-2 outline-brass" : "")
                      }
                    >
                      <span className="block font-display text-xl">{row.name}</span>
                      <span className="mt-2 block text-sm capitalize">{row.status}</span>
                      <span className="block text-xs text-muted">
                        {row.status === "open"
                          ? `${row.seats} seats`
                          : `${row.covers} covers · ${row.server}`}
                      </span>
                    </button>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <TablePanel table={table} />
      </div>
    </Shell>
  );
}

function tone(table: DiningTable) {
  if (table.status === "bill") return "border-brass/40 bg-brass-soft";
  if (table.status === "ordered") return "border-forest/30 bg-forest-soft";
  if (table.status === "seated") return "border-line bg-surface";
  return "border-line bg-bg text-muted";
}

function TablePanel({ table }: { table: DiningTable }) {
  const data = useDesk();
  const check = data.checks.find((row) => row.id === table.checkId && row.status === "open");
  const [covers, setCovers] = useState(2);
  const [server, setServer] = useState<(typeof SERVERS)[number]>("Amina");
  const [method, setMethod] = useState<"cash" | "card" | "room">("cash");
  const [roomGuest, setRoomGuest] = useState("");
  const [error, setError] = useState("");
  const inhouse = data.reservations.filter((res) => res.status === "inhouse");

  const run = (result: { ok: boolean; error?: string }) => {
    setError(result.ok ? "" : result.error ?? "Could not update the table.");
  };

  return (
    <aside className="h-fit rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">{table.zone}</p>
      <h2 className="font-display text-3xl">{table.name}</h2>
      {table.status === "open" ? (
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            run(data.seatTable(table.id, covers, server));
          }}
        >
          <p className="text-sm text-muted">Open. Seat it to start a check.</p>
          <label className="block text-sm text-muted">
            Covers
            <input
              type="number"
              min={1}
              max={table.seats}
              className={field + " mt-1"}
              value={covers}
              onChange={(event) => setCovers(Number(event.target.value))}
            />
          </label>
          <label className="block text-sm text-muted">
            Server
            <select
              className={field + " mt-1"}
              value={server}
              onChange={(event) => setServer(event.target.value as (typeof SERVERS)[number])}
            >
              {SERVERS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className={btn + " w-full"}>
            Seat table
          </button>
        </form>
      ) : null}
      {check ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted">
            {table.covers} covers · {check.server}
            {check.kitchen !== "none" ? ` · pass ${check.kitchen}` : ""}
          </p>
          <ul className="space-y-2">
            {check.items.map((line) => (
              <li key={line.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {line.qty} × {line.name}
                  {!line.fired ? <span className="text-muted"> · not sent</span> : null}
                </span>
                <span className="flex items-center gap-2">
                  {kes(line.price * line.qty)}
                  {!line.fired ? (
                    <button
                      type="button"
                      className="h-11 px-2 text-muted"
                      aria-label={`Remove one ${line.name}`}
                      onClick={() => data.changeQty(check.id, line.id, -1)}
                    >
                      −
                    </button>
                  ) : null}
                </span>
              </li>
            ))}
            {check.items.length === 0 ? <li className="text-sm text-muted">No order yet.</li> : null}
          </ul>
          <p className="text-sm font-medium">Total {kes(checkTotal(check))}</p>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {CATEGORIES.map((category) => (
              <div key={category}>
                <p className="text-xs font-medium tracking-wide text-muted uppercase">{category}</p>
                <div className="mt-1 flex flex-col">
                  {data.menu
                    .filter((dish) => dish.category === category)
                    .map((dish) => (
                      <button
                        key={dish.id}
                        type="button"
                        disabled={!dish.available}
                        className="flex min-h-11 items-center justify-between gap-3 border-b border-line py-2 text-left text-sm disabled:text-muted"
                        onClick={() => run(data.addItem(check.id, dish.id))}
                      >
                        <span>
                          {dish.name}
                          {!dish.available ? " · 86" : ""}
                        </span>
                        <span>{kes(dish.price)}</span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => run(data.fireCheck(check.id))}>
              Send
            </button>
            <button type="button" className={btnQuiet} onClick={() => run(data.requestBill(check.id))}>
              Bill
            </button>
            {check.items.length === 0 ? (
              <button type="button" className={btnQuiet} onClick={() => run(data.releaseTable(table.id))}>
                Clear
              </button>
            ) : null}
          </div>
          <div className="space-y-2 border-t border-line pt-3">
            <p className="text-sm font-medium">Close check</p>
            <div className="grid grid-cols-3 gap-2">
              {(["cash", "card", "room"] as const).map((way) => (
                <button
                  key={way}
                  type="button"
                  aria-pressed={method === way}
                  className={
                    "h-11 rounded-xl text-sm font-medium capitalize " +
                    (method === way ? "bg-ink text-surface" : "border border-line")
                  }
                  onClick={() => setMethod(way)}
                >
                  {way}
                </button>
              ))}
            </div>
            {method === "room" ? (
              <select
                className={field}
                value={roomGuest}
                onChange={(event) => setRoomGuest(event.target.value)}
                aria-label="Charge to guest"
              >
                <option value="">In-house guest</option>
                {inhouse.map((res) => {
                  const room = data.rooms.find((row) => row.id === res.roomId);
                  return (
                    <option key={res.id} value={res.id}>
                      {room?.number} {res.guest}
                    </option>
                  );
                })}
              </select>
            ) : null}
            <button
              type="button"
              className={btn + " w-full"}
              onClick={() => run(data.closeCheck(check.id, method, roomGuest || undefined))}
            >
              Take payment
            </button>
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="mt-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      <div className="mt-5 border-t border-line pt-3">
        <p className="text-sm font-medium">86 board</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {data.menu.map((dish) => (
            <button
              key={dish.id}
              type="button"
              aria-pressed={!dish.available}
              className={
                "h-11 rounded-full px-3 text-sm " +
                (dish.available ? "border border-line text-muted" : "bg-brass text-surface")
              }
              onClick={() => data.toggleDish(dish.id)}
            >
              {dish.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
