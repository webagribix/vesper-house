import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageTitle, Shell, btn, field } from "@/components/vesper/shell";
import { REPORT_TITLES, longDate, type Report, type ReportKind } from "@/lib/vesper/model";
import { useDesk } from "@/lib/vesper/store";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Reports · Vesper House" }] }),
});

const KINDS: ReportKind[] = ["night-audit", "occupancy", "fb", "movement"];

function ReportsPage() {
  const data = useDesk();
  const [kind, setKind] = useState<ReportKind>("night-audit");
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState(data.reports[0]?.id ?? "");
  const report = data.reports.find((row) => row.id === selected) ?? data.reports[0];

  return (
    <Shell>
      <PageTitle
        kicker="Kickoff"
        title="File the house"
        lede="A report freezes the desk as it stands — occupancy, movement, or the Long Table — and stays on file after the floor moves on."
      />
      <form
        className="mt-8 rounded-2xl border border-line bg-surface p-5"
        onSubmit={(event) => {
          event.preventDefault();
          const id = data.kickoff(kind, note);
          setSelected(id);
          setNote("");
        }}
      >
        <div className="flex flex-wrap gap-2">
          {KINDS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={kind === item}
              className={
                "h-11 rounded-full px-4 text-sm font-medium " +
                (kind === item ? "bg-ink text-surface" : "border border-line text-muted")
              }
              onClick={() => setKind(item)}
            >
              {REPORT_TITLES[item]}
            </button>
          ))}
        </div>
        <label className="mt-4 block text-sm text-muted">
          Note for the file
          <input
            className={field + " mt-1"}
            value={note}
            placeholder="Pump still out on 208. Goat shoulder cleared."
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <button type="submit" className={btn + " mt-4"}>
          Kick off report
        </button>
      </form>
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <ul className="space-y-2">
          {data.reports.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => setSelected(row.id)}
                className={
                  "w-full rounded-xl border px-3 py-3 text-left " +
                  (report?.id === row.id ? "border-brass bg-brass-soft" : "border-line bg-surface")
                }
              >
                <span className="block text-sm font-medium">{row.title}</span>
                <span className="block text-xs text-muted">{longDate(row.businessDate)}</span>
              </button>
            </li>
          ))}
        </ul>
        {report ? <Sheet report={report} /> : null}
      </div>
    </Shell>
  );
}

function Sheet({ report }: { report: Report }) {
  return (
    <article className="report-sheet rounded-2xl border border-line bg-surface px-5 py-6 sm:px-8">
      <p className="text-sm text-muted">Vesper House · Naivasha</p>
      <h2 className="mt-2 font-display text-4xl">{report.title}</h2>
      <p className="mt-1 text-sm text-muted">Business date {longDate(report.businessDate)}</p>
      <p className="mt-4 max-w-xl text-base leading-6">{report.headline}</p>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {report.metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl bg-bg px-3 py-3">
            <dt className="text-xs text-muted">{metric.label}</dt>
            <dd className="mt-1 font-display text-xl">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-6 divide-y divide-line">
        {report.lines.length === 0 ? (
          <li className="py-3 text-sm text-muted">No lines in this cut.</li>
        ) : (
          report.lines.map((line, index) => (
            <li key={`${line.left}-${index}`} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
              <span>{line.left}</span>
              <span className="text-right text-muted">{line.right}</span>
            </li>
          ))
        )}
      </ul>
      {report.note ? <p className="mt-6 text-sm leading-6 text-muted">Note — {report.note}</p> : null}
      <p className="mt-6 text-xs text-muted">Snapshot kept on this desk.</p>
    </article>
  );
}
