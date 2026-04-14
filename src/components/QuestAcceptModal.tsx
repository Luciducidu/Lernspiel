import { useState } from "react";
import type { Quest } from "../types";
import { useModalA11y } from "../hooks/useModalA11y";
import { calculateQuestReward } from "../utils/gameRules";
import { inferQuestSubject } from "../utils/subjects";
import { modeLabels, taskTypeLabels } from "../data/questContent";
import { QuestRewardPreview } from "./QuestRewardPreview";

const difficultyLabels: Record<Quest["difficulty"], string> = {
  easy: "leicht",
  medium: "mittel",
  hard: "schwer",
};

interface QuestAcceptModalProps {
  quest: Quest | null;
  onAccept: (quest: Quest) => void;
  onDecline: () => void;
}

export function QuestAcceptModal({ quest, onAccept, onDecline }: QuestAcceptModalProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const acceptButtonRef = useModalA11y<HTMLButtonElement>(onDecline);

  if (!quest) {
    return null;
  }

  const reward = calculateQuestReward(quest);
  const currentQuest = quest;
  const subject = inferQuestSubject(quest);

  function handleAccept() {
    setIsAccepting(true);
    window.setTimeout(() => {
      setIsAccepting(false);
      onAccept(currentQuest);
    }, 280);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className={`modal quest-accept ${isAccepting ? "quest-accept--confirmed" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accept-title"
      >
        <span className="modal-rune">Quest</span>
        <h2 id="accept-title">Möchtest du lernen und diese Quest annehmen?</h2>
        <p className="quest-accept__subtitle">
          Mit dem Annehmen dieser Quest startest du bewusst deine Lerneinheit.
        </p>

        <div className="quest-accept__brief">
          <strong>{quest.title}</strong>
          <span>{subject ? `${subject}${quest.topic ? ` / ${quest.topic}` : ""}` : quest.category}</span>
          <span>{quest.durationMinutes} Min.</span>
          <span>{difficultyLabels[quest.difficulty]}</span>
        </div>
        <div className="quest-meta-badges quest-meta-badges--modal">
          {quest.taskType ? <span>{taskTypeLabels[quest.taskType]}</span> : null}
          {quest.mode ? <span>{modeLabels[quest.mode]}</span> : null}
          {quest.outputType ? <span>{quest.outputType}</span> : null}
        </div>

        <QuestRewardPreview reward={reward} />

        <div className="modal-actions">
          <button ref={acceptButtonRef} className="button button--primary" type="button" onClick={handleAccept}>
            Annehmen
          </button>
          <button className="button button--ghost" type="button" onClick={onDecline}>
            Ablehnen
          </button>
        </div>
      </section>
    </div>
  );
}
