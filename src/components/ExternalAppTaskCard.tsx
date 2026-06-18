interface ExternalAppTaskCardProps {
  title: string;
  description: string;
  actionLabel: string;
}

export function ExternalAppTaskCard({ title, description, actionLabel }: ExternalAppTaskCardProps) {
  return (
    <article className="external-task-card">
      <span className="eyebrow">Externe Routine</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="button button--ghost" type="button">
        {actionLabel}
      </button>
    </article>
  );
}
