import type { DailyGoal } from "../types";
import { ProgressBar } from "./ProgressBar";

export function DailyGoalCard({ goal }: { goal: DailyGoal }) {
  const isDone = goal.current >= goal.target;

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
      {goal.claimed ? <span className="claimed-badge">Belohnung erhalten</span> : null}
    </article>
  );
}
