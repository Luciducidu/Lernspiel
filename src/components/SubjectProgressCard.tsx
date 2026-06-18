import { ProgressBar } from "./ProgressBar";

interface ProgressRow {
  label: string;
  minutes?: number;
  units: number;
}

export function SubjectProgressCard({ title, rows }: { title: string; rows: ProgressRow[] }) {
  const maxUnits = Math.max(1, ...rows.map((row) => row.units));

  return (
    <section className="content-card progress-distribution-card">
      <div className="section-heading">
        <span className="eyebrow">Verteilung</span>
        <h2>{title}</h2>
      </div>
      <div className="weekly-focus-list">
        {rows.map((row) => (
          <div className="weekly-focus-row" key={row.label}>
            <strong>{row.label}</strong>
            <ProgressBar value={row.units} max={maxUnits} label={`${row.units} Einheiten${row.minutes !== undefined ? ` · ${row.minutes} Min` : ""}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
