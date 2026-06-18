import { useState } from "react";
import type { BrainworkoutReflectionMood, BrainworkoutWeeklyReflection, WeeklyEnergyLevel } from "../types";

type ReflectionDraft = Omit<BrainworkoutWeeklyReflection, "id" | "weekId" | "completedAt">;

interface WeeklyReflectionFormProps {
  currentReflection?: BrainworkoutWeeklyReflection;
  onSave: (draft: ReflectionDraft) => void;
}

export function WeeklyReflectionForm({ currentReflection, onSave }: WeeklyReflectionFormProps) {
  const [draft, setDraft] = useState<ReflectionDraft>({
    accomplished: currentReflection?.accomplished ?? "",
    tooMuch: currentReflection?.tooMuch ?? "",
    understood: currentReflection?.understood ?? "",
    enjoyable: currentReflection?.enjoyable ?? "",
    simplifyNextWeek: currentReflection?.simplifyNextWeek ?? "",
    nextWeekGoal: currentReflection?.nextWeekGoal ?? "",
    mood: currentReflection?.mood ?? "mixed",
    energyAfterWeek: currentReflection?.energyAfterWeek ?? "medium",
    notes: currentReflection?.notes ?? "",
  });

  return (
    <section className="content-card weekly-reflection-form">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Wochenreflexion</span>
          <h2>Kurz auswerten</h2>
        </div>
      </div>
      <div className="quest-form">
        <label>
          Gefühl zur Woche
          <select value={draft.mood} onChange={(event) => setDraft({ ...draft, mood: event.target.value as BrainworkoutReflectionMood })}>
            <option value="good">gut</option>
            <option value="mixed">gemischt</option>
            <option value="hard">schwer</option>
          </select>
        </label>
        <label>
          Energie danach
          <select value={draft.energyAfterWeek} onChange={(event) => setDraft({ ...draft, energyAfterWeek: event.target.value as WeeklyEnergyLevel })}>
            <option value="low">niedrig</option>
            <option value="medium">mittel</option>
            <option value="high">hoch</option>
          </select>
        </label>
        <label className="quest-form__wide">
          Was habe ich geschafft?
          <textarea value={draft.accomplished} onChange={(event) => setDraft({ ...draft, accomplished: event.target.value })} />
        </label>
        <label className="quest-form__wide">
          Was war zu viel?
          <textarea value={draft.tooMuch} onChange={(event) => setDraft({ ...draft, tooMuch: event.target.value })} />
        </label>
        <label className="quest-form__wide">
          Was habe ich wirklich verstanden?
          <textarea value={draft.understood} onChange={(event) => setDraft({ ...draft, understood: event.target.value })} />
        </label>
        <label className="quest-form__wide">
          Was hat Spaß gemacht?
          <textarea value={draft.enjoyable} onChange={(event) => setDraft({ ...draft, enjoyable: event.target.value })} />
        </label>
        <label className="quest-form__wide">
          Was sollte nächste Woche einfacher werden?
          <textarea value={draft.simplifyNextWeek} onChange={(event) => setDraft({ ...draft, simplifyNextWeek: event.target.value })} />
        </label>
        <label className="quest-form__wide">
          Konkretes Ziel für nächste Woche
          <textarea value={draft.nextWeekGoal} onChange={(event) => setDraft({ ...draft, nextWeekGoal: event.target.value })} />
        </label>
        <button className="button button--primary quest-form__wide" type="button" onClick={() => onSave(draft)}>
          Reflexion speichern
        </button>
      </div>
    </section>
  );
}
