import { useState } from "react";
import { brainworkoutAreaLabels } from "../data/brainworkoutQuestPool";
import type { AppMode, BrainworkoutWeeklyPlan, BrainworkoutWeeklyReflection, DailyGoal, FocusSummary, Quest, SubjectPrioritySetting } from "../types";
import { DailyGoalCard } from "./DailyGoalCard";
import { DailyPlanTierSelector } from "./DailyPlanTierSelector";
import { ProgressBar } from "./ProgressBar";
import { SubjectPriorityCard } from "./SubjectPriorityCard";
import { WeeklyPlanForm } from "./WeeklyPlanForm";
import { WeeklyPlanSummaryCard } from "./WeeklyPlanSummaryCard";
import { WeeklyFocusCard } from "./WeeklyFocusCard";
import { WeeklyReflectionForm } from "./WeeklyReflectionForm";
import { WeeklyReflectionSummaryCard } from "./WeeklyReflectionSummaryCard";

interface PlanningPageProps {
  activeMode: AppMode;
  subjects: SubjectPrioritySetting[];
  dailyGoals: DailyGoal[];
  weeklyGoals: DailyGoal[];
  focusSummary: FocusSummary;
  quests: Quest[];
  currentWeeklyPlan?: BrainworkoutWeeklyPlan;
  latestWeeklyReflection?: BrainworkoutWeeklyReflection;
  onClaimDaily: (goalId: string) => void;
  onClaimWeekly: (goalId: string) => void;
  onSelectQuest: (quest: Quest) => void;
  onSaveWeeklyPlan: Parameters<typeof WeeklyPlanForm>[0]["onSave"];
  onSaveWeeklyReflection: Parameters<typeof WeeklyReflectionForm>[0]["onSave"];
  onCopyReflectionPrompt: () => void;
}

function buildPlanGoals(plan?: BrainworkoutWeeklyPlan): string[] {
  if (!plan) {
    return ["Wochenplanung ausfüllen", "Eine kleine Brainworkout-Einheit starten", "Am Wochenende kurz reflektieren"];
  }

  const focus = brainworkoutAreaLabels[plan.mainFocusArea];
  const intensity = plan.energyLevel === "low" || plan.pressureLevel === "low" ? "2 kleine" : plan.energyLevel === "high" ? "3" : "2";
  const obligations = plan.obligations.includes("Führerschein") ? ["1 kurze Führerschein-App-Einheit"] : [];
  return [
    `${intensity} Einheiten im Fokus ${focus}`,
    plan.energyLevel === "low" ? "1 Pflichtminimum-Tag reicht aus" : "1 normale Brainworkout-Einheit",
    ...obligations,
    "Wochenreflexion abschließen",
  ];
}

export function PlanningPage({
  activeMode,
  subjects,
  dailyGoals,
  weeklyGoals,
  focusSummary,
  quests,
  currentWeeklyPlan,
  latestWeeklyReflection,
  onClaimDaily,
  onClaimWeekly,
  onSelectQuest,
  onSaveWeeklyPlan,
  onSaveWeeklyReflection,
  onCopyReflectionPrompt,
}: PlanningPageProps) {
  const [brainTab, setBrainTab] = useState<"plan" | "tiers" | "goals" | "reflection">("plan");

  if (activeMode === "brainworkout") {
    const planGoals = buildPlanGoals(currentWeeklyPlan);

    return (
      <div className="page-stack">
        <div className="tabs" role="tablist" aria-label="Brainworkout-Planung">
          <button className={brainTab === "plan" ? "tab tab--active" : "tab"} type="button" onClick={() => setBrainTab("plan")}>Wochenplanung</button>
          <button className={brainTab === "tiers" ? "tab tab--active" : "tab"} type="button" onClick={() => setBrainTab("tiers")}>Tagesstufen</button>
          <button className={brainTab === "goals" ? "tab tab--active" : "tab"} type="button" onClick={() => setBrainTab("goals")}>Wochenziele</button>
          <button className={brainTab === "reflection" ? "tab tab--active" : "tab"} type="button" onClick={() => setBrainTab("reflection")}>Reflexion</button>
        </div>

        {brainTab === "plan" ? (
          <>
            <WeeklyPlanSummaryCard plan={currentWeeklyPlan} />
            <WeeklyPlanForm currentPlan={currentWeeklyPlan} onSave={onSaveWeeklyPlan} />
          </>
        ) : null}

        {brainTab === "tiers" ? (
          <DailyPlanTierSelector todayMinutes={focusSummary.todayMinutes} quests={quests} onSelectQuest={onSelectQuest} weeklyPlan={currentWeeklyPlan} />
        ) : null}

        {brainTab === "goals" ? (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Abgeleitete Wochenziele</span>
                <h2>{currentWeeklyPlan ? brainworkoutAreaLabels[currentWeeklyPlan.mainFocusArea] : "Noch ohne Wochenfokus"}</h2>
              </div>
            </div>
            <div className="prep-block-grid">
              {planGoals.map((goal) => (
                <article className="prep-block-card" key={goal}>
                  <strong>{goal}</strong>
                  <p>Orientierung statt Pflicht. Passe die Woche an deine Energie an.</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {brainTab === "reflection" ? (
          <>
            <WeeklyReflectionSummaryCard reflection={latestWeeklyReflection} onCopyPrompt={onCopyReflectionPrompt} />
            <WeeklyReflectionForm currentReflection={latestWeeklyReflection} onSave={onSaveWeeklyReflection} />
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="planning-grid">
        <article className="content-card planning-lead-card">
          <span className="eyebrow">Abi-Planung</span>
          <h2>Diese Woche pruefungsnah strukturieren</h2>
          <p>Priorisiere Deutsch, PB und Mathe. Plane kleine Bloecke statt eine ueberladene Tagesliste.</p>
          <ProgressBar value={focusSummary.weekMinutes} max={180} label="Wochenfokus" />
        </article>
        <SubjectPriorityCard subjects={subjects} />
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Vorbereitungsbloecke</span>
            <h2>Abi-nahe Wochenstruktur</h2>
          </div>
        </div>
        <div className="prep-block-grid">
          <article className="prep-block-card">
            <strong>Deutsch zuerst</strong>
            <p>Schreibplan, Analyse oder materialgestuetztes Schreiben als Hauptblock.</p>
          </article>
          <article className="prep-block-card">
            <strong>PB absichern</strong>
            <p>Begriffe, Urteilsstruktur oder Statistikanalyse in kurzen Einheiten.</p>
          </article>
          <article className="prep-block-card">
            <strong>Mathe rechnen</strong>
            <p>Ein ueberschaubarer Aufgabenblock mit Kontrolle und Fehleranalyse.</p>
          </article>
        </div>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Wochenquests</span>
            <h2>Abholen, wenn erledigt</h2>
          </div>
        </div>
        <div className="daily-goal-grid weekly-goal-grid">
          {weeklyGoals.map((goal) => (
            <DailyGoalCard key={goal.id} goal={goal} onClaim={onClaimWeekly} />
          ))}
        </div>
      </section>
    </div>
  );
}
