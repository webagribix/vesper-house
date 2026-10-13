export type RoomType = "Garden" | "Lake" | "Suite";
export type RoomStatus = "vacant" | "occupied" | "dirty" | "reserved" | "ooo";
export type StayStatus = "confirmed" | "inhouse" | "checkedout" | "cancelled";
export type Source = "direct" | "walkin" | "ota";
export type Zone = "Terrace" | "Dining room" | "Bar";
export type TableStatus = "open" | "seated" | "ordered" | "bill";
export type MenuCategory = "Small plates" | "Mains" | "Grill" | "Dessert" | "Drinks";
export type Station = "kitchen" | "bar";
export type PayMethod = "cash" | "card" | "room";
export type KitchenStage = "none" | "queued" | "pass" | "done";
export type ReportKind = "night-audit" | "occupancy" | "fb" | "movement";

export type Room = {
  id: string;
  number: string;
  type: RoomType;
  floor: number;
  rate: number;
  status: RoomStatus;
  housekeeper: string;
};

export type Reservation = {
  id: string;
  guest: string;
  phone: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  status: StayStatus;
  source: Source;
  notes: string;
  balance: number;
};

export type DiningTable = {
  id: string;
  name: string;
  seats: number;
  zone: Zone;
  status: TableStatus;
  covers: number;
  server: string;
  checkId: string | null;
};

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  available: boolean;
  blurb: string;
  station: Station;
};

export type CheckItem = {
  id: string;
  menuId: string;
  name: string;
  price: number;
  qty: number;
  station: Station;
  fired: boolean;
};

export type Check = {
  id: string;
  tableId: string;
  status: "open" | "closed";
  items: CheckItem[];
  openedAt: string;
  closedOn?: string;
  server: string;
  kitchen: KitchenStage;
  payMethod?: PayMethod;
  reservationId?: string;
};

export type ReportLine = { left: string; right: string };

export type Report = {
  id: string;
  kind: ReportKind;
  title: string;
  kickedOffAt: string;
  businessDate: string;
  note: string;
  headline: string;
  metrics: { label: string; value: string }[];
  lines: ReportLine[];
};

export type DeskData = {
  rooms: Room[];
  reservations: Reservation[];
  tables: DiningTable[];
  menu: MenuItem[];
  checks: Check[];
  reports: Report[];
};

export type NewStay = {
  guest: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  roomType: RoomType;
  adults: number;
  source: Source;
  notes: string;
  checkInNow: boolean;
};

export const SERVERS = ["Amina", "Joel", "Wanjiku"] as const;
export const KEEPERS = ["Grace", "Peter", "Halima"] as const;
export const ROOM_TYPES: RoomType[] = ["Garden", "Lake", "Suite"];

export const STATUS_LABEL: Record<RoomStatus, string> = {
  vacant: "Vacant",
  occupied: "Occupied",
  dirty: "Dirty",
  reserved: "Reserved",
  ooo: "Out of order",
};

export const REPORT_TITLES: Record<ReportKind, string> = {
  "night-audit": "Night audit",
  occupancy: "Occupancy",
  fb: "Food & beverage",
  movement: "Arrivals & departures",
};

export function nairobiYmd(offset = 0) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = fmt.format(new Date());
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offset));
  return dt.toISOString().slice(0, 10);
}

export function longDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function shortDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function kes(n: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(n);
}

export function overlaps(aIn: string, aOut: string, bIn: string, bOut: string) {
  return aIn < bOut && bIn < aOut;
}

