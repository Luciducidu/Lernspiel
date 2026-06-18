import { ProgressBar } from "./ProgressBar";

interface DayTierCardProps {
  title: string;
  description: string;
  targetMinutes: number;
  currentMinutes: number;
  tone: "minimum" | "normal" | "strong";
}

export function DayTierCard({ title, description, targetMinutes, currentMinutes, tone }: DayTierCardProps) {
  const isReached = currentMinutes >= targetMinutes;

  return (
    <article className={`day-tier-card day-tier-card--${tone} ${isReached ? "day-tier-card--reached" : ""}`}>
      <span className="goal-status goal-status--available">{isReached ? "Erreicht" : "Heute"}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <ProgressBar value={Math.min(currentMinutes, targetMinutes)} max={targetMinutes} label={`${targetMinutes} Min`} />
    </article>
  );
}
