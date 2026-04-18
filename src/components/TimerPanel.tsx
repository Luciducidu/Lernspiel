import { useEffect, useMemo, useRef, useState } from "react";
import type { Quest } from "../types";
import { calculateQuestReward } from "../utils/gameRules";
import { playTimerEndSound } from "../utils/sound";
import { ExtraTimePicker } from "./ExtraTimePicker";
import { ProgressBar } from "./ProgressBar";
import { QuestRewardPreview } from "./QuestRewardPreview";
import { TimerEndAlert } from "./TimerEndAlert";

interface TimerPanelProps {
  quest: Quest | null;
  onComplete: (quest: Quest, focusMinutes: number) => void;
  onCancel: () => void;
  onPause: (quest: Quest) => void;
  onResume: (quest: Quest) => void;
  onAddExtraTime: (quest: Quest, minutes: number) => void;
  soundEnabled: boolean;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function getElapsedSeconds(quest: Quest | null): number {
  if (!quest?.startedAt) {
    return 0;
  }

  const startedAt = new Date(quest.startedAt).getTime();
  if (!Number.isFinite(startedAt)) {
    return 0;
  }

  const effectiveNow = quest.pausedAt ? new Date(quest.pausedAt).getTime() : Date.now();
  const pausedMs = quest.accumulatedPausedMs ?? 0;
  return Math.max(0, Math.floor((effectiveNow - startedAt - pausedMs) / 1000));
}

export function TimerPanel({ quest, onComplete, onCancel, onPause, onResume, onAddExtraTime, soundEnabled }: TimerPanelProps) {
  const initialSeconds = useMemo(() => (quest ? quest.durationMinutes * 60 : 0), [quest]);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => getElapsedSeconds(quest));
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const playedEndSignalRef = useRef<string | null>(null);
  const isPaused = Boolean(quest?.pausedAt);

  useEffect(() => {
    setElapsedSeconds(getElapsedSeconds(quest));
  }, [initialSeconds, quest?.id, quest?.startedAt, quest?.pausedAt, quest?.accumulatedPausedMs]);

  useEffect(() => {
    if (!quest || isPaused) {
      return;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds(getElapsedSeconds(quest));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isPaused, quest]);

  useEffect(() => {
    if (!quest || isPaused) {
      return;
    }

    const secondsLeft = Math.max(0, initialSeconds - elapsedSeconds);
    const timerEndKey = `${quest.id}:${quest.durationMinutes}`;
    if (secondsLeft > 0 && playedEndSignalRef.current === timerEndKey) {
      playedEndSignalRef.current = null;
      return;
    }

    if (secondsLeft === 0 && playedEndSignalRef.current !== timerEndKey) {
      playedEndSignalRef.current = timerEndKey;
      playTimerEndSound(soundEnabled);
    }
  }, [elapsedSeconds, initialSeconds, isPaused, quest, soundEnabled]);

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
  const progressValue = Math.min(elapsedSeconds, initialSeconds);

  return (
    <section className={`timer-panel timer-panel--running ${isPaused ? "timer-panel--paused" : ""}`}>
      <div className="timer-panel__header">
        <span className="eyebrow">Fokusmodus</span>
        <span className="status-badge status-badge--in_progress">{isPaused ? "Pausiert" : "Läuft"}</span>
      </div>
      <h2>{quest.title}</h2>
      <div className="timer-display" aria-live="polite">
        {formatTime(secondsLeft)}
      </div>
      <ProgressBar value={progressValue} max={Math.max(1, initialSeconds)} label="Session-Fortschritt" />
      <TimerEndAlert visible={secondsLeft === 0 && !isPaused} />
      <QuestRewardPreview reward={reward} />
      <ExtraTimePicker extraTimeMinutes={quest.extraTimeMinutes ?? 0} onAddExtraTime={(minutes) => onAddExtraTime(quest, minutes)} />
      <p>
        {isPaused
          ? "Die Session ist pausiert. Beim Fortsetzen läuft die Lernzeit exakt weiter."
          : secondsLeft === 0
            ? "Zeit geschafft. Schließe deine Quest ab."
            : "Heute zählt jede abgeschlossene Einheit."}
      </p>
      <div className="timer-actions">
        <button className="button button--primary" type="button" onClick={() => onComplete(quest, focusMinutes)}>
          Abschließen
        </button>
        {isPaused ? (
          <button className="button button--primary" type="button" onClick={() => onResume(quest)}>
            Fortsetzen
          </button>
        ) : (
          <button className="button button--ghost" type="button" onClick={() => setShowPauseConfirm(true)}>
            Pause
          </button>
        )}
        <button className="button button--ghost" type="button" onClick={onCancel}>
          Abbrechen
        </button>
      </div>

      {showPauseConfirm ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal pause-modal" role="dialog" aria-modal="true" aria-labelledby="pause-title">
            <span className="modal-rune">Pause</span>
            <h2 id="pause-title">Möchtest du die Lernsitzung wirklich pausieren?</h2>
            <p>Die Pause hat keine Strafe. Der Timer hält an und läuft erst beim Fortsetzen weiter.</p>
            <div className="modal-actions">
              <button
                className="button button--primary"
                type="button"
                onClick={() => {
                  setShowPauseConfirm(false);
                  onPause(quest);
                }}
              >
                Ja, pausieren
              </button>
              <button className="button button--ghost" type="button" onClick={() => setShowPauseConfirm(false)}>
                Weiterlernen
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
