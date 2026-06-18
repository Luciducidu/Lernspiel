import { useState } from "react";
import { brainworkoutAreaLabels } from "../data/brainworkoutQuestPool";
import type { BrainworkoutAreaId, BrainworkoutWeeklyPlan, WeeklyEnergyLevel, WeeklyPressureLevel } from "../types";

type PlanDraft = Pick<
  BrainworkoutWeeklyPlan,
  "availableTimeEstimate" | "fixedAppointmentsNote" | "mainFocusArea" | "energyLevel" | "obligations" | "pressureLevel" | "concreteGoal"
>;

interface WeeklyPlanFormProps {
  currentPlan?: BrainworkoutWeeklyPlan;
  onSave: (draft: PlanDraft) => void;
}

const obligationOptions = ["Führerschein", "Familie", "Sport", "Freizeit", "Arbeit", "Haushalt"];

export function WeeklyPlanForm({ currentPlan, onSave }: WeeklyPlanFormProps) {
  const [draft, setDraft] = useState<PlanDraft>({
    availableTimeEstimate: currentPlan?.availableTimeEstimate ?? "2_4h",
    fixedAppointmentsNote: currentPlan?.fixedAppointmentsNote ?? "",
    mainFocusArea: currentPlan?.mainFocusArea ?? "math_first_semester",
    energyLevel: currentPlan?.energyLevel ?? "medium",
    obligations: currentPlan?.obligations ?? [],
    pressureLevel: currentPlan?.pressureLevel ?? "low",
    concreteGoal: currentPlan?.concreteGoal ?? "",
  });

  function toggleObligation(value: string) {
    setDraft((current) => ({
      ...current,
      obligations: current.obligations.includes(value)
        ? current.obligations.filter((item) => item !== value)
        : [...current.obligations, value],
    }));
  }

  return (
    <section className="content-card weekly-plan-form">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Wochenplanung</span>
          <h2>Realistisch planen</h2>
        </div>
      </div>
      <div className="quest-form">
        <label>
          Zeit diese Woche
          <select value={draft.availableTimeEstimate} onChange={(event) => setDraft({ ...draft, availableTimeEstimate: event.target.value as PlanDraft["availableTimeEstimate"] })}>
            <option value="under_2h">unter 2 Stunden</option>
            <option value="2_4h">2 bis 4 Stunden</option>
            <option value="4_6h">4 bis 6 Stunden</option>
            <option value="over_6h">mehr als 6 Stunden</option>
          </select>
        </label>
        <label>
          Wichtigster Bereich
          <select value={draft.mainFocusArea} onChange={(event) => setDraft({ ...draft, mainFocusArea: event.target.value as BrainworkoutAreaId })}>
            {(Object.keys(brainworkoutAreaLabels) as BrainworkoutAreaId[]).map((area) => (
              <option key={area} value={area}>{brainworkoutAreaLabels[area]}</option>
            ))}
          </select>
        </label>
        <label>
          Energie
          <select value={draft.energyLevel} onChange={(event) => setDraft({ ...draft, energyLevel: event.target.value as WeeklyEnergyLevel })}>
            <option value="low">niedrig</option>
            <option value="medium">mittel</option>
            <option value="high">hoch</option>
          </select>
        </label>
        <label>
          Drucklevel
          <select value={draft.pressureLevel} onChange={(event) => setDraft({ ...draft, pressureLevel: event.target.value as WeeklyPressureLevel })}>
            <option value="low">ruhig</option>
            <option value="medium">normal</option>
            <option value="high">fordernd</option>
          </select>
        </label>
        <label className="quest-form__wide">
          Feste Termine oder Einschränkungen
          <textarea value={draft.fixedAppointmentsNote} onChange={(event) => setDraft({ ...draft, fixedAppointmentsNote: event.target.value })} placeholder="z. B. Sport Dienstag, Familienzeit Sonntag" />
        </label>
        <div className="quest-form__wide">
          <span className="form-label">Verpflichtungen</span>
          <div className="subject-chip-list">
            {obligationOptions.map((option) => (
              <button
                className={`subject-chip ${draft.obligations.includes(option) ? "subject-chip--high" : "subject-chip--low"}`}
                key={option}
                type="button"
                onClick={() => toggleObligation(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <label className="quest-form__wide">
          Konkretes Wochenziel
          <textarea value={draft.concreteGoal} onChange={(event) => setDraft({ ...draft, concreteGoal: event.target.value })} placeholder="z. B. zwei ruhige Mathe-Einheiten und eine kurze Reflexion" />
        </label>
        <button className="button button--primary quest-form__wide" type="button" onClick={() => onSave(draft)}>
          Wochenplan speichern
        </button>
      </div>
    </section>
  );
}
