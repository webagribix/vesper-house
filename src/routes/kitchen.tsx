import { createFileRoute } from "@tanstack/react-router";
import { PageTitle, Shell, btn } from "@/components/vesper/shell";
import { tableOf, type Check, type KitchenStage } from "@/lib/vesper/model";
import { useDesk } from "@/lib/vesper/store";

export const Route = createFileRoute("/kitchen")({
  component: KitchenPage,
  head: () => ({ meta: [{ title: "Kitchen · Vesper House" }] }),
});

const COLUMNS: { stage: KitchenStage; title: string; action: string }[] = [
  { stage: "queued", title: "Queue", action: "Start" },
  { stage: "pass", title: "On the pass", action: "Clear" },
  { stage: "done", title: "Cleared", action: "" },
];

function KitchenPage() {
  const data = useDesk();
  const live = data.checks.filter((check) => check.status === "open" && check.kitchen !== "none");

  return (
    <Shell>
      <PageTitle
        kicker="Pass"
        title="Kitchen"
        lede="Tickets land when the floor sends them. Start a ticket, then clear it once it leaves the pass. Drinks ride the same rail."
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const tickets = live.filter((check) => check.kitchen === column.stage);
          return (
            <section key={column.stage} className="rounded-2xl border border-line bg-surface p-4">
              <h2 className="font-display text-2xl">
                {column.title}
                <span className="ml-2 text-base text-muted">{tickets.length}</span>
              </h2>
              <div className="mt-4 space-y-3">
                {tickets.map((check) => (
                  <Ticket key={check.id} check={check} action={column.action} />
                ))}
                {tickets.length === 0 ? (
                  <p className="text-sm text-muted">
                    {column.stage === "queued" ? "Nothing waiting." : "Clear."}
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}

function Ticket({ check, action }: { check: Check; action: string }) {
  const data = useDesk();
  const table = tableOf(data.tables, check.tableId);
  const kitchenItems = check.items.filter((line) => line.station === "kitchen");
  const barItems = check.items.filter((line) => line.station === "bar");
  return (
    <article className="rounded-xl bg-bg p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-medium">{table?.name ?? "Check"}</p>
        <p className="text-xs text-muted">{check.server}</p>
      </div>
      {kitchenItems.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm">
          {kitchenItems.map((line) => (
            <li key={line.id}>
              {line.qty} × {line.name}
            </li>
          ))}
        </ul>
      ) : null}
      {barItems.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {barItems.map((line) => (
            <li key={line.id}>
              Bar · {line.qty} × {line.name}
            </li>
          ))}
        </ul>
      ) : null}
      {action ? (
        <button type="button" className={btn + " mt-3 w-full"} onClick={() => data.bumpKitchen(check.id)}>
          {action}
        </button>
      ) : null}
    </article>
  );
}
