import type { AppMode, FocusSummary, LevelInfo, StreakState } from "../types";
import { DashboardCard } from "./DashboardCard";
import { LevelProgressCard } from "./LevelProgressCard";

interface ModeAwareProgressPreviewProps {
  activeMode: AppMode;
  levelInfo: LevelInfo;
  streakState: StreakState;
  focusSummary: FocusSummary;
}

export function ModeAwareProgressPreview({ activeMode, levelInfo, streakState, focusSummary }: ModeAwareProgressPreviewProps) {
  const label = activeMode === "abi" ? "Abitur-Fortschritt" : "Brainworkout-Fortschritt";
  const detail = activeMode === "abi" ? "Pruefungsmodus aktiv" : "Langfristige Entwicklung aktiv";

  return (
    <section className="mode-progress-preview">
      <div>
        <span className="eyebrow">{label}</span>
        <h2>{detail}</h2>
      </div>
      <div className="dashboard-summary-grid">
        <LevelProgressCard levelInfo={levelInfo} />
        <DashboardCard label="Streak" value={`${streakState.currentStreak} Tage`} detail={`Bestwert: ${streakState.longestStreak}`} />
        <DashboardCard label="Fokus Woche" value={`${focusSummary.weekMinutes} Min`} detail={`${focusSummary.totalMinutes} Min gesamt`} />
      </div>
    </section>
  );
}
