import type { AppMode, DailyGoal, FocusSummary, SubjectPrioritySetting } from "../types";
import { DailyGoalCard } from "./DailyGoalCard";
import { DailyPlanTierSelector } from "./DailyPlanTierSelector";
import { ProgressBar } from "./ProgressBar";
import { SubjectPriorityCard } from "./SubjectPriorityCard";
import { WeeklyFocusCard } from "./WeeklyFocusCard";

interface PlanningPageProps {
  activeMode: AppMode;
  subjects: SubjectPrioritySetting[];
  dailyGoals: DailyGoal[];
  weeklyGoals: DailyGoal[];
  focusSummary: FocusSummary;
  onClaimDaily: (goalId: string) => void;
  onClaimWeekly: (goalId: string) => void;
}

export function PlanningPage({ activeMode, subjects, dailyGoals, weeklyGoals, focusSummary, onClaimDaily, onClaimWeekly }: PlanningPageProps) {
  if (activeMode === "brainworkout") {
    return (
      <div className="page-stack">
        <DailyPlanTierSelector todayMinutes={focusSummary.todayMinutes} />
        <WeeklyFocusCard title="Woche ruhig strukturieren" description="Lege fest, was realistisch ist. Die vollstaendige Wochenplanung kommt spaeter." goals={weeklyGoals} />
        <section className="planning-grid">
          <article className="content-card">
            <span className="eyebrow">Naechste Planung</span>
            <h2>Platzhalter fuer Routinen</h2>
            <p>Hier werden spaeter konkrete Brainworkout-Wochenplaene, Reflexionen und externe Routinen gebuendelt.</p>
          </article>
          <article className="content-card">
            <span className="eyebrow">Heute</span>
            <h2>Tagesquests</h2>
            <div className="daily-goal-grid daily-goal-grid--compact">
              {dailyGoals.slice(0, 2).map((goal) => (
                <DailyGoalCard key={goal.id} goal={goal} onClaim={onClaimDaily} />
              ))}
            </div>
          </article>
        </section>
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
