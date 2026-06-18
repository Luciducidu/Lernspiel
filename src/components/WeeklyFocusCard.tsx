import type { DailyGoal } from "../types";
import { ProgressBar } from "./ProgressBar";

interface WeeklyFocusCardProps {
  title: string;
  description: string;
  goals: DailyGoal[];
}

export function WeeklyFocusCard({ title, description, goals }: WeeklyFocusCardProps) {
  return (
    <section className="weekly-focus-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Wochenfokus</span>
          <h2>{title}</h2>
        </div>
      </div>
      <p>{description}</p>
      <div className="weekly-focus-list">
        {goals.slice(0, 3).map((goal) => (
          <div className="weekly-focus-row" key={goal.id}>
            <strong>{goal.title}</strong>
            <ProgressBar value={Math.min(goal.current, goal.target)} max={goal.target} label="Fortschritt" />
          </div>
        ))}
      </div>
    </section>
  );
}
