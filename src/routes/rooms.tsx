import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, PageTitle, Shell, btn, btnQuiet, field } from "@/components/vesper/shell";
import {
  KEEPERS,
  STATUS_LABEL,
  holdingStay,
  inhouseFor,
  kes,
  nairobiYmd,
  shortDate,
  type Room,
  type RoomStatus,
} from "@/lib/vesper/model";
import { useDesk } from "@/lib/vesper/store";

export const Route = createFileRoute("/rooms")({
  component: RoomsPage,
  head: () => ({ meta: [{ title: "Rooms · Vesper House" }] }),
});

const FILTERS: { id: "all" | RoomStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "occupied", label: "Occupied" },
  { id: "vacant", label: "Vacant" },
  { id: "reserved", label: "Reserved" },
  { id: "dirty", label: "Dirty" },
  { id: "ooo", label: "Out of order" },
];

function RoomsPage() {
  const data = useDesk();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [selected, setSelected] = useState("room-104");
  const [error, setError] = useState("");
  const date = nairobiYmd(0);
  const floors = [1, 2, 3];
  const visible = data.rooms.filter((room) => filter === "all" || room.status === filter);
  const room = data.rooms.find((row) => row.id === selected) ?? visible[0];

  return (
    <Shell>
      <PageTitle
        kicker="Rack"
        title="Eighteen keys"
        lede="Garden on the ground, lake rooms above, two suites under the eaves. Room 208 is waiting on the pump."
      />
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
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
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {floors.map((floor) => {
            const rooms = visible.filter((row) => row.floor === floor);
            if (rooms.length === 0) return null;
            return (
              <section key={floor}>
                <h2 className="text-sm font-medium text-muted">
                  {floor === 1 ? "Garden floor" : floor === 2 ? "Lake floor" : "Suites"}
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {rooms.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => {
                        setSelected(row.id);
                        setError("");
                      }}
                      className={tileClass(row.status, room?.id === row.id)}
                    >
                      <span className="font-display text-2xl">{row.number}</span>
                      <span className="mt-2 text-sm">{STATUS_LABEL[row.status]}</span>
                      <span className="text-xs text-muted">{guestLine(row, data.reservations, date)}</span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        {room ? (
          <RoomPanel
            room={room}
            error={error}
            onError={setError}
          />
        ) : (
          <p className="text-sm text-muted">No keys in this filter.</p>
        )}
      </div>
    </Shell>
  );
}

function guestLine(
  room: Room,
  reservations: ReturnType<typeof useDesk.getState>["reservations"],
  date: string,
) {
  const guest = inhouseFor(reservations, room.id);
  if (guest) return guest.guest;
  const hold = reservations.find(
    (res) => res.roomId === room.id && res.status === "confirmed" && res.checkIn === date,
  );
  if (hold) return hold.guest;
  return room.housekeeper;
}

function tileClass(status: RoomStatus, on: boolean) {
  const tone =
    status === "occupied"
      ? "border-brass/40 bg-brass-soft"
      : status === "reserved"
        ? "border-forest/30 bg-forest-soft"
        : status === "dirty"
          ? "border-line bg-bg"
          : "border-line bg-surface";
  return (
    "flex min-h-28 flex-col items-start rounded-2xl border p-3 text-left " +
    tone +
    (on ? " outline-2 outline-offset-2 outline-brass" : "")
  );
}

function RoomPanel({
  room,
  error,
  onError,
}: {
  room: Room;
  error: string;
  onError: (value: string) => void;
}) {
  const data = useDesk();
  const date = nairobiYmd(0);
  const guest = inhouseFor(data.reservations, room.id);
  const hold = holdingStay(data.reservations, room.id);
  const act = (result: { ok: boolean; error?: string }) => {
    onError(result.ok ? "" : result.error ?? "Could not update the room.");
  };

  return (
    <aside className="h-fit rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">{room.type}</p>
      <h2 className="font-display text-4xl">{room.number}</h2>
      <p className="mt-1 text-sm text-muted">
        {STATUS_LABEL[room.status]} · {kes(room.rate)} / night
      </p>
      {guest ? (
        <div className="mt-4 rounded-xl bg-bg p-3">
          <p className="font-medium">{guest.guest}</p>
          <p className="text-sm text-muted">
            In house until {shortDate(guest.checkOut)} · {guest.phone}
          </p>
          <p className="mt-1 text-sm">Folio {kes(guest.balance)}</p>
          {guest.notes ? <p className="mt-1 text-sm text-muted">{guest.notes}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {guest.balance > 0 ? (
              <button type="button" className={btnQuiet} onClick={() => data.settle(guest.id)}>
                Settle folio
              </button>
            ) : null}
            <button type="button" className={btn} onClick={() => act(data.checkOut(guest.id))}>
              Check out
            </button>
          </div>
        </div>
      ) : null}
      {hold ? (
        <div className="mt-4 rounded-xl bg-forest-soft p-3 text-forest">
          <p className="font-medium">{hold.guest}</p>
          <p className="text-sm">
            {shortDate(hold.checkIn)} – {shortDate(hold.checkOut)} · {hold.phone}
          </p>
          {hold.notes ? <p className="mt-1 text-sm">{hold.notes}</p> : null}
          {hold.checkIn <= date ? (
            <button type="button" className={btn + " mt-3"} onClick={() => act(data.checkIn(hold.id))}>
              Check in
            </button>
          ) : (
            <p className="mt-2 text-sm">Held for a later arrival.</p>
          )}
        </div>
      ) : null}
      {!guest ? (
        <div className="mt-4 space-y-2">
          {room.status === "dirty" ? (
            <button
              type="button"
              className={btn + " w-full"}
              onClick={() =>
                act(data.setRoomStatus(room.id, hold && hold.checkIn <= date ? "reserved" : "vacant"))
              }
            >
              Mark clean
            </button>
          ) : null}
          {room.status !== "dirty" && room.status !== "ooo" ? (
            <button
              type="button"
              className={btnQuiet + " w-full"}
              onClick={() => act(data.setRoomStatus(room.id, "dirty"))}
            >
              Mark dirty
            </button>
          ) : null}
          {room.status === "ooo" ? (
            <button
              type="button"
              className={btn + " w-full"}
              onClick={() => act(data.setRoomStatus(room.id, "vacant"))}
            >
              Return to service
            </button>
          ) : (
            <button
              type="button"
              className={btnQuiet + " w-full"}
              onClick={() => act(data.setRoomStatus(room.id, "ooo"))}
            >
              Out of order
            </button>
          )}
        </div>
      ) : null}
      <label className="mt-4 block text-sm text-muted" htmlFor="keeper">
        Housekeeper
      </label>
      <select
        id="keeper"
        className={field + " mt-1"}
        value={room.housekeeper}
        onChange={(event) => data.assignKeeper(room.id, event.target.value)}
      >
        {KEEPERS.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>
      {error ? (
        <div className="mt-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
    </aside>
  );
}
