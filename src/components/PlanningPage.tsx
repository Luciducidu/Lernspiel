import { useState } from "react";
import { brainworkoutAreaLabels } from "../data/brainworkoutQuestPool";
import type {
  AppMode,
  BrainworkoutWeeklyPlan,
  BrainworkoutWeeklyReflection,
  DailyGoal,
  FocusSummary,
  Quest,
  SubjectPrioritySetting,
  WeeklySchedule,
} from "../types";
import { DailyGoalCard } from "./DailyGoalCard";
import { DailyPlanTierSelector } from "./DailyPlanTierSelector";
import { WeeklyPlanForm } from "./WeeklyPlanForm";
import { WeeklyPlanSummaryCard } from "./WeeklyPlanSummaryCard";
import { WeeklyReflectionForm } from "./WeeklyReflectionForm";
import { WeeklyReflectionSummaryCard } from "./WeeklyReflectionSummaryCard";
import { WeeklyScheduleBoard } from "./WeeklyScheduleBoard";

interface PlanningPageProps {
  activeMode: AppMode;
  subjects: SubjectPrioritySetting[];
  dailyGoals: DailyGoal[];
  weeklyGoals: DailyGoal[];
  focusSummary: FocusSummary;
  quests: Quest[];
  weeklySchedule?: WeeklySchedule;
  currentWeeklyPlan?: BrainworkoutWeeklyPlan;
  latestWeeklyReflection?: BrainworkoutWeeklyReflection;
  onClaimDaily: (goalId: string) => void;
  onClaimWeekly: (goalId: string) => void;
  onSelectQuest: (quest: Quest) => void;
  onSaveWeeklySchedule: (schedule: WeeklySchedule) => void;
  onSaveWeeklyPlan: Parameters<typeof WeeklyPlanForm>[0]["onSave"];
  onSaveWeeklyReflection: Parameters<typeof WeeklyReflectionForm>[0]["onSave"];
  onCopyReflectionPrompt: () => void;
}

function buildPlanGoals(plan?: BrainworkoutWeeklyPlan): string[] {
  if (!plan) {
    return ["Wochenfokus festlegen", "Eine kleine Brainworkout-Einheit starten", "Am Wochenende kurz reflektieren"];
  }

  const focus = brainworkoutAreaLabels[plan.mainFocusArea];
  const intensity = plan.energyLevel === "low" || plan.pressureLevel === "low" ? "2 kleine" : plan.energyLevel === "high" ? "3" : "2";
  const obligations = plan.obligations.includes("Fuehrerschein") ? ["1 kurze Fuehrerschein-App-Einheit"] : [];
  return [
    `${intensity} Einheiten im Fokus ${focus}`,
    plan.energyLevel === "low" ? "1 Pflichtminimum-Tag reicht aus" : "1 normale Brainworkout-Einheit",
    ...obligations,
    "Wochenreflexion abschliessen",
  ];
}

export function PlanningPage({
  activeMode,
  subjects,
  dailyGoals,
  weeklyGoals,
  focusSummary,
  quests,
  weeklySchedule,
  currentWeeklyPlan,
  latestWeeklyReflection,
  onClaimDaily,
  onClaimWeekly,
  onSelectQuest,
  onSaveWeeklySchedule,
  onSaveWeeklyPlan,
  onSaveWeeklyReflection,
  onCopyReflectionPrompt,
}: PlanningPageProps) {
  const [tab, setTab] = useState<"schedule" | "goals" | "focus" | "tiers" | "reflection">("schedule");
  const planGoals = buildPlanGoals(currentWeeklyPlan);
  const isBrainworkout = activeMode === "brainworkout";

  return (
    <div className="page-stack">
      <div className="tabs planning-tabs" role="tablist" aria-label="Wochenplanung">
        <button className={tab === "schedule" ? "tab tab--active" : "tab"} type="button" onClick={() => setTab("schedule")}>Stundenplan</button>
        <button className={tab === "goals" ? "tab tab--active" : "tab"} type="button" onClick={() => setTab("goals")}>Ziele und Rueckblick</button>
        {isBrainworkout ? <button className={tab === "focus" ? "tab tab--active" : "tab"} type="button" onClick={() => setTab("focus")}>Wochenfokus</button> : null}
        {isBrainworkout ? <button className={tab === "tiers" ? "tab tab--active" : "tab"} type="button" onClick={() => setTab("tiers")}>Tagesstufen</button> : null}
        {isBrainworkout ? <button className={tab === "reflection" ? "tab tab--active" : "tab"} type="button" onClick={() => setTab("reflection")}>Reflexion</button> : null}
      </div>

      {tab === "schedule" ? (
        <WeeklyScheduleBoard
          activeMode={activeMode}
          subjects={subjects}
          schedule={weeklySchedule}
          onSave={onSaveWeeklySchedule}
        />
      ) : null}

      {tab === "goals" ? (
        <div className="page-stack">
          <section className="content-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Tagesziele</span>
                <h2>Heute bewusst abschliessen</h2>
              </div>
            </div>
            <div className="daily-goal-grid">{dailyGoals.map((goal) => <DailyGoalCard key={goal.id} goal={goal} onClaim={onClaimDaily} />)}</div>
          </section>
          <section className="content-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Wochenziele</span>
                <h2>Was in dieser Woche zaehlt</h2>
              </div>
            </div>
            <div className="daily-goal-grid weekly-goal-grid">{weeklyGoals.map((goal) => <DailyGoalCard key={goal.id} goal={goal} onClaim={onClaimWeekly} />)}</div>
          </section>
          {isBrainworkout ? (
            <section className="content-card">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Abgeleiteter Wochenfokus</span>
                  <h2>{currentWeeklyPlan ? brainworkoutAreaLabels[currentWeeklyPlan.mainFocusArea] : "Noch ohne Wochenfokus"}</h2>
                </div>
              </div>
              <div className="prep-block-grid">
                {planGoals.map((goal) => <article className="prep-block-card" key={goal}><strong>{goal}</strong><p>Orientierung statt Druck. Passe die Woche an deine Energie an.</p></article>)}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {tab === "focus" && isBrainworkout ? (
        <div className="page-stack">
          <WeeklyPlanSummaryCard plan={currentWeeklyPlan} />
          <WeeklyPlanForm currentPlan={currentWeeklyPlan} onSave={onSaveWeeklyPlan} />
        </div>
      ) : null}

      {tab === "tiers" && isBrainworkout ? (
        <DailyPlanTierSelector todayMinutes={focusSummary.todayMinutes} quests={quests} onSelectQuest={onSelectQuest} weeklyPlan={currentWeeklyPlan} />
      ) : null}

      {tab === "reflection" && isBrainworkout ? (
        <div className="page-stack">
          <WeeklyReflectionSummaryCard reflection={latestWeeklyReflection} onCopyPrompt={onCopyReflectionPrompt} />
          <WeeklyReflectionForm currentReflection={latestWeeklyReflection} onSave={onSaveWeeklyReflection} />
        </div>
      ) : null}

      {!isBrainworkout && tab === "focus" ? <p className="empty-state">Der Wochenfokus ist im Brainworkout-Modus verfuegbar.</p> : null}
      {!isBrainworkout && tab === "tiers" ? <p className="empty-state">Tagesstufen sind im Brainworkout-Modus verfuegbar.</p> : null}
      {!isBrainworkout && tab === "reflection" ? <p className="empty-state">Die Wochenreflexion ist im Brainworkout-Modus verfuegbar.</p> : null}
      {subjects.length === 0 ? <p className="empty-state">Lege in den Einstellungen einen Fachfokus fest.</p> : null}
    </div>
  );
}
