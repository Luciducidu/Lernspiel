import type { LevelInfo, LevelUnlock } from "../types";
import { ProgressBar } from "./ProgressBar";

interface UnlockPreviewCardProps {
  nextUnlock?: LevelUnlock;
  levelInfo: LevelInfo;
}

export function UnlockPreviewCard({ nextUnlock, levelInfo }: UnlockPreviewCardProps) {
  if (!nextUnlock) {
    return (
      <article className="unlock-preview-card">
        <span className="eyebrow">Nächstes Unlock-Ziel</span>
        <h3>Alle bekannten Freischaltungen erreicht</h3>
        <p>Stärke deinen Vorrat und sammle weiter XP für kommende Inhalte.</p>
      </article>
    );
  }

  const levelsLeft = Math.max(0, nextUnlock.level - levelInfo.level);

  return (
    <article className="unlock-preview-card">
      <span className="eyebrow">Nächstes Unlock-Ziel</span>
      <h3>
        Level {nextUnlock.level}: {nextUnlock.title}
      </h3>
      <p>{nextUnlock.description}</p>
      <ProgressBar value={levelInfo.xpInCurrentLevel} max={levelInfo.xpForNextLevel} label={`${levelsLeft} Level entfernt`} />
    </article>
  );
}
