import { calculateQuestReward } from "../utils/gameRules";
import type { Quest } from "../types";
import { inferQuestSubject } from "../utils/subjects";
import { QuestRewardPreview } from "./QuestRewardPreview";
import { QuestStatusBadge } from "./QuestStatusBadge";

const difficultyLabels: Record<Quest["difficulty"], string> = {
  easy: "leicht",
  medium: "mittel",
  hard: "schwer",
};

interface QuestCardProps {
  quest: Quest;
  onSelect: (quest: Quest) => void;
  onStart: (quest: Quest) => void;
  onReopen: (quest: Quest) => void;
  onReroll: (quest: Quest) => void;
  gems: number;
}

export function QuestCard({ quest, onSelect, onStart, onReopen, onReroll, gems }: QuestCardProps) {
  const reward = calculateQuestReward(quest);
  const subject = inferQuestSubject(quest);
  const canOpenAcceptance = quest.status === "open";
  const canStart = quest.status === "accepted";
  const canReopen = quest.status === "cancelled";

  return (
    <article className={`quest-card quest-card--${quest.status} quest-card--${quest.difficulty}`}>
      <button
        className="quest-card__main"
        type="button"
        onClick={() => (canOpenAcceptance ? onSelect(quest) : undefined)}
        disabled={!canOpenAcceptance}
      >
        <div className="quest-card__content">
          <div className="quest-card__topline">
            <span className={`difficulty-mark difficulty-mark--${quest.difficulty}`}>{difficultyLabels[quest.difficulty]}</span>
            <QuestStatusBadge status={quest.status} />
          </div>
          <span className="eyebrow">{subject ? `${subject}${quest.topic ? ` / ${quest.topic}` : ""}` : quest.category}</span>
          <h3>{quest.title}</h3>
          {quest.note ? <p>{quest.note}</p> : null}
          {quest.status === "accepted" ? <small>Eine angenommene Quest ist der erste Schritt.</small> : null}
          {quest.status === "in_progress" ? <small>Status: Läuft. Bleib bei dieser einen Einheit.</small> : null}
        </div>
        <div className="quest-card__side">
          <span>{quest.durationMinutes} Min.</span>
          <QuestRewardPreview reward={reward} compact />
        </div>
      </button>

      {canStart ? (
        <button className="button button--primary quest-card__action" type="button" onClick={() => onStart(quest)}>
          Starten
        </button>
      ) : null}
      {canOpenAcceptance ? (
        <button className="button button--gem quest-card__action" type="button" onClick={() => onReroll(quest)}>
          Neu würfeln · 1 Gem {gems < 1 ? "fehlt" : ""}
        </button>
      ) : null}
      {canReopen ? (
        <button className="button button--ghost quest-card__action" type="button" onClick={() => onReopen(quest)}>
          Wieder öffnen
        </button>
      ) : null}
    </article>
  );
}
