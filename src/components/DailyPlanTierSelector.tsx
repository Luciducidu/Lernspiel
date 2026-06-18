import { DayTierCard } from "./DayTierCard";

interface DailyPlanTierSelectorProps {
  todayMinutes: number;
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

export function DailyPlanTierSelector({ todayMinutes }: DailyPlanTierSelectorProps) {
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
          <DayTierCard key={tier.title} currentMinutes={todayMinutes} {...tier} />
        ))}
      </div>
    </section>
  );
}
