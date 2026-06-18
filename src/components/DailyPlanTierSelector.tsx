import { DayTierCard } from "./DayTierCard";
import type { BrainworkoutWeeklyPlan, Quest } from "../types";
import { brainworkoutQuestTypeLabels } from "../data/brainworkoutQuestPool";

interface DailyPlanTierSelectorProps {
  todayMinutes: number;
  quests?: Quest[];
  onSelectQuest?: (quest: Quest) => void;
  weeklyPlan?: BrainworkoutWeeklyPlan;
}

const tiers = [
  {
    title: "Pflichtminimum",
    description: "Eine kleine Einheit, damit der Tag zaehlt.",
    targetMinutes: 15,
    tone: "minimum" as const,
  },
  {
    title: "Normaler Tag",
    description: "Solider Fortschritt ohne Druck.",
    targetMinutes: 30,
    tone: "normal" as const,
  },
  {
    title: "Guter Tag",
    description: "Mehr Raum fuer ein Thema oder Training.",
    targetMinutes: 60,
    tone: "strong" as const,
  },
];

export function DailyPlanTierSelector({ todayMinutes, quests = [], onSelectQuest, weeklyPlan }: DailyPlanTierSelectorProps) {
  const sortedQuests = [...quests].sort((a, b) => {
    const focusA = weeklyPlan && a.area === weeklyPlan.mainFocusArea ? 1 : 0;
    const focusB = weeklyPlan && b.area === weeklyPlan.mainFocusArea ? 1 : 0;
    const energyA = weeklyPlan?.energyLevel === "low" && a.dailyPlanTier === "minimum" ? 1 : 0;
    const energyB = weeklyPlan?.energyLevel === "low" && b.dailyPlanTier === "minimum" ? 1 : 0;
    const obligationA = weeklyPlan?.obligations.includes("Führerschein") && a.brainworkoutQuestType === "driving_app" ? 1 : 0;
    const obligationB = weeklyPlan?.obligations.includes("Führerschein") && b.brainworkoutQuestType === "driving_app" ? 1 : 0;
    return focusB + energyB + obligationB - (focusA + energyA + obligationA);
  });

  return (
    <section className="content-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Tagesplanung</span>
          <h2>Waehle die passende Stufe</h2>
        </div>
        <span className="duration-pill">{todayMinutes} Min heute</span>
      </div>
      <div className="daily-plan-grid">
        {tiers.map((tier) => (
          <div className="day-tier-column" key={tier.title}>
            <DayTierCard currentMinutes={todayMinutes} {...tier} />
            {sortedQuests
              .filter((quest) => quest.dailyPlanTier === tier.tone && quest.status === "open")
              .slice(0, 2)
              .map((quest) => (
                <button className="tier-quest-suggestion" key={quest.id} type="button" onClick={() => onSelectQuest?.(quest)}>
                  <strong>{quest.title}</strong>
                  <span>
                    {quest.brainworkoutQuestType ? brainworkoutQuestTypeLabels[quest.brainworkoutQuestType] : quest.category} · {quest.durationMinutes} Min
                  </span>
                </button>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}
