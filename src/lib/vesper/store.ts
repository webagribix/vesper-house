import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildReport,
  nairobiYmd,
  overlaps,
  seed,
  type Check,
  type CheckItem,
  type DeskData,
  type KitchenStage,
  type NewStay,
  type PayMethod,
  type ReportKind,
  type Reservation,
  type RoomStatus,
} from "@/lib/vesper/model";

export type Result = { ok: true } | { ok: false; error: string };

const ok = (): Result => ({ ok: true });
const fail = (error: string): Result => ({ ok: false, error });

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

type Actions = {
  checkIn: (id: string) => Result;
  checkOut: (id: string) => Result;
  settle: (id: string) => void;
  cancelStay: (id: string) => Result;
  createStay: (input: NewStay) => Result;
  setRoomStatus: (roomId: string, status: RoomStatus) => Result;
  assignKeeper: (roomId: string, name: string) => void;
  seatTable: (tableId: string, covers: number, server: string) => Result;
  releaseTable: (tableId: string) => Result;
  addItem: (checkId: string, menuId: string) => Result;
  changeQty: (checkId: string, lineId: string, delta: number) => void;
  fireCheck: (checkId: string) => Result;
  bumpKitchen: (checkId: string) => void;
  requestBill: (checkId: string) => Result;
  closeCheck: (checkId: string, method: PayMethod, reservationId?: string) => Result;
  toggleDish: (menuId: string) => void;
  kickoff: (kind: ReportKind, note: string) => string;
  resetDemo: () => void;
};

export type Desk = DeskData & Actions;

function activeStay(reservations: Reservation[], roomId: string, checkIn: string, checkOut: string) {
  return reservations.some((res) => {
    if (res.roomId !== roomId) return false;
    if (res.status === "cancelled" || res.status === "checkedout") return false;
    return overlaps(res.checkIn, res.checkOut, checkIn, checkOut);
  });
}

