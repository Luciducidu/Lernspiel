import type { BrainworkoutWeeklyReflection } from "../types";

interface WeeklyReflectionSummaryCardProps {
  reflection?: BrainworkoutWeeklyReflection;
  onCopyPrompt?: () => void;
}

export function WeeklyReflectionSummaryCard({ reflection, onCopyPrompt }: WeeklyReflectionSummaryCardProps) {
  if (!reflection) {
    return (
      <article className="content-card weekly-reflection-summary">
        <span className="eyebrow">Letzte Reflexion</span>
        <h2>Noch keine Reflexion gespeichert</h2>
        <p>Eine kurze Wochenreflexion hilft, die nächste Woche leichter zu planen.</p>
      </article>
    );
  }

  return (
    <article className="content-card weekly-reflection-summary">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Letzte Reflexion</span>
          <h2>{new Date(reflection.completedAt).toLocaleDateString("de-DE")}</h2>
        </div>
        {onCopyPrompt ? (
          <button className="button button--ghost" type="button" onClick={onCopyPrompt}>
            Reflexionsprompt kopieren
          </button>
        ) : null}
      </div>
      <p><strong>Geschafft:</strong> {reflection.accomplished || "Noch nicht ausgefüllt."}</p>
      <p><strong>Nächste Woche:</strong> {reflection.nextWeekGoal || "Noch kein Ziel notiert."}</p>
      <small>Gespeicherte Reflexionen bleiben in der Brainworkout-Historie erhalten.</small>
    </article>
  );
}
