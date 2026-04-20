import type { DailyGoal } from "../types";
import { ProgressBar } from "./ProgressBar";

export function DailyGoalCard({ goal, onClaim }: { goal: DailyGoal; onClaim?: (goalId: string) => void }) {
  const isDone = goal.current >= goal.target;
  const canClaim = isDone && !goal.claimed;

  return (
    <article className={`daily-goal ${isDone ? "daily-goal--done" : ""} daily-goal--${goal.status ?? "locked"}`}>
      <div>
        <span className={`goal-status goal-status--${goal.status ?? "locked"}`}>
          {goal.claimed ? "Belohnung erhalten" : isDone ? "Abholbereit" : "Offen"}
        </span>
        <strong>{goal.title}</strong>
        <p>{goal.description}</p>
        {goal.reward ? (
          <small className="goal-reward">
            {goal.reward.coins ? `+${goal.reward.coins} Coins ` : ""}
            {goal.reward.xp ? `+${goal.reward.xp} XP ` : ""}
            {goal.reward.gems ? `+${goal.reward.gems} Gem` : ""}
          </small>
        ) : null}
      </div>
      <ProgressBar value={Math.min(goal.current, goal.target)} max={goal.target} label={isDone ? "Erledigt" : "Fortschritt"} />
      {canClaim && onClaim ? (
        <button className="button button--primary" type="button" onClick={() => onClaim(goal.id)}>
          Belohnung abholen
        </button>
      ) : null}
      {goal.claimed ? <span className="claimed-badge">Belohnung erhalten</span> : null}
    </article>
  );
}