export const useDesk = create<Desk>()(
  persist(
    (set, get) => ({
      ...seed(),
      checkIn: (id) => {
        const res = get().reservations.find((row) => row.id === id);
        if (!res || res.status !== "confirmed") return fail("That stay is not waiting to arrive.");
        const room = get().rooms.find((row) => row.id === res.roomId);
        if (!room || room.status === "ooo") return fail("That key is out of order.");
        if (room.status === "occupied") return fail("The room still has a guest.");
        set({
          reservations: get().reservations.map((row) =>
            row.id === id ? { ...row, status: "inhouse" } : row,
          ),
          rooms: get().rooms.map((row) =>
            row.id === res.roomId ? { ...row, status: "occupied" } : row,
          ),
        });
        return ok();
      },
      checkOut: (id) => {
        const res = get().reservations.find((row) => row.id === id);
        if (!res || res.status !== "inhouse") return fail("Only an in-house guest can depart.");
        set({
          reservations: get().reservations.map((row) =>
            row.id === id ? { ...row, status: "checkedout" } : row,
          ),
          rooms: get().rooms.map((row) =>
            row.id === res.roomId ? { ...row, status: "dirty" } : row,
          ),
        });
        return ok();
      },
      settle: (id) => {
        set({
          reservations: get().reservations.map((row) =>
            row.id === id ? { ...row, balance: 0 } : row,
          ),
        });
      },
      cancelStay: (id) => {
        const res = get().reservations.find((row) => row.id === id);
        if (!res || res.status !== "confirmed") return fail("Only a confirmed stay can be cancelled.");
        set({
          reservations: get().reservations.map((row) =>
            row.id === id ? { ...row, status: "cancelled" } : row,
          ),
          rooms: get().rooms.map((row) => {
            if (row.id !== res.roomId || row.status !== "reserved") return row;
            const other = get().reservations.some(
              (stay) => stay.id !== id && stay.roomId === row.id && stay.status === "confirmed",
            );
            return other ? row : { ...row, status: "vacant" as const };
          }),
        });
        return ok();
      },
      createStay: (input) => {
        const guest = input.guest.trim();
        const phone = input.phone.trim();
        if (guest.length < 2) return fail("Add the guest's name.");
        if (phone.length < 6) return fail("Add a phone number.");
        if (input.checkOut <= input.checkIn) return fail("Check-out has to be after check-in.");
        const today = nairobiYmd(0);
        const ranked = get()
          .rooms.filter((room) => room.type === input.roomType && room.status !== "ooo")
          .filter((room) => !activeStay(get().reservations, room.id, input.checkIn, input.checkOut))
          .filter((room) => !input.checkInNow || (room.status !== "occupied" && room.status !== "reserved"))
          .slice()
          .sort((a, b) => {
            const rank: Record<RoomStatus, number> = {
              vacant: 0,
              dirty: 1,
              reserved: 2,
              occupied: 3,
              ooo: 4,
            };
            return rank[a.status] - rank[b.status] || a.number.localeCompare(b.number);
          });
        const room = ranked[0];
        if (!room) return fail(`No ${input.roomType.toLowerCase()} room is free for those nights.`);
        const next: Reservation = {
          id: uid("res"),
          guest,
          phone,
          roomId: room.id,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          adults: Math.max(1, input.adults),
          status: input.checkInNow ? "inhouse" : "confirmed",
          source: input.source,
          notes: input.notes.trim(),
          balance: 0,
        };
        set({
          reservations: [next, ...get().reservations],
          rooms: get().rooms.map((row) => {
            if (row.id !== room.id) return row;
            if (input.checkInNow) return { ...row, status: "occupied" };
            if (row.status === "vacant" && input.checkIn === today) return { ...row, status: "reserved" };
            return row;
          }),
        });
        return ok();
      },
      setRoomStatus: (roomId, status) => {
        const room = get().rooms.find((row) => row.id === roomId);
        if (!room) return fail("Unknown room.");
        if (room.status === "occupied") return fail("Check the guest out before changing the key.");
        if (status === "occupied") return fail("Occupancy comes from a check-in.");
        set({
          rooms: get().rooms.map((row) => (row.id === roomId ? { ...row, status } : row)),
        });
        return ok();
      },
      assignKeeper: (roomId, name) => {
        set({
          rooms: get().rooms.map((row) =>
            row.id === roomId ? { ...row, housekeeper: name } : row,
          ),
        });
      },
      seatTable: (tableId, covers, server) => {
        const table = get().tables.find((row) => row.id === tableId);
        if (!table || table.status !== "open") return fail("That table is already sat.");
        const seats = Math.max(1, Math.min(covers, table.seats));
        const checkId = uid("chk");
        const check: Check = {
          id: checkId,
          tableId,
          status: "open",
          items: [],
          openedAt: new Date().toISOString(),
          server,
          kitchen: "none",
        };
        set({
          checks: [...get().checks, check],
          tables: get().tables.map((row) =>
            row.id === tableId
              ? { ...row, status: "seated", covers: seats, server, checkId }
              : row,
          ),
        });
        return ok();
      },
      releaseTable: (tableId) => {
        const table = get().tables.find((row) => row.id === tableId);
        if (!table?.checkId) return fail("Nothing to clear.");
        const check = get().checks.find((row) => row.id === table.checkId);
        if (check && check.items.length > 0 && check.status === "open") {
          return fail("Close the check, or void it by clearing items first.");
        }
        set({
          checks: get().checks.filter((row) => row.id !== table.checkId || row.status === "closed"),
          tables: get().tables.map((row) =>
            row.id === tableId
              ? { ...row, status: "open", covers: 0, server: "", checkId: null }
              : row,
          ),
        });
        return ok();
      },
      addItem: (checkId, menuId) => {
        const check = get().checks.find((row) => row.id === checkId);
        const dish = get().menu.find((row) => row.id === menuId);
        if (!check || check.status !== "open") return fail("That check is closed.");
        if (!dish || !dish.available) return fail("That dish is 86.");
        const items = check.items.slice();
        const openLine = items.find((line) => line.menuId === menuId && !line.fired);
        if (openLine) openLine.qty += 1;
        else {
          const line: CheckItem = {
            id: uid("line"),
            menuId: dish.id,
            name: dish.name,
            price: dish.price,
            qty: 1,
            station: dish.station,
            fired: false,
          };
          items.push(line);
        }
        set({
          checks: get().checks.map((row) => (row.id === checkId ? { ...row, items } : row)),
        });
        return ok();
      },
      changeQty: (checkId, lineId, delta) => {
        set({
          checks: get().checks.map((row) => {
            if (row.id !== checkId) return row;
            const items = row.items
              .map((line) => {
                if (line.id !== lineId || line.fired) return line;
                return { ...line, qty: line.qty + delta };
              })
              .filter((line) => line.qty > 0);
            return { ...row, items };
          }),
        });
      },
      fireCheck: (checkId) => {
        const check = get().checks.find((row) => row.id === checkId);
        if (!check || check.status !== "open") return fail("That check is closed.");
        if (!check.items.some((line) => !line.fired)) return fail("Nothing new to send.");
        const items = check.items.map((line) => ({ ...line, fired: true }));
        set({
          checks: get().checks.map((row) =>
            row.id === checkId ? { ...row, items, kitchen: "queued" as KitchenStage } : row,
          ),
          tables: get().tables.map((row) =>
            row.checkId === checkId && row.status !== "bill" ? { ...row, status: "ordered" } : row,
          ),
        });
        return ok();
      },
      bumpKitchen: (checkId) => {
        const check = get().checks.find((row) => row.id === checkId);
        if (!check) return;
        const next: KitchenStage =
          check.kitchen === "queued" ? "pass" : check.kitchen === "pass" ? "done" : check.kitchen;
        set({
          checks: get().checks.map((row) => (row.id === checkId ? { ...row, kitchen: next } : row)),
        });
      },
      requestBill: (checkId) => {
        const check = get().checks.find((row) => row.id === checkId);
        if (!check || check.status !== "open") return fail("That check is closed.");
        if (check.items.length === 0) return fail("The table has not ordered.");
        const hadUnfired = check.items.some((line) => !line.fired);
        set({
          checks: get().checks.map((row) =>
            row.id === checkId
              ? {
                  ...row,
                  items: row.items.map((line) => ({ ...line, fired: true })),
                  kitchen: hadUnfired ? "queued" : row.kitchen,
                }
              : row,
          ),
          tables: get().tables.map((row) =>
            row.checkId === checkId ? { ...row, status: "bill" } : row,
          ),
        });
        return ok();
      },
      closeCheck: (checkId, method, reservationId) => {
        const check = get().checks.find((row) => row.id === checkId);
        if (!check || check.status !== "open") return fail("That check is already closed.");
        if (check.items.length === 0) return fail("Nothing to close.");
        if (check.kitchen === "queued" || check.kitchen === "pass") {
          return fail("The kitchen still has this ticket.");
        }
        const total = check.items.reduce((sum, line) => sum + line.price * line.qty, 0);
        if (method === "room") {
          const stay = get().reservations.find(
            (row) => row.id === reservationId && row.status === "inhouse",
          );
          if (!stay) return fail("Choose an in-house guest.");
          set({
            reservations: get().reservations.map((row) =>
              row.id === stay.id ? { ...row, balance: row.balance + total } : row,
            ),
            checks: get().checks.map((row) =>
              row.id === checkId
                ? {
                    ...row,
                    status: "closed" as const,
                    closedOn: nairobiYmd(0),
                    payMethod: method,
                    reservationId: stay.id,
                  }
                : row,
            ),
            tables: get().tables.map((row) =>
              row.checkId === checkId
                ? { ...row, status: "open" as const, covers: 0, server: "", checkId: null }
                : row,
            ),
          });
          return ok();
        }
        set({
          checks: get().checks.map((row) =>
            row.id === checkId
              ? { ...row, status: "closed" as const, closedOn: nairobiYmd(0), payMethod: method }
              : row,
          ),
          tables: get().tables.map((row) =>
            row.checkId === checkId
              ? { ...row, status: "open" as const, covers: 0, server: "", checkId: null }
              : row,
          ),
        });
        return ok();
      },
      toggleDish: (menuId) => {
        set({
          menu: get().menu.map((dish) =>
            dish.id === menuId ? { ...dish, available: !dish.available } : dish,
          ),
        });
      },
      kickoff: (kind, note) => {
        const report = buildReport(
          {
            rooms: get().rooms,
            reservations: get().reservations,
            tables: get().tables,
            menu: get().menu,
            checks: get().checks,
            reports: get().reports,
          },
          kind,
          note.trim(),
        );
        set({ reports: [report, ...get().reports] });
        return report.id;
      },
      resetDemo: () => set(seed()),
    }),
    { name: "vesper-house-desk-v1", skipHydration: true },
  ),
);