export function checkTotal(check: Check) {
  return check.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function roomOf(rooms: Room[], id: string) {
  return rooms.find((room) => room.id === id);
}

export function tableOf(tables: DiningTable[], id: string) {
  return tables.find((table) => table.id === id);
}

export function inhouseFor(reservations: Reservation[], roomId: string) {
  return reservations.find((res) => res.roomId === roomId && res.status === "inhouse");
}

export function holdingStay(reservations: Reservation[], roomId: string) {
  return reservations.find((res) => res.roomId === roomId && res.status === "confirmed");
}

const MENU: MenuItem[] = [
  { id: "avocado", name: "Chili avocado", category: "Small plates", price: 900, available: true, blurb: "Lime, chili, lake salt", station: "kitchen" },
  { id: "fingers", name: "Lake fish fingers", category: "Small plates", price: 1400, available: true, blurb: "Tilapia, chili mayo", station: "kitchen" },
  { id: "chapati", name: "Warm chapati", category: "Small plates", price: 400, available: true, blurb: "Butter, dhania", station: "kitchen" },
  { id: "tilapia", name: "Smoked tilapia", category: "Mains", price: 2200, available: true, blurb: "Ugali, sukuma, kachumbari", station: "kitchen" },
  { id: "beans", name: "Coconut bean stew", category: "Mains", price: 1800, available: true, blurb: "Rice, lime pickle", station: "kitchen" },
  { id: "choma", name: "Nyama choma platter", category: "Mains", price: 3400, available: true, blurb: "Goat, ugali, kachumbari", station: "kitchen" },
  { id: "chicken", name: "Chicken & muhogo", category: "Mains", price: 2100, available: true, blurb: "Roast chicken, cassava", station: "kitchen" },
  { id: "mishkaki", name: "Beef mishkaki", category: "Grill", price: 1900, available: true, blurb: "Two skewers, pilau", station: "kitchen" },
  { id: "goat", name: "Goat shoulder", category: "Grill", price: 4200, available: true, blurb: "Slow, for the table", station: "kitchen" },
  { id: "mandazi", name: "Mandazi & cream", category: "Dessert", price: 800, available: true, blurb: "Cardamom cream", station: "kitchen" },
  { id: "mango", name: "Mango panna cotta", category: "Dessert", price: 1100, available: true, blurb: "Passion syrup", station: "kitchen" },
  { id: "coffee", name: "Kenyan coffee", category: "Drinks", price: 450, available: true, blurb: "Filter, hot", station: "bar" },
  { id: "dawa", name: "Dawa", category: "Drinks", price: 700, available: true, blurb: "Honey, lime, ginger", station: "bar" },
  { id: "passion", name: "Passion cooler", category: "Drinks", price: 600, available: true, blurb: "No spirit", station: "bar" },
  { id: "tusker", name: "Tusker", category: "Drinks", price: 500, available: true, blurb: "Cold bottle", station: "bar" },
  { id: "red", name: "House red", category: "Drinks", price: 1200, available: true, blurb: "Glass", station: "bar" },
];

function item(menuId: string, qty: number, fired: boolean, line: string): CheckItem {
  const dish = MENU.find((row) => row.id === menuId);
  if (!dish) throw new Error(`Missing menu ${menuId}`);
  return {
    id: line,
    menuId,
    name: dish.name,
    price: dish.price,
    qty,
    station: dish.station,
    fired,
  };
}

function stay(
  id: string,
  guest: string,
  phone: string,
  room: string,
  inOff: number,
  outOff: number,
  adults: number,
  status: StayStatus,
  source: Source,
  notes: string,
  balance: number,
): Reservation {
  return {
    id,
    guest,
    phone,
    roomId: `room-${room}`,
    checkIn: nairobiYmd(inOff),
    checkOut: nairobiYmd(outOff),
    adults,
    status,
    source,
    notes,
    balance,
  };
}

export function metrics(data: DeskData, date = nairobiYmd(0)) {
  const sellable = data.rooms.filter((room) => room.status !== "ooo");
  const occupiedRooms = data.rooms.filter((room) => room.status === "occupied");
  const dirty = data.rooms.filter((room) => room.status === "dirty");
  const ooo = data.rooms.filter((room) => room.status === "ooo");
  const roomRevenue = occupiedRooms.reduce((sum, room) => sum + room.rate, 0);
  const stillToArrive = data.reservations.filter(
    (res) => res.checkIn === date && res.status === "confirmed",
  );
  const arrivedToday = data.reservations.filter(
    (res) => res.checkIn === date && res.status === "inhouse",
  );
  const departures = data.reservations.filter(
    (res) => res.checkOut === date && res.status === "inhouse",
  );
  const inhouse = data.reservations.filter((res) => res.status === "inhouse");
  const closed = data.checks.filter((check) => check.status === "closed" && check.closedOn === date);
  const openChecks = data.checks.filter((check) => check.status === "open");
  const fb = closed.reduce((sum, check) => sum + checkTotal(check), 0);
  const openValue = openChecks.reduce((sum, check) => sum + checkTotal(check), 0);
  const covers = data.tables.reduce(
    (sum, table) => sum + (table.status === "open" ? 0 : table.covers),
    0,
  );
  const occPct = sellable.length ? Math.round((occupiedRooms.length / sellable.length) * 100) : 0;
  const adr = occupiedRooms.length ? Math.round(roomRevenue / occupiedRooms.length) : 0;
  const revpar = sellable.length ? Math.round(roomRevenue / sellable.length) : 0;
  const tickets = openChecks.filter(
    (check) => check.kitchen === "queued" || check.kitchen === "pass",
  ).length;
  const folio = inhouse.reduce((sum, res) => sum + res.balance, 0);
  return {
    date,
    sellable,
    occupiedRooms,
    dirty,
    ooo,
    roomRevenue,
    stillToArrive,
    arrivedToday,
    departures,
    inhouse,
    closed,
    openChecks,
    fb,
    openValue,
    covers,
    occPct,
    adr,
    revpar,
    tickets,
    folio,
  };
}

export function occupancyWeek(todayPct: number) {
  const history = [64, 58, 71, 76, 69, 73];
  return history.concat(todayPct).map((pct, index) => {
    const ymd = nairobiYmd(index - 6);
    const [y, m, d] = ymd.split("-").map(Number);
    const label = new Intl.DateTimeFormat("en-KE", {
      weekday: "short",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(y, m - 1, d)));
    return { label, pct };
  });
}

function linesFor(kind: ReportKind, data: DeskData, date: string): ReportLine[] {
  const snap = metrics(data, date);
  if (kind === "occupancy") {
    return data.rooms.map((room) => {
      const guest = inhouseFor(data.reservations, room.id);
      const hold = holdingStay(data.reservations, room.id);
      const who = guest?.guest ?? hold?.guest ?? room.housekeeper;
      return { left: `${room.number}  ${room.type}`, right: `${STATUS_LABEL[room.status]} · ${who}` };
    });
  }
  if (kind === "fb") {
    const closedLines = snap.closed.map((check) => {
      const table = tableOf(data.tables, check.tableId);
      return {
        left: `${table?.name ?? "Check"} · ${check.server}`,
        right: `${kes(checkTotal(check))} · ${check.payMethod ?? "open"}`,
      };
    });
    const openLines = snap.openChecks
      .filter((check) => check.items.length > 0)
      .map((check) => {
        const table = tableOf(data.tables, check.tableId);
        return { left: `${table?.name ?? "Check"} still open`, right: kes(checkTotal(check)) };
      });
    const eightySixed = data.menu
      .filter((dish) => !dish.available)
      .map((dish) => ({ left: dish.name, right: "86" }));
    return closedLines.concat(openLines, eightySixed);
  }
  if (kind === "movement") {
    const rows: ReportLine[] = [];
    snap.stillToArrive.forEach((res) => {
      const room = roomOf(data.rooms, res.roomId);
      rows.push({ left: `Arrive  ${res.guest}`, right: `${room?.number ?? "—"} · ${res.source}` });
    });
    snap.arrivedToday.forEach((res) => {
      const room = roomOf(data.rooms, res.roomId);
      rows.push({ left: `In  ${res.guest}`, right: `${room?.number ?? "—"} · already on the key` });
    });
    snap.departures.forEach((res) => {
      const room = roomOf(data.rooms, res.roomId);
      rows.push({
        left: `Depart  ${res.guest}`,
        right: `${room?.number ?? "—"} · folio ${kes(res.balance)}`,
      });
    });
    return rows;
  }
  const house = snap.inhouse.map((res) => {
    const room = roomOf(data.rooms, res.roomId);
    return {
      left: `${room?.number ?? "—"}  ${res.guest}`,
      right: `${shortDate(res.checkOut)} · ${kes(res.balance)}`,
    };
  });
  const movement = snap.stillToArrive.map((res) => ({
    left: `Due in  ${res.guest}`,
    right: roomOf(data.rooms, res.roomId)?.number ?? "—",
  }));
  const books = snap.closed.map((check) => ({
    left: `Closed check  ${tableOf(data.tables, check.tableId)?.name ?? ""}`,
    right: kes(checkTotal(check)),
  }));
  return house.concat(movement, books);
}

function headline(kind: ReportKind, data: DeskData, date: string) {
  const snap = metrics(data, date);
  if (kind === "occupancy") {
    return `${snap.occPct}% of sellable keys are occupied. ADR ${kes(snap.adr)}.`;
  }
  if (kind === "fb") {
    return `The Long Table has taken ${kes(snap.fb)} and still holds ${kes(snap.openValue)} on open checks.`;
  }
  if (kind === "movement") {
    return `${snap.stillToArrive.length} still to arrive, ${snap.departures.length} still to leave.`;
  }
  return `${snap.occupiedRooms.length} keys in house, room revenue ${kes(snap.roomRevenue)}, food and drink ${kes(snap.fb)}.`;
}

export function buildReport(data: DeskData, kind: ReportKind, note: string): Report {
  const date = nairobiYmd(0);
  const snap = metrics(data, date);
  const metricRows =
    kind === "fb"
      ? [
          { label: "Closed F&B", value: kes(snap.fb) },
          { label: "Open checks", value: kes(snap.openValue) },
          { label: "Covers seated", value: String(snap.covers) },
          { label: "Tickets live", value: String(snap.tickets) },
        ]
      : kind === "movement"
        ? [
            { label: "To arrive", value: String(snap.stillToArrive.length) },
            { label: "Arrived", value: String(snap.arrivedToday.length) },
            { label: "To depart", value: String(snap.departures.length) },
            { label: "In house", value: String(snap.inhouse.length) },
          ]
        : [
            { label: "Occupancy", value: `${snap.occPct}%` },
            { label: "Room revenue", value: kes(snap.roomRevenue) },
            { label: "ADR", value: kes(snap.adr) },
            { label: "RevPAR", value: kes(snap.revpar) },
          ];
  return {
    id: `rep-${Date.now().toString(36)}`,
    kind,
    title: REPORT_TITLES[kind],
    kickedOffAt: new Date().toISOString(),
    businessDate: date,
    note,
    headline: headline(kind, data, date),
    metrics: metricRows,
    lines: linesFor(kind, data, date),
  };
}

export function seed(): DeskData {
  const rooms: Room[] = (
    [
      ["101", "Garden", 1, 14500, "occupied", "Grace"],
      ["102", "Garden", 1, 14500, "occupied", "Halima"],
      ["103", "Garden", 1, 14500, "dirty", "Peter"],
      ["104", "Garden", 1, 14500, "reserved", "Grace"],
      ["105", "Garden", 1, 14500, "occupied", "Grace"],
      ["106", "Garden", 1, 14500, "occupied", "Peter"],
      ["201", "Lake", 2, 22000, "vacant", "Halima"],
      ["202", "Lake", 2, 22000, "occupied", "Halima"],
      ["203", "Lake", 2, 22000, "occupied", "Peter"],
      ["204", "Lake", 2, 22000, "occupied", "Grace"],
      ["205", "Lake", 2, 22000, "dirty", "Peter"],
      ["206", "Lake", 2, 22000, "occupied", "Halima"],
      ["207", "Lake", 2, 22000, "vacant", "Grace"],
      ["208", "Lake", 2, 22000, "ooo", "Peter"],
      ["301", "Suite", 3, 48000, "occupied", "Halima"],
      ["302", "Suite", 3, 48000, "reserved", "Grace"],
      ["303", "Suite", 3, 48000, "vacant", "Peter"],
      ["304", "Suite", 3, 48000, "vacant", "Halima"],
    ] as const
  ).map(([number, type, floor, rate, status, housekeeper]) => ({
    id: `room-${number}`,
    number,
    type,
    floor,
    rate,
    status,
    housekeeper,
  }));

  const reservations: Reservation[] = [
    stay("res-amina", "Amina Yusuf", "+254 712 440 118", "101", -3, 1, 2, "inhouse", "direct", "Ground floor, garden side.", 0),
    stay("res-fatuma", "Fatuma Hassan", "+254 722 118 904", "102", -1, 2, 1, "inhouse", "ota", "", 4500),
    stay("res-priya", "Priya Shah", "+254 701 552 013", "105", -2, 0, 2, "inhouse", "direct", "Taxi at noon.", 0),
    stay("res-samuel", "Samuel Kimani", "+254 733 220 451", "106", 0, 2, 1, "inhouse", "walkin", "Walked in after breakfast.", 0),
    stay("res-achieng", "Achieng Otieno", "+254 711 908 332", "202", -1, 3, 2, "inhouse", "direct", "Anniversary. Lake-facing.", 18400),
    stay("res-mary", "Mary Atieno", "+254 725 661 290", "203", -4, 1, 2, "inhouse", "direct", "", 2100),
    stay("res-brian", "Brian Omondi", "+254 707 314 880", "204", -2, 2, 3, "inhouse", "ota", "Extra bed.", 0),
    stay("res-james", "James Okello", "+254 740 225 019", "206", -4, 0, 1, "inhouse", "direct", "Late checkout declined.", 6400),
    stay("res-david", "David Mwangi", "+254 722 903 114", "301", -2, 2, 2, "inhouse", "direct", "Suite. Quiet hours.", 9600),
    stay("res-naomi", "Naomi Wanjiru", "+254 758 441 027", "104", 0, 3, 2, "confirmed", "direct", "From Nakuru, late afternoon.", 0),
    stay("res-lars", "Lars Berg", "+44 7700 900 214", "302", 0, 2, 2, "confirmed", "ota", "Room prepaid. Incidentals open.", 0),
    stay("res-chen", "Chen Wei", "+86 138 0011 2210", "201", 2, 5, 2, "confirmed", "ota", "", 0),
    stay("res-wanjiku", "Wanjiku Mensah", "+254 712 009 441", "103", -3, -1, 2, "checkedout", "direct", "", 0),
    stay("res-paul", "Paul Ndegwa", "+254 701 220 118", "205", -2, -1, 1, "checkedout", "walkin", "", 0),
  ];

  const tables: DiningTable[] = [
    { id: "table-t1", name: "Terrace 1", seats: 2, zone: "Terrace", status: "open", covers: 0, server: "", checkId: null },
    { id: "table-t2", name: "Terrace 2", seats: 4, zone: "Terrace", status: "ordered", covers: 3, server: "Joel", checkId: "chk-t2" },
    { id: "table-t3", name: "Terrace 3", seats: 4, zone: "Terrace", status: "bill", covers: 2, server: "Amina", checkId: "chk-t3" },
    { id: "table-t4", name: "Terrace 4", seats: 2, zone: "Terrace", status: "open", covers: 0, server: "", checkId: null },
    { id: "table-d1", name: "Dining 1", seats: 4, zone: "Dining room", status: "open", covers: 0, server: "", checkId: null },
    { id: "table-d2", name: "Dining 2", seats: 6, zone: "Dining room", status: "ordered", covers: 4, server: "Wanjiku", checkId: "chk-d2" },
    { id: "table-d3", name: "Dining 3", seats: 2, zone: "Dining room", status: "open", covers: 0, server: "", checkId: null },
    { id: "table-d4", name: "Dining 4", seats: 4, zone: "Dining room", status: "seated", covers: 2, server: "Joel", checkId: "chk-d4" },
    { id: "table-d5", name: "Dining 5", seats: 4, zone: "Dining room", status: "open", covers: 0, server: "", checkId: null },
    { id: "table-b1", name: "Bar 1", seats: 2, zone: "Bar", status: "open", covers: 0, server: "", checkId: null },
    { id: "table-b2", name: "Bar 2", seats: 3, zone: "Bar", status: "ordered", covers: 2, server: "Amina", checkId: "chk-b2" },
    { id: "table-b3", name: "Bar 3", seats: 2, zone: "Bar", status: "open", covers: 0, server: "", checkId: null },
  ];

  const prior = `${nairobiYmd(-1)}T10:00:00.000Z`;
  const checks: Check[] = [
    {
      id: "chk-t2",
      tableId: "table-t2",
      status: "open",
      openedAt: prior,
      server: "Joel",
      kitchen: "queued",
      items: [item("tilapia", 2, true, "t2-a"), item("tusker", 3, true, "t2-b")],
    },
    {
      id: "chk-t3",
      tableId: "table-t3",
      status: "open",
      openedAt: prior,
      server: "Amina",
      kitchen: "done",
      items: [item("choma", 1, true, "t3-a"), item("red", 2, true, "t3-b")],
    },
    {
      id: "chk-d2",
      tableId: "table-d2",
      status: "open",
      openedAt: prior,
      server: "Wanjiku",
      kitchen: "pass",
      items: [
        item("goat", 1, true, "d2-a"),
        item("beans", 1, true, "d2-b"),
        item("avocado", 2, true, "d2-c"),
        item("passion", 2, true, "d2-d"),
      ],
    },
    {
      id: "chk-d4",
      tableId: "table-d4",
      status: "open",
      openedAt: prior,
      server: "Joel",
      kitchen: "none",
      items: [],
    },
    {
      id: "chk-b2",
      tableId: "table-b2",
      status: "open",
      openedAt: prior,
      server: "Amina",
      kitchen: "done",
      items: [item("dawa", 2, true, "b2-a"), item("coffee", 1, true, "b2-b")],
    },
    {
      id: "chk-gone-1",
      tableId: "table-d5",
      status: "closed",
      openedAt: prior,
      closedOn: nairobiYmd(0),
      server: "Wanjiku",
      kitchen: "done",
      payMethod: "cash",
      items: [item("tilapia", 1, true, "g1-a"), item("passion", 2, true, "g1-b")],
    },
    {
      id: "chk-gone-2",
      tableId: "table-d1",
      status: "closed",
      openedAt: prior,
      closedOn: nairobiYmd(0),
      server: "Amina",
      kitchen: "done",
      payMethod: "card",
      items: [item("mandazi", 2, true, "g2-a"), item("coffee", 3, true, "g2-b")],
    },
  ];

  const yesterday = nairobiYmd(-1);
  const reports: Report[] = [
    {
      id: "rep-last-night",
      kind: "night-audit",
      title: "Night audit",
      kickedOffAt: `${yesterday}T18:00:00.000Z`,
      businessDate: yesterday,
      note: "Sample audit filed before this kickoff. Room 208 still waiting on the pump.",
      headline: "12 keys in house. Room revenue KES 248,000. The Long Table closed KES 86,400.",
      metrics: [
        { label: "Occupancy", value: "71%" },
        { label: "Room revenue", value: kes(248000) },
        { label: "ADR", value: kes(20667) },
        { label: "F&B", value: kes(86400) },
      ],
      lines: [
        { left: "Arrivals", right: "4, all checked in" },
        { left: "Departures", right: "3, folios settled" },
        { left: "Out of order", right: "208 · lake pump" },
        { left: "No-shows", right: "None" },
      ],
    },
  ];

  return { rooms, reservations, tables, menu: MENU.map((dish) => ({ ...dish })), checks, reports };
}
