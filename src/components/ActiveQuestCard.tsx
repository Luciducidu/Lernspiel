import type { AppPage, Quest } from "../types";
import { QuestStatusBadge } from "./QuestStatusBadge";

interface ActiveQuestCardProps {
  activeQuest: Quest | null;
  acceptedCount: number;
  onNavigate: (page: AppPage) => void;
}

export function ActiveQuestCard({ activeQuest, acceptedCount, onNavigate }: ActiveQuestCardProps) {
  return (
    <article className="active-quest-card">
      <span className="eyebrow">Aktive Quest</span>
      {activeQuest ? (
        <>
          <div className="active-quest-card__title">
            <h3>{activeQuest.title}</h3>
            <QuestStatusBadge status={activeQuest.status} />
          </div>
          <p>{activeQuest.category} · {activeQuest.durationMinutes} Min.</p>
          <button className="button button--primary" type="button" onClick={() => onNavigate("focus")}>
            Fokusmodus öffnen
          </button>
        </>
      ) : (
        <>
          <h3>Keine laufende Quest</h3>
          <p>{acceptedCount > 0 ? `${acceptedCount} angenommene Quest wartet auf den Start.` : "Nimm eine Quest an, wenn du bereit bist."}</p>
          <button className="button button--ghost" type="button" onClick={() => onNavigate("quests")}>
            Quests öffnen
          </button>
        </>
      )}
    </article>
  );
}
