import type { StreakState } from "../types";

interface GemActionPanelProps {
  gems: number;
  streakState: StreakState;
  onRescueStreak: () => void;
}

export function GemActionPanel({ gems, streakState, onRescueStreak }: GemActionPanelProps) {
  return (
    <section className="panel gem-panel">
      <div className="section-heading">
        <span className="eyebrow">Gem-Aktionen</span>
        <h2>Seltene Optionen</h2>
      </div>
      <div className="gem-action-card">
        <div>
          <strong>Streak retten</strong>
          <p>
            {streakState.canRescue
              ? `Der Tag ${streakState.rescueDate} kann noch geschützt werden.`
              : "Nur verfügbar, wenn genau der letzte verpasste Tag gerettet werden kann."}
          </p>
        </div>
        <button className="button button--gem" type="button" disabled={!streakState.canRescue || gems < 2} onClick={onRescueStreak}>
          2 Gems einsetzen
        </button>
      </div>
      <p className="gem-hint">Quest-Reroll kostet 1 Gem und erscheint direkt auf offenen Quests.</p>
    </section>
  );
}
