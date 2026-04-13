import { useEffect, useMemo, useState } from "react";
import type { Quest } from "../types";
import { calculateQuestReward } from "../utils/gameRules";
import { ProgressBar } from "./ProgressBar";
import { QuestRewardPreview } from "./QuestRewardPreview";

interface TimerPanelProps {
  quest: Quest | null;
  onComplete: (quest: Quest, focusMinutes: number) => void;
  onCancel: () => void;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function TimerPanel({ quest, onComplete, onCancel }: TimerPanelProps) {
  const initialSeconds = useMemo(() => (quest ? quest.durationMinutes * 60 : 0), [quest]);
  const getElapsedSeconds = () => {
    if (!quest?.startedAt) {
      return 0;
    }

    const startedAt = new Date(quest.startedAt).getTime();
    if (!Number.isFinite(startedAt)) {
      return 0;
    }

    return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  };
  const [elapsedSeconds, setElapsedSeconds] = useState(getElapsedSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setElapsedSeconds(getElapsedSeconds());
    setIsRunning(Boolean(quest));
  }, [initialSeconds, quest?.id, quest?.startedAt]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds(getElapsedSeconds());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isRunning, quest?.startedAt]);

  if (!quest) {
    return (
      <section className="timer-panel timer-panel--empty">
        <span className="eyebrow">Fokusmodus</span>
        <h2>Keine aktive Quest</h2>
        <p>Nimm eine Quest bewusst an und starte sie dann aus der Quest-Liste.</p>
      </section>
    );
  }

  const reward = calculateQuestReward(quest);
  const secondsLeft = Math.max(0, initialSeconds - elapsedSeconds);
  const focusMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));

  return (
    <section className="timer-panel timer-panel--running">
      <div className="timer-panel__header">
        <span className="eyebrow">Fokusmodus</span>
        <span className="status-badge status-badge--in_progress">Läuft</span>
      </div>
      <h2>{quest.title}</h2>
      <div className="timer-display" aria-live="polite">
        {formatTime(secondsLeft)}
      </div>
      <ProgressBar value={elapsedSeconds} max={Math.max(1, initialSeconds)} label="Session-Fortschritt" />
      <QuestRewardPreview reward={reward} />
      <p>{secondsLeft === 0 ? "Zeit geschafft. Schließe deine Quest ab." : "Heute zählt jede abgeschlossene Einheit."}</p>
      <div className="timer-actions">
        <button className="button button--primary" type="button" onClick={() => onComplete(quest, focusMinutes)}>
          Abschließen
        </button>
        <button className="button button--ghost" type="button" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </section>
  );
}
