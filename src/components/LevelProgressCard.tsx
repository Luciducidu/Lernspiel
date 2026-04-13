import type { LevelInfo } from "../types";
import { ProgressBar } from "./ProgressBar";

export function LevelProgressCard({ levelInfo }: { levelInfo: LevelInfo }) {
  return (
    <article className="level-progress-card">
      <span className="eyebrow">Level</span>
      <h3>Level {levelInfo.level}</h3>
      <ProgressBar value={levelInfo.xpInCurrentLevel} max={levelInfo.xpForNextLevel} label="Fortschritt zum nächsten Level" />
    </article>
  );
}
