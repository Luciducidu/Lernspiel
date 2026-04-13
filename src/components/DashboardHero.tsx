import type { AppPage, LevelInfo, LevelUnlock } from "../types";
import { ProgressBar } from "./ProgressBar";

interface DashboardHeroProps {
  focusText: string;
  levelInfo: LevelInfo;
  nextUnlock?: LevelUnlock;
  onNavigate: (page: AppPage) => void;
}

export function DashboardHero({ focusText, levelInfo, nextUnlock, onNavigate }: DashboardHeroProps) {
  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero__content">
        <span className="eyebrow">Abiturmodus</span>
        <h1>Heute zählt ein klarer Lernschritt.</h1>
        <p>Fokus aktuell: {focusText}. Plane kurz, nimm eine Quest bewusst an und halte die Session ruhig.</p>
        <ProgressBar value={levelInfo.xpInCurrentLevel} max={levelInfo.xpForNextLevel} label={`Level ${levelInfo.level}`} />
        <div className="hero-actions">
          <button className="button button--primary" type="button" onClick={() => onNavigate("quests")}>
            Neue Quest
          </button>
          <button className="button button--ghost" type="button" onClick={() => onNavigate("focus")}>
            Fokusmodus öffnen
          </button>
        </div>
      </div>
      <div className="dashboard-hero__note">
        <span>Nächstes Unlock</span>
        <strong>{nextUnlock ? `${nextUnlock.title} · Level ${nextUnlock.level}` : "Alle aktuellen Unlocks erreicht"}</strong>
      </div>
    </section>
  );
}
