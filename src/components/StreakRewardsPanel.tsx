import type { StreakReward } from "../types";
import { ProgressBar } from "./ProgressBar";

interface StreakRewardsPanelProps {
  currentStreak: number;
  longestStreak: number;
  rewards: StreakReward[];
  onClaim: (rewardId: string) => void;
}

function rewardText(reward: StreakReward): string {
  return [
    reward.reward.coins ? `+${reward.reward.coins} Coins` : "",
    reward.reward.xp ? `+${reward.reward.xp} XP` : "",
    reward.reward.gems ? `+${reward.reward.gems} Gems` : "",
    reward.reward.luckyChestTier ? `${reward.reward.luckyChestTier} Chest` : "",
    reward.reward.badge ? `Badge: ${reward.reward.badge}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

export function StreakRewardsPanel({ currentStreak, longestStreak, rewards, onClaim }: StreakRewardsPanelProps) {
  const nextReward = rewards.find((reward) => reward.status !== "claimed");
  const progressTarget = nextReward?.milestoneDays ?? Math.max(1, longestStreak);

  return (
    <section className="content-card streak-reward-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Streaks</span>
          <h2>Serien und Belohnungen</h2>
        </div>
        <span className="streak-pill">{currentStreak} Tage aktuell</span>
      </div>

      <div className="streak-overview-grid">
        <article className="streak-stat-card">
          <span>Aktuelle Streak</span>
          <strong>{currentStreak}</strong>
          <small>Tage</small>
        </article>
        <article className="streak-stat-card">
          <span>Längste Streak</span>
          <strong>{longestStreak}</strong>
          <small>Tage</small>
        </article>
        <article className="streak-stat-card streak-stat-card--wide">
          <span>Nächster Meilenstein</span>
          <strong>{nextReward ? `${nextReward.milestoneDays} Tage` : "Alle erreicht"}</strong>
          <ProgressBar value={Math.min(longestStreak, progressTarget)} max={progressTarget} label="Fortschritt" />
        </article>
      </div>

      <div className="streak-reward-grid">
        {rewards.map((reward) => (
          <article className={`streak-reward-card streak-reward-card--${reward.status}`} key={reward.id}>
            <span className={`unlock-label ${reward.status === "locked" ? "unlock-label--locked" : "unlock-label--open"}`}>
              {reward.status === "claimed"
                ? "Abgeholt"
                : reward.status === "available"
                  ? "Abholbar"
                  : `${reward.milestoneDays} Tage nötig`}
            </span>
            <h3>{reward.title}</h3>
            <p>{reward.description}</p>
            <strong>{rewardText(reward)}</strong>
            <button
              className="button button--primary"
              type="button"
              disabled={reward.status !== "available"}
              onClick={() => onClaim(reward.id)}
            >
              Belohnung abholen
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
