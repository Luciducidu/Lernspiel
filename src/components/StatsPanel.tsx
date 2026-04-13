import type { StatsSummary } from "../types";
import { ProgressBar } from "./ProgressBar";

export function StatsPanel({ stats }: { stats: StatsSummary }) {
  const maxDifficulty = Math.max(1, ...Object.values(stats.difficultyDistribution));
  const maxDay = Math.max(1, ...stats.completedByDay.map((day) => day.count));

  return (
    <section className="panel stats-panel">
      <div className="section-heading">
        <span className="eyebrow">Statistik</span>
        <h2>Langzeitfortschritt</h2>
      </div>
      <div className="stats-grid">
        <strong>{stats.totalCompletedQuests}<span>Quests</span></strong>
        <strong>{stats.totalCoinsEarned}<span>Coins verdient</span></strong>
        <strong>{stats.totalCoinsSpent}<span>Coins ausgegeben</span></strong>
        <strong>{stats.totalXpEarned}<span>XP gesammelt</span></strong>
        <strong>{stats.currentStreak}<span>aktuelle Streak</span></strong>
        <strong>{stats.longestStreak}<span>längste Streak</span></strong>
        <strong>{stats.totalFocusMinutes}<span>Fokus-Minuten</span></strong>
        <strong>{stats.focusTodayMinutes}<span>heute</span></strong>
        <strong>{stats.focusWeekMinutes}<span>diese Woche</span></strong>
        <strong>{stats.chestsOpened}<span>Chests geöffnet</span></strong>
        <strong>{stats.totalGemsEarned}<span>Gems erhalten</span></strong>
        <strong>{stats.topCategory}<span>Top-Fach</span></strong>
      </div>
      <div className="chart-grid">
        <div>
          <h3>Schwierigkeit</h3>
          <ProgressBar value={stats.difficultyDistribution.easy} max={maxDifficulty} label="Leicht" />
          <ProgressBar value={stats.difficultyDistribution.medium} max={maxDifficulty} label="Mittel" />
          <ProgressBar value={stats.difficultyDistribution.hard} max={maxDifficulty} label="Schwer" />
        </div>
        <div>
          <h3>Letzte Tage</h3>
          {stats.completedByDay.length > 0 ? (
            stats.completedByDay.map((day) => <ProgressBar key={day.dateKey} value={day.count} max={maxDay} label={day.dateKey} />)
          ) : (
            <p>Noch keine abgeschlossenen Sessions.</p>
          )}
        </div>
      </div>
    </section>
  );
}
