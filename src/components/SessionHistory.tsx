import { useState } from "react";
import type { Difficulty, SessionHistoryEntry } from "../types";

export function SessionHistory({ sessions }: { sessions: SessionHistoryEntry[] }) {
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const categories = [...new Set(sessions.map((session) => session.category))];
  const filtered = sessions.filter(
    (session) =>
      (!category || session.category === category) &&
      (difficulty === "all" || session.difficulty === difficulty),
  );

  return (
    <section className="panel history-panel">
      <div className="section-heading">
        <span className="eyebrow">Session-Historie</span>
        <h2>Neueste zuerst</h2>
      </div>
      <div className="history-filters">
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">Alle Fächer</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as "all" | Difficulty)}>
          <option value="all">Alle Schwierigkeiten</option>
          <option value="easy">leicht</option>
          <option value="medium">mittel</option>
          <option value="hard">schwer</option>
        </select>
      </div>
      <div className="history-list">
        {filtered.length > 0 ? (
          filtered.slice(0, 10).map((session) => (
            <article className="history-item" key={session.id}>
              <div>
                <strong>{session.questTitle}</strong>
                <span>{session.dateKey} · {session.category} · {session.difficulty}</span>
                {session.reflection ? <small>Reflexion: {session.reflection.mood}</small> : null}
              </div>
              <div>
                <span>{session.durationMinutes} Min</span>
                <span>+{session.earnedCoins} Coins</span>
                <span>+{session.earnedXp} XP</span>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-state">Noch keine passende Session. Schließe eine Quest ab, dann erscheint sie hier.</p>
        )}
      </div>
    </section>
  );
}
