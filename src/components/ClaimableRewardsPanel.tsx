import type { DailyGoal, StreakReward } from "../types";
import { DailyGoalCard } from "./DailyGoalCard";
import { StreakRewardsPanel } from "./StreakRewardsPanel";

interface ClaimableRewardsPanelProps {
  dailyGoals: DailyGoal[];
  weeklyGoals: DailyGoal[];
  streakRewards: StreakReward[];
  currentStreak: number;
  longestStreak: number;
  onClaimDaily: (goalId: string) => void;
  onClaimWeekly: (goalId: string) => void;
  onClaimStreak: (rewardId: string) => void;
}

function claimableCount(goals: DailyGoal[]): number {
  return goals.filter((goal) => goal.current >= goal.target && !goal.claimed).length;
}

export function ClaimableRewardsPanel({
  dailyGoals,
  weeklyGoals,
  streakRewards,
  currentStreak,
  longestStreak,
  onClaimDaily,
  onClaimWeekly,
  onClaimStreak,
}: ClaimableRewardsPanelProps) {
  const openClaims = claimableCount(dailyGoals) + claimableCount(weeklyGoals) + streakRewards.filter((reward) => reward.status === "available").length;

  return (
    <div className="page-stack">
      <section className="content-card claim-summary-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Abholen</span>
            <h2>Belohnungen bewusst einsammeln</h2>
          </div>
          <span className="claim-count">{openClaims} offen</span>
        </div>
        <p>Erfüllte Tagesquests, Wochenquests und Streak-Meilensteine bleiben hier sichtbar, bis du sie aktiv abholst.</p>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <span className="eyebrow">Tagesquests</span>
          <h2>Heute</h2>
        </div>
        <div className="daily-goal-grid">{dailyGoals.map((goal) => <DailyGoalCard key={goal.id} goal={goal} onClaim={onClaimDaily} />)}</div>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <span className="eyebrow">Wochenquests</span>
          <h2>Diese Woche</h2>
        </div>
        <div className="daily-goal-grid weekly-goal-grid">{weeklyGoals.map((goal) => <DailyGoalCard key={goal.id} goal={goal} onClaim={onClaimWeekly} />)}</div>
      </section>

      <StreakRewardsPanel
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        rewards={streakRewards}
        onClaim={onClaimStreak}
      />
    </div>
  );
}
