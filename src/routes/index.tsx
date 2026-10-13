import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useEffect, useState } from "react";
import { PageTitle, Shell, btn, btnQuiet } from "@/components/vesper/shell";
import {
  checkTotal,
  kes,
  longDate,
  metrics,
  nairobiYmd,
  occupancyWeek,
  roomOf,
  tableOf,
} from "@/lib/vesper/model";
import { useDesk } from "@/lib/vesper/store";

export const Route = createFileRoute("/")({
  component: TodayPage,
  head: () => ({ meta: [{ title: "Today · Vesper House" }] }),
});

function TodayPage() {
  const data = useDesk();
  const date = nairobiYmd(0);
  const snap = metrics(data, date);
  const departNames = snap.departures.map((res) => res.guest.split(" ")[0]).join(" & ");
  const week = occupancyWeek(snap.occPct);

  return (
    <Shell>
      <PageTitle
        kicker={`${longDate(date)} · business date`}
        title="The house today"
        lede={
          snap.stillToArrive.length || snap.departures.length
            ? `${snap.stillToArrive.length} still to arrive${
                departNames ? `. ${departNames} still to leave` : ""
              }. The Long Table has ${snap.covers} covers down and ${snap.tickets} tickets on the pass.`
            : `The book is quiet. ${snap.covers} covers are seated at the Long Table.`
        }
      />

      <section className="mt-8 grid gap-3 lg:grid-cols-4">
        <article className="rounded-2xl bg-ink p-6 text-surface lg:col-span-2">
          <p className="text-sm text-bg/80">Sellable occupancy</p>
          <p className="mt-3 font-display text-6xl leading-none">
            {snap.occPct}
            <span className="text-3xl text-bg/70">%</span>
          </p>
          <p className="mt-4 text-sm text-bg/80">
            {snap.occupiedRooms.length} of {snap.sellable.length} keys · ADR {kes(snap.adr)} · RevPAR{" "}
            {kes(snap.revpar)}
          </p>
        </article>
        <Stat label="Room revenue" value={kes(snap.roomRevenue)} detail="Tonight's occupied rates" />
        <Stat label="Long Table" value={kes(snap.fb)} detail={`${kes(snap.openValue)} still open`} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl">Movement</h2>
            <Link to="/stays" className="text-sm font-medium text-brass">
              All stays
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {snap.stillToArrive.map((res) => {
              const room = roomOf(data.rooms, res.roomId);
              return (
                <article key={res.id} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium tracking-wide text-forest uppercase">Arriving</p>
                      <p className="mt-1 text-lg font-medium">{res.guest}</p>
                      <p className="text-sm text-muted">
                        {room?.number} {room?.type} · {res.adults} guests · {res.phone}
                      </p>
                      {res.notes ? <p className="mt-1 text-sm text-muted">{res.notes}</p> : null}
                    </div>
                    <button type="button" className={btn} onClick={() => data.checkIn(res.id)}>
                      Check in
                    </button>
                  </div>
                </article>
              );
            })}
            {snap.departures.map((res) => {
              const room = roomOf(data.rooms, res.roomId);
              return (
                <article key={res.id} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium tracking-wide text-brass uppercase">Departing</p>
                      <p className="mt-1 text-lg font-medium">{res.guest}</p>
                      <p className="text-sm text-muted">
                        {room?.number} · folio {kes(res.balance)}
                        {res.notes ? ` · ${res.notes}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {res.balance > 0 ? (
                        <button type="button" className={btnQuiet} onClick={() => data.settle(res.id)}>
                          Settle
                        </button>
                      ) : null}
                      <button type="button" className={btn} onClick={() => data.checkOut(res.id)}>
                        Check out
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            {snap.stillToArrive.length === 0 && snap.departures.length === 0 ? (
              <p className="rounded-2xl border border-line bg-surface px-4 py-6 text-sm text-muted">
                No one left to arrive or leave on this business date.
              </p>
            ) : null}
          </div>
        </section>

        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="font-display text-2xl">Seven nights</h2>
            <p className="mt-1 text-sm text-muted">Occupancy, ending with today.</p>
            <WeekChart data={week} />
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl">Open checks</h2>
              <Link to="/floor" className="text-sm font-medium text-brass">
                Floor
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {snap.openChecks
                .filter((check) => check.items.length > 0)
                .map((check) => {
                  const table = tableOf(data.tables, check.tableId);
                  return (
                    <li key={check.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span>
                        <span className="font-medium">{table?.name}</span>
                        <span className="text-muted"> · {check.server}</span>
                      </span>
                      <span className="font-medium">{kes(checkTotal(check))}</span>
                    </li>
                  );
                })}
            </ul>
          </div>
          <HouseLine
            dirty={snap.dirty.length}
            ooo={data.rooms.filter((room) => room.status === "ooo").map((room) => room.number)}
            keeperLoad={snap.dirty.map((room) => `${room.number} ${room.housekeeper}`)}
          />
        </section>
      </div>
    </Shell>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-3 font-display text-3xl leading-none">{value}</p>
      <p className="mt-3 text-sm text-muted">{detail}</p>
    </article>
  );
}

function HouseLine({
  dirty,
  ooo,
  keeperLoad,
}: {
  dirty: number;
  ooo: string[];
  keeperLoad: string[];
}) {
  return (
    <div className="rounded-2xl border border-line bg-forest-soft p-4 text-forest">
      <h2 className="font-display text-2xl">Housekeeping</h2>
      <p className="mt-2 text-sm leading-6">
        {dirty === 0 ? "No dirty keys." : `${dirty} dirty: ${keeperLoad.join(", ")}.`}{" "}
        {ooo.length ? `Out of order: ${ooo.join(", ")}.` : "Every other key is in service."}
      </p>
      <Link to="/rooms" className="mt-3 inline-flex text-sm font-medium underline decoration-forest/40">
        Open the rack
      </Link>
    </div>
  );
}

function WeekChart({ data }: { data: { label: string; pct: number }[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <div className="mt-4 h-40" />;
  return (
    <div className="mt-4 h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Occupied"]}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-line)",
              borderRadius: 12,
              color: "var(--color-ink)",
            }}
          />
          <Area
            type="monotone"
            dataKey="pct"
            stroke="var(--color-brass)"
            fill="var(--color-brass-soft)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
