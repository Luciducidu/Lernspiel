import type { BrainworkoutAreaId } from "../types";
import { ProgressBar } from "./ProgressBar";

const areaLabels: Record<BrainworkoutAreaId, string> = {
  math_first_semester: "Mathe-Erstsemester",
  physics_first_semester: "Physik-Erstsemester",
  language_poetry_slam: "Sprache & Poetry",
  logic_puzzles: "Logik",
  chess_external: "Schach",
  driving_license: "Fuehrerschein",
  housework_life: "Alltag",
};

interface AreaProgressGridProps {
  progress: Record<BrainworkoutAreaId, number>;
}

export function AreaProgressGrid({ progress }: AreaProgressGridProps) {
  const primaryAreas: BrainworkoutAreaId[] = [
    "math_first_semester",
    "physics_first_semester",
    "language_poetry_slam",
    "logic_puzzles",
  ];

  return (
    <section className="content-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Bereiche</span>
          <h2>Langfristiger Fortschritt</h2>
        </div>
      </div>
      <div className="area-progress-grid">
        {primaryAreas.map((area) => (
          <article className="area-progress-card" key={area}>
            <strong>{areaLabels[area]}</strong>
            <ProgressBar value={Math.min(progress[area] ?? 0, 100)} max={100} label="Aufbau" />
          </article>
        ))}
      </div>
    </section>
  );
}
