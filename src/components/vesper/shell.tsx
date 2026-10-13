import { Link, useRouterState } from "@tanstack/react-router";
import {
  BedDouble,
  ChefHat,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useDesk } from "@/lib/vesper/store";

const NAV: { to: "/" | "/rooms" | "/stays" | "/floor" | "/kitchen" | "/reports"; label: string; short: string; icon: LucideIcon }[] = [
  { to: "/", label: "Today", short: "Today", icon: LayoutDashboard },
  { to: "/rooms", label: "Rooms", short: "Rooms", icon: BedDouble },
  { to: "/stays", label: "Stays", short: "Stays", icon: ClipboardList },
  { to: "/floor", label: "Long Table", short: "Floor", icon: UtensilsCrossed },
  { to: "/kitchen", label: "Kitchen pass", short: "Pass", icon: ChefHat },
  { to: "/reports", label: "Reports", short: "Audit", icon: FileBarChart },
];

export const field =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-base text-ink outline-none focus:border-brass";

export const btn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brass px-4 text-sm font-medium text-surface transition-opacity disabled:opacity-40";

export const btnQuiet =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink disabled:opacity-40";

export function Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useDesk.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-line px-4 py-6 lg:flex">
          <Brand />
          <nav className="mt-8 flex flex-col gap-1" aria-label="Desk">
            {NAV.map((item) => (
              <SideLink key={item.to} {...item} />
            ))}
          </nav>
          <div className="mt-auto space-y-3">
            <p className="text-xs leading-5 text-muted">
              Sample day for an 18-key house. Saved on this browser only.
            </p>
            <button type="button" className={btnQuiet + " w-full"} onClick={() => useDesk.getState().resetDemo()}>
              Restore sample day
            </button>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
            <Brand compact />
            <button
              type="button"
              className="text-sm font-medium text-brass"
              onClick={() => useDesk.getState().resetDemo()}
            >
              Reset
            </button>
          </div>
          <main className="min-w-0 flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
        </div>
      </div>
      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-line bg-surface lg:hidden"
        aria-label="Desk"
      >
        {NAV.map((item) => (
          <BottomLink key={item.to} {...item} />
        ))}
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="block">
      <p className={"font-display leading-none " + (compact ? "text-xl" : "text-3xl")}>Vesper</p>
      <p className="mt-1 text-sm text-muted">{compact ? "Naivasha" : "House · Naivasha"}</p>
    </Link>
  );
}

function SideLink({
  to,
  label,
  icon: Icon,
}: {
  to: (typeof NAV)[number]["to"];
  label: string;
  icon: LucideIcon;
}) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const on = path === to;
  return (
    <Link
      to={to}
      className={
        "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium " +
        (on ? "bg-ink text-surface" : "text-muted hover:bg-surface hover:text-ink")
      }
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
      {label}
    </Link>
  );
}

function BottomLink({
  to,
  short,
  icon: Icon,
}: {
  to: (typeof NAV)[number]["to"];
  short: string;
  icon: LucideIcon;
}) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const on = path === to;
  return (
    <Link
      to={to}
      className={
        "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium " +
        (on ? "text-brass" : "text-muted")
      }
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
      {short}
    </Link>
  );
}

export function PageTitle({ kicker, title, lede }: { kicker: string; title: string; lede?: string }) {
  return (
    <header className="max-w-3xl">
      <p className="text-sm text-muted">{kicker}</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight text-ink sm:text-5xl">{title}</h1>
      {lede ? <p className="mt-3 max-w-2xl text-base leading-6 text-muted">{lede}</p> : null}
    </header>
  );
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl bg-brass-soft px-3 py-2 text-sm text-brass">
      {children}
    </p>
  );
}
