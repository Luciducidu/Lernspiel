interface DashboardCardProps {
  label: string;
  value: string | number;
  detail?: string;
}

export function DashboardCard({ label, value, detail }: DashboardCardProps) {
  return (
    <article className="dashboard-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  );
}
