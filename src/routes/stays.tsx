import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, PageTitle, Shell, btn, btnQuiet, field } from "@/components/vesper/shell";
import {
  ROOM_TYPES,
  kes,
  nairobiYmd,
  roomOf,
  shortDate,
  type Reservation,
  type RoomType,
  type Source,
} from "@/lib/vesper/model";
import { useDesk } from "@/lib/vesper/store";

export const Route = createFileRoute("/stays")({
  component: StaysPage,
  head: () => ({ meta: [{ title: "Stays · Vesper House" }] }),
});

type Filter = "all" | "inhouse" | "arriving" | "departing" | "upcoming";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Open book" },
  { id: "inhouse", label: "In house" },
  { id: "arriving", label: "Arriving" },
  { id: "departing", label: "Departing" },
  { id: "upcoming", label: "Later" },
];

function StaysPage() {
  const data = useDesk();
  const date = nairobiYmd(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [guest, setGuest] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState(date);
  const [checkOut, setCheckOut] = useState(nairobiYmd(2));
  const [roomType, setRoomType] = useState<RoomType>("Lake");
  const [adults, setAdults] = useState(2);
  const [source, setSource] = useState<Source>("direct");
  const [notes, setNotes] = useState("");
  const [checkInNow, setCheckInNow] = useState(false);

  const rows = data.reservations.filter((res) => {
    if (res.status === "cancelled") return false;
    if (query && !res.guest.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "inhouse") return res.status === "inhouse";
    if (filter === "arriving") return res.status === "confirmed" && res.checkIn === date;
    if (filter === "departing") return res.status === "inhouse" && res.checkOut === date;
    if (filter === "upcoming") return res.status === "confirmed" && res.checkIn > date;
    return res.status !== "checkedout";
  });

  return (
    <Shell>
      <PageTitle
        kicker="Front office"
        title="The book"
        lede="Hold a room, walk someone in, or close a stay. The rack updates with the key."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <form
          className="h-fit space-y-3 rounded-2xl border border-line bg-surface p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const result = data.createStay({
              guest,
              phone,
              checkIn,
              checkOut,
              roomType,
              adults,
              source,
              notes,
              checkInNow,
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setError("");
            setGuest("");
            setPhone("");
            setNotes("");
            setCheckInNow(false);
          }}
        >
          <h2 className="font-display text-2xl">New stay</h2>
          <label className="block text-sm text-muted">
            Guest
            <input className={field + " mt-1"} value={guest} onChange={(event) => setGuest(event.target.value)} />
          </label>
          <label className="block text-sm text-muted">
            Phone
            <input className={field + " mt-1"} value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm text-muted">
              In
              <input
                type="date"
                className={field + " mt-1"}
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
              />
            </label>
            <label className="block text-sm text-muted">
              Out
              <input
                type="date"
                className={field + " mt-1"}
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm text-muted">
              Room
              <select
                className={field + " mt-1"}
                value={roomType}
                onChange={(event) => setRoomType(event.target.value as RoomType)}
              >
                {ROOM_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-muted">
              Adults
              <input
                type="number"
                min={1}
                max={6}
                className={field + " mt-1"}
                value={adults}
                onChange={(event) => setAdults(Number(event.target.value))}
              />
            </label>
          </div>
          <label className="block text-sm text-muted">
            Source
            <select
              className={field + " mt-1"}
              value={source}
              onChange={(event) => setSource(event.target.value as Source)}
            >
              <option value="direct">Direct</option>
              <option value="walkin">Walk-in</option>
              <option value="ota">OTA</option>
            </select>
          </label>
          <label className="block text-sm text-muted">
            Note
            <input className={field + " mt-1"} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={checkInNow}
              onChange={(event) => setCheckInNow(event.target.checked)}
            />
            Check in now
          </label>
          {error ? <Alert>{error}</Alert> : null}
          <button type="submit" className={btn + " w-full"}>
            Hold the room
          </button>
        </form>
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-2 overflow-x-auto">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={filter === item.id}
                  className={
                    "h-11 shrink-0 rounded-full px-4 text-sm font-medium " +
                    (filter === item.id ? "bg-ink text-surface" : "border border-line bg-surface text-muted")
                  }
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <input
              className={field + " sm:max-w-52"}
              placeholder="Search guest"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search guest"
            />
          </div>
          <ul className="mt-4 space-y-3">
            {rows.map((res) => (
              <StayCard key={res.id} res={res} />
            ))}
            {rows.length === 0 ? (
              <li className="rounded-2xl border border-line bg-surface px-4 py-6 text-sm text-muted">
                Nothing in this cut of the book.
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </Shell>
  );
}

function StayCard({ res }: { res: Reservation }) {
  const data = useDesk();
  const room = roomOf(data.rooms, res.roomId);
  const [message, setMessage] = useState("");
  return (
    <li className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">{label(res)}</p>
          <p className="mt-1 text-lg font-medium">{res.guest}</p>
          <p className="text-sm text-muted">
            {room?.number} {room?.type} · {shortDate(res.checkIn)} – {shortDate(res.checkOut)} · {res.adults}{" "}
            adults · {res.source}
          </p>
          <p className="text-sm text-muted">{res.phone}</p>
          {res.notes ? <p className="mt-1 text-sm">{res.notes}</p> : null}
          {res.status === "inhouse" ? <p className="mt-1 text-sm">Folio {kes(res.balance)}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {res.status === "confirmed" ? (
            <>
              <button
                type="button"
                className={btn}
                onClick={() => {
                  const result = data.checkIn(res.id);
                  setMessage(result.ok ? "" : result.error);
                }}
              >
                Check in
              </button>
              <button
                type="button"
                className={btnQuiet}
                onClick={() => {
                  const result = data.cancelStay(res.id);
                  setMessage(result.ok ? "" : result.error);
                }}
              >
                Cancel
              </button>
            </>
          ) : null}
          {res.status === "inhouse" && res.balance > 0 ? (
            <button type="button" className={btnQuiet} onClick={() => data.settle(res.id)}>
              Settle
            </button>
          ) : null}
          {res.status === "inhouse" ? (
            <button
              type="button"
              className={btn}
              onClick={() => {
                const result = data.checkOut(res.id);
                setMessage(result.ok ? "" : result.error);
              }}
            >
              Check out
            </button>
          ) : null}
        </div>
      </div>
      {message ? (
        <div className="mt-3">
          <Alert>{message}</Alert>
        </div>
      ) : null}
    </li>
  );
}

function label(res: Reservation) {
  if (res.status === "inhouse") return "In house";
  if (res.status === "confirmed") return "Confirmed";
  if (res.status === "checkedout") return "Checked out";
  return res.status;
}
