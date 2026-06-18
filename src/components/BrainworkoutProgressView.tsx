import type { AppState, FocusSummary, LevelInfo, Quest, SessionHistoryEntry, StreakState } from "../types";
import { buildBrainworkoutProgress } from "../utils/modeProgress";
import { DashboardCard } from "./DashboardCard";
import { LevelProgressCard } from "./LevelProgressCard";
import { SessionHistory } from "./SessionHistory";
import { SubjectProgressCard } from "./SubjectProgressCard";
import { WeeklyPlanSummaryCard } from "./WeeklyPlanSummaryCard";
import { WeeklyReflectionSummaryCard } from "./WeeklyReflectionSummaryCard";

interface BrainworkoutProgressViewProps {
  appState: AppState;
  levelInfo: LevelInfo;
  quests: Quest[];
  sessions: SessionHistoryEntry[];
  focusSummary: FocusSummary;
  streakState: StreakState;
  onCopyReflectionPrompt: () => void;
}

export function BrainworkoutProgressView({
  appState,
  levelInfo,
  quests,
  sessions,
  focusSummary,
  streakState,
  onCopyReflectionPrompt,
}: BrainworkoutProgressViewProps) {
  const progress = buildBrainworkoutProgress(quests, sessions, appState.brainworkout);

  return (
    <div className="page-stack">
      <section className="dashboard-summary-grid">
        <LevelProgressCard levelInfo={levelInfo} />
        <DashboardCard label="Einheiten" value={progress.sessions.length} detail="Brainworkout abgeschlossen" />
        <DashboardCard label="Wochenkonstanz" value={`${streakState.currentStreak} Tage`} detail={`${focusSummary.weekMinutes} Min diese Woche`} />
      </section>
      <SubjectProgressCard title="Bereichsverteilung" rows={progress.areaRows} />
      <SubjectProgressCard title="Tagesstufen-Verlauf" rows={progress.tierRows} />
      <section className="planning-grid">
        <WeeklyPlanSummaryCard plan={progress.latestPlan} />
        <WeeklyReflectionSummaryCard reflection={progress.latestReflection} onCopyPrompt={onCopyReflectionPrompt} />
      </section>
      <section className="dashboard-summary-grid">
        <DashboardCard label="Reflexionen" value={progress.reflectionCount} detail="gespeicherte Wochenabschlüsse" />
        <DashboardCard label="Brainworkout-Level" value={appState.brainworkout.level} detail={`${appState.brainworkout.xp} XP im Brainworkout-Modus`} />
        <DashboardCard label="Shop bleibt global" value="Coins" detail="Coins und Gems werden gemeinsam genutzt" />
      </section>
      <SessionHistory sessions={progress.sessions} />
    </div>
  );
}
