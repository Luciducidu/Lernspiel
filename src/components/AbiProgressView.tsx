import type { AppState, FocusSummary, LevelInfo, Quest, SessionHistoryEntry, StreakState } from "../types";
import { buildAbiProgress } from "../utils/modeProgress";
import { DashboardCard } from "./DashboardCard";
import { LevelProgressCard } from "./LevelProgressCard";
import { SessionHistory } from "./SessionHistory";
import { SubjectProgressCard } from "./SubjectProgressCard";

interface AbiProgressViewProps {
  appState: AppState;
  levelInfo: LevelInfo;
  quests: Quest[];
  sessions: SessionHistoryEntry[];
  focusSummary: FocusSummary;
  streakState: StreakState;
}

export function AbiProgressView({ appState, levelInfo, quests, sessions, focusSummary, streakState }: AbiProgressViewProps) {
  const progress = buildAbiProgress(quests, sessions);

  return (
    <div className="page-stack">
      <section className="dashboard-summary-grid">
        <LevelProgressCard levelInfo={levelInfo} />
        <DashboardCard label="Abi-Quests" value={progress.sessions.length} detail="abgeschlossene Sessions" />
        <DashboardCard label="Abi-Fokus" value={`${focusSummary.weekMinutes} Min`} detail={`Streak: ${streakState.currentStreak} Tage`} />
      </section>
      <SubjectProgressCard title="Fachfortschritt" rows={progress.subjectRows} />
      <section className="dashboard-summary-grid">
        <DashboardCard label="Abi-Training" value={progress.abiTrainingCount} detail="klausurnahe Aufgaben" />
        <DashboardCard label="Schreibpläne" value={progress.writingPlanCount} detail="Planung und Struktur" />
        <DashboardCard label="Abi-Level" value={appState.abi.level} detail={`${appState.abi.xp} XP im Abi-Modus`} />
      </section>
      <section className="content-card">
        <div className="section-heading">
          <span className="eyebrow">Themen</span>
          <h2>Abgeschlossene Schwerpunkte</h2>
        </div>
        {progress.topics.length > 0 ? (
          <div className="prep-block-grid">
            {progress.topics.slice(0, 6).map((topic) => (
              <article className="prep-block-card" key={topic.label}>
                <strong>{topic.label}</strong>
                <p>{topic.units} abgeschlossene Quest{topic.units === 1 ? "" : "s"}.</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">Noch keine abgeschlossenen Abi-Themen.</p>
        )}
      </section>
      <SessionHistory sessions={progress.sessions} />
    </div>
  );
}
