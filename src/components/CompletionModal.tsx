import { useState } from "react";
import type { CompletionSummary, ReflectionData, ReflectionMood } from "../types";
import { useModalA11y } from "../hooks/useModalA11y";

interface CompletionModalProps {
  summary: CompletionSummary | null;
  onSaveReflection: (questId: string, reflection: ReflectionData) => void;
  onClose: () => void;
}

const moodLabels: Record<ReflectionMood, string> = {
  good: "Gut",
  okay: "Okay",
  hard: "Schwierig",
};

export function CompletionModal({ summary, onSaveReflection, onClose }: CompletionModalProps) {
  const [mood, setMood] = useState<ReflectionMood>("good");
  const [note, setNote] = useState("");
  const saveButtonRef = useModalA11y<HTMLButtonElement>(onClose);

  if (!summary) {
    return null;
  }

  const currentSummary = summary;

  function handleSave() {
    onSaveReflection(currentSummary.questId, {
      mood,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal completion-modal" role="dialog" aria-modal="true" aria-labelledby="completion-title">
        <span className="modal-rune completion-rune">Erfolg</span>
        <h2 id="completion-title">Quest abgeschlossen</h2>
        <p>
          <strong>{currentSummary.questTitle}</strong> ist erledigt. Konstanz schlägt Perfektion.
        </p>
        <div className="completion-rewards">
          <strong>+{currentSummary.reward.coins + currentSummary.reward.bonusCoins} Coins</strong>
          <strong>+{currentSummary.reward.xp} XP</strong>
        </div>
        {currentSummary.newLevel > currentSummary.previousLevel ? (
          <div className="level-up-callout">Level-Up: {currentSummary.previousLevel} → {currentSummary.newLevel}</div>
        ) : null}
        {currentSummary.unlocked ? (
          <div className="unlock-callout">
            Freigeschaltet: <strong>{currentSummary.unlocked.title}</strong>
          </div>
        ) : null}

        <div className="reflection-panel">
          <h3>Wie lief diese Lerneinheit?</h3>
          <div className="reflection-options">
            {(Object.keys(moodLabels) as ReflectionMood[]).map((value) => (
              <button
                className={`button ${mood === value ? "button--primary" : "button--ghost"}`}
                type="button"
                key={value}
                onClick={() => setMood(value)}
              >
                {moodLabels[value]}
              </button>
            ))}
          </div>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Kurze Notiz" />
        </div>

        <div className="modal-actions">
          <button ref={saveButtonRef} className="button button--primary" type="button" onClick={handleSave}>
            Speichern
          </button>
          <button className="button button--ghost" type="button" onClick={onClose}>
            Überspringen
          </button>
        </div>
      </section>
    </div>
  );
}
