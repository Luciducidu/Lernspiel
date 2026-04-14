import { calculateQuestReward } from "../utils/gameRules";
import type { Quest } from "../types";
import { inferQuestSubject } from "../utils/subjects";
import { modeLabels, taskTypeLabels } from "../data/questContent";
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
  onDurationChange: (quest: Quest, durationMinutes: number) => void;
  gems: number;
}

export function QuestCard({ quest, onSelect, onStart, onReopen, onReroll, onDurationChange, gems }: QuestCardProps) {
  const reward = calculateQuestReward(quest);
  const subject = inferQuestSubject(quest);
  const canOpenAcceptance = quest.status === "open";
  const canStart = quest.status === "accepted";
  const canReopen = quest.status === "cancelled";
  const canChooseDuration = quest.status === "open" || quest.status === "accepted";

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
          <div className="quest-meta-badges">
            {quest.taskType ? <span>{taskTypeLabels[quest.taskType]}</span> : null}
            {quest.mode ? <span>{modeLabels[quest.mode]}</span> : null}
            {quest.outputType ? <span>{quest.outputType}</span> : null}
          </div>
          {quest.note ? <p>{quest.note}</p> : null}
          {quest.status === "accepted" ? <small>Eine angenommene Quest ist der erste Schritt.</small> : null}
          {quest.status === "in_progress" ? <small>Status: Läuft. Bleib bei dieser einen Einheit.</small> : null}
        </div>
        <div className="quest-card__side">
          <span>{quest.durationMinutes} Min.</span>
          <QuestRewardPreview reward={reward} compact />
        </div>
      </button>

      {canChooseDuration && quest.durationOptions ? (
        <div className="duration-chip-row" aria-label="Zeitwahl">
          {quest.durationOptions.map((duration) => (
            <button
              className={`duration-chip ${duration === quest.durationMinutes ? "duration-chip--selected" : ""} ${
                duration === quest.recommendedDurationMinutes ? "duration-chip--recommended" : ""
              }`}
              key={duration}
              type="button"
              onClick={() => onDurationChange(quest, duration)}
            >
              {duration} Min {duration === quest.recommendedDurationMinutes ? "empfohlen" : ""}
            </button>
          ))}
        </div>
      ) : null}

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
