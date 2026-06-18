import { brainworkoutAreaLabels } from "../data/brainworkoutQuestPool";
import type { BrainworkoutWeeklyPlan } from "../types";

const timeLabels: Record<BrainworkoutWeeklyPlan["availableTimeEstimate"], string> = {
  under_2h: "unter 2 Stunden",
  "2_4h": "2 bis 4 Stunden",
  "4_6h": "4 bis 6 Stunden",
  over_6h: "mehr als 6 Stunden",
};

const energyLabels: Record<BrainworkoutWeeklyPlan["energyLevel"], string> = {
  low: "niedrig",
  medium: "mittel",
  high: "hoch",
};

const pressureLabels: Record<BrainworkoutWeeklyPlan["pressureLevel"], string> = {
  low: "ruhig",
  medium: "normal",
  high: "fordernd",
};

export function WeeklyPlanSummaryCard({ plan, onEdit }: { plan?: BrainworkoutWeeklyPlan; onEdit?: () => void }) {
  if (!plan) {
    return (
      <article className="content-card weekly-plan-summary">
        <span className="eyebrow">Wochenplanung</span>
        <h2>Plane deine Woche in 2 Minuten</h2>
        <p>Lege Fokus, Zeit und Druck bewusst fest. Das ist eine Orientierung, keine Pflichtliste.</p>
        {onEdit ? (
          <button className="button button--primary" type="button" onClick={onEdit}>
            Wochenplanung starten
          </button>
        ) : null}
      </article>
    );
  }

  return (
    <article className="content-card weekly-plan-summary">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Aktueller Wochenplan</span>
          <h2>{brainworkoutAreaLabels[plan.mainFocusArea]}</h2>
        </div>
        {onEdit ? (
          <button className="button button--ghost" type="button" onClick={onEdit}>
            Bearbeiten
          </button>
        ) : null}
      </div>
      <div className="weekly-plan-facts">
        <span>{timeLabels[plan.availableTimeEstimate]}</span>
        <span>Energie: {energyLabels[plan.energyLevel]}</span>
        <span>Druck: {pressureLabels[plan.pressureLevel]}</span>
      </div>
      <p>{plan.concreteGoal || "Diese Woche ruhig Fortschritt sammeln."}</p>
      {plan.obligations.length > 0 ? <small>Verpflichtungen: {plan.obligations.join(", ")}</small> : null}
      {plan.fixedAppointmentsNote ? <small>Termine: {plan.fixedAppointmentsNote}</small> : null}
    </article>
  );
}
