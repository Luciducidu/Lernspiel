import type { AppPage, BrainworkoutModeState, DailyGoal, FocusSummary, LevelInfo, LevelUnlock, Quest, StreakState } from "../types";
import { ActiveQuestCard } from "./ActiveQuestCard";
import { AreaProgressGrid } from "./AreaProgressGrid";
import { DailyPlanTierSelector } from "./DailyPlanTierSelector";
import { DashboardCard } from "./DashboardCard";
import { ExternalAppTaskCard } from "./ExternalAppTaskCard";
import { ProgressBar } from "./ProgressBar";
import { WeeklyFocusCard } from "./WeeklyFocusCard";

interface BrainworkoutDashboardProps {
  brainworkout: BrainworkoutModeState;
  levelInfo: LevelInfo;
  nextUnlock?: LevelUnlock;
  activeQuest: Quest | null;
  acceptedCount: number;
  recommendedQuest?: Quest;
  weeklyGoals: DailyGoal[];
  streakState: StreakState;
  focusSummary: FocusSummary;
  onNavigate: (page: AppPage) => void;
  onSelectQuest: (quest: Quest) => void;
}

export function BrainworkoutDashboard({
  brainworkout,
  levelInfo,
  nextUnlock,
  activeQuest,
  acceptedCount,
  recommendedQuest,
  weeklyGoals,
  streakState,
  focusSummary,
  onNavigate,
  onSelectQuest,
}: BrainworkoutDashboardProps) {
  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero--brainworkout">
        <div className="dashboard-hero__content">
          <span className="eyebrow">Brainworkout</span>
          <h1>Langfristig besser werden, ohne Tagesdruck.</h1>
          <p>Plane eine realistische Einheit, halte die Routine sichtbar und nutze Hausarbeit oder Denkaufgaben als kleine Aktivierung.</p>
          <ProgressBar value={levelInfo.xpInCurrentLevel} max={levelInfo.xpForNextLevel} label={`Level ${levelInfo.level}`} />
          <div className="hero-actions">
            <button className="button button--primary" type="button" onClick={() => onNavigate("planning")}>
              Tag planen
            </button>
            <button className="button button--ghost" type="button" onClick={() => onNavigate("quests")}>
              Aufgaben ansehen
            </button>
          </div>
        </div>
        <div className="dashboard-hero__note">
          <span>Naechstes Ziel</span>
          <strong>{nextUnlock ? `${nextUnlock.title} · Level ${nextUnlock.level}` : "Routinen stabilisieren"}</strong>
        </div>
      </section>

      <section className="dashboard-feature-grid">
        <ActiveQuestCard activeQuest={activeQuest} acceptedCount={acceptedCount} onNavigate={onNavigate} />
        <article className="recommended-quest-card">
          <span className="eyebrow">Naechste Einheit</span>
          {recommendedQuest ? (
            <>
              <h3>{recommendedQuest.title}</h3>
              <p>{recommendedQuest.category} · {recommendedQuest.durationMinutes} Min · niedriger Lernstress</p>
              <button className="button button--primary" type="button" onClick={() => onSelectQuest(recommendedQuest)}>
                Aufgabe annehmen
              </button>
            </>
          ) : (
            <>
              <h3>Keine offene Brainworkout-Aufgabe</h3>
              <p>Erstelle eine Hausarbeits- oder Alltagsquest fuer einen leichten Start.</p>
              <button className="button button--ghost" type="button" onClick={() => onNavigate("quests")}>
                Aufgaben oeffnen
              </button>
            </>
          )}
        </article>
        <article className="compact-card reflection-hint-card">
          <span className="eyebrow">Reflexion</span>
          <h3>Kurzer Check nach der Einheit</h3>
          <p>Notiere spaeter kurz, was funktioniert hat. Keine Analyse, nur Orientierung fuer den naechsten Tag.</p>
        </article>
      </section>

      <DailyPlanTierSelector todayMinutes={focusSummary.todayMinutes} />
      <WeeklyFocusCard title="Routine vor Intensitaet" description="Diese Woche zaehlt ein stabiler Rhythmus mehr als perfekte Einheiten." goals={weeklyGoals} />
      <AreaProgressGrid progress={brainworkout.areaProgress} />

      <section className="external-task-grid">
        <ExternalAppTaskCard title="Schach" description="Eine kurze Partie oder 10 Minuten Taktiktraining als Denkroutine." actionLabel="Als Routine merken" />
        <ExternalAppTaskCard title="Fuehrerschein" description="Eine kleine Frageeinheit fuer regelmaessige Wiederholung." actionLabel="Einheit planen" />
      </section>

      <section className="dashboard-summary-grid">
        <DashboardCard label="Streak" value={`${streakState.currentStreak} Tage`} detail={`Bestwert: ${streakState.longestStreak}`} />
        <DashboardCard label="Fokus heute" value={`${focusSummary.todayMinutes} Min`} detail="alle Modi gemeinsam" />
        <DashboardCard label="Fokus Woche" value={`${focusSummary.weekMinutes} Min`} detail="Routine sichtbar halten" />
      </section>
    </div>
  );
}
