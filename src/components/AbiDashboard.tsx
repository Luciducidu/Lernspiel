import type { ReactNode } from "react";
import type { AppPage, DailyGoal, FocusSummary, LevelInfo, LevelUnlock, MultipleChoiceQuestion, Quest, StreakState, SubjectPrioritySetting } from "../types";
import { ActiveQuestCard } from "./ActiveQuestCard";
import { DailyGoalCard } from "./DailyGoalCard";
import { DashboardCard } from "./DashboardCard";
import { DashboardHero } from "./DashboardHero";
import { ProgressBar } from "./ProgressBar";
import { SubjectPriorityCard } from "./SubjectPriorityCard";

interface AbiDashboardProps {
  focusText: string;
  levelInfo: LevelInfo;
  nextUnlock?: LevelUnlock;
  activeQuest: Quest | null;
  acceptedCount: number;
  subjects: SubjectPrioritySetting[];
  nextDailyGoal?: DailyGoal;
  weeklyGoals: DailyGoal[];
  recommendedQuest?: Quest;
  dailyQuickQuestions: MultipleChoiceQuestion[];
  dailyQuickAnsweredCount: number;
  dailyQuickCorrectCount: number;
  streakState: StreakState;
  focusSummary: FocusSummary;
  completedToday: number;
  renderDailyQuickList: (list: MultipleChoiceQuestion[], compact?: boolean) => ReactNode;
  onNavigate: (page: AppPage) => void;
  onOpenDaily: () => void;
  onSelectQuest: (quest: Quest) => void;
}

export function AbiDashboard({
  focusText,
  levelInfo,
  nextUnlock,
  activeQuest,
  acceptedCount,
  subjects,
  nextDailyGoal,
  weeklyGoals,
  recommendedQuest,
  dailyQuickQuestions,
  dailyQuickAnsweredCount,
  dailyQuickCorrectCount,
  streakState,
  focusSummary,
  completedToday,
  renderDailyQuickList,
  onNavigate,
  onOpenDaily,
  onSelectQuest,
}: AbiDashboardProps) {
  return (
    <div className="page-stack">
      <DashboardHero focusText={focusText} levelInfo={levelInfo} nextUnlock={nextUnlock} onNavigate={onNavigate} />
      <section className="dashboard-feature-grid">
        <ActiveQuestCard activeQuest={activeQuest} acceptedCount={acceptedCount} onNavigate={onNavigate} />
        <article className="recommended-quest-card">
          <span className="eyebrow">Empfohlene Abi-Quest</span>
          {recommendedQuest ? (
            <>
              <h3>{recommendedQuest.title}</h3>
              <p>
                {recommendedQuest.subject ?? recommendedQuest.category} · {recommendedQuest.topic ?? recommendedQuest.category} ·{" "}
                {recommendedQuest.durationMinutes} Min
              </p>
              <button className="button button--primary" type="button" onClick={() => onSelectQuest(recommendedQuest)}>
                Quest annehmen
              </button>
            </>
          ) : (
            <>
              <h3>Keine offene Abi-Quest</h3>
              <p>Lege eine neue Quest an oder nutze die Daily-Fragen fuer den Einstieg.</p>
              <button className="button button--ghost" type="button" onClick={() => onNavigate("quests")}>
                Quests oeffnen
              </button>
            </>
          )}
        </article>
        <SubjectPriorityCard subjects={subjects} />
      </section>

      <section className="dashboard-priority-grid dashboard-priority-grid--abi">
        <article className="compact-card">
          <span className="eyebrow">Tagesziel</span>
          {nextDailyGoal ? <DailyGoalCard goal={nextDailyGoal} /> : <p>Alle Tagesziele erledigt.</p>}
        </article>
        <section className="content-card daily-quick-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Daily Quick Quests</span>
              <h2>Kurze Abi-Wiederholung</h2>
            </div>
            <span className="daily-quick-counter">
              {dailyQuickCorrectCount}/{dailyQuickQuestions.length} richtig
            </span>
          </div>
          <p className="daily-quick-reward-note">
            Beantworte alle 5 Daily-Fragen richtig und hole dir 30 Coins im Belohnungs-Tab ab. Noch offen:{" "}
            {Math.max(0, dailyQuickQuestions.length - dailyQuickAnsweredCount)}.
          </p>
          <div className="daily-quick-grid daily-quick-grid--compact">{renderDailyQuickList(dailyQuickQuestions.slice(0, 3), true)}</div>
          <button className="button button--ghost" type="button" onClick={onOpenDaily}>
            Alle Daily Quick Quests
          </button>
        </section>
        <section className="content-card subject-progress-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Faecher</span>
              <h2>PB, Deutsch, Mathe</h2>
            </div>
          </div>
          {["PB", "Deutsch", "Mathe"].map((subject) => (
            <ProgressBar key={subject} value={subject === "Deutsch" ? 72 : subject === "PB" ? 58 : 46} max={100} label={subject} />
          ))}
        </section>
      </section>

      <section className="dashboard-summary-grid">
        <DashboardCard label="Streak" value={`${streakState.currentStreak} Tage`} detail={`Bestwert: ${streakState.longestStreak}`} />
        <DashboardCard label="Fokus heute" value={`${focusSummary.todayMinutes} Min`} detail="fuer Tagesziele" />
        <DashboardCard label="Heute erledigt" value={completedToday} detail="abgeschlossene Quests" />
      </section>

      <section className="content-card weekly-compact-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Wochenziele kompakt</span>
            <h2>Was diese Woche zaehlt</h2>
          </div>
          <button className="button button--ghost" type="button" onClick={() => onNavigate("planning")}>
            Planung oeffnen
          </button>
        </div>
        <div className="weekly-focus-list">
          {weeklyGoals.slice(0, 3).map((goal) => (
            <div className="weekly-focus-row" key={goal.id}>
              <strong>{goal.title}</strong>
              <ProgressBar value={Math.min(goal.current, goal.target)} max={goal.target} label="Fortschritt" />
            </div>
          ))}
        </div>
      </section>

      <section className="quick-actions">
        <button className="quick-action-card" type="button" onClick={() => onNavigate("quests")}>
          <strong>Neue Quest</strong>
          <span>Planen und bewusst annehmen</span>
        </button>
        <button className="quick-action-card" type="button" onClick={() => onNavigate("focus")}>
          <strong>Fokusmodus</strong>
          <span>Ruhige Session oeffnen</span>
        </button>
        <button className="quick-action-card" type="button" onClick={() => onNavigate("shop")}>
          <strong>Shop</strong>
          <span>Belohnungen ansehen</span>
        </button>
      </section>
    </div>
  );
}
