import { FormEvent, useState } from "react";
import { DashboardCard } from "./components/DashboardCard";
import { CompletionModal } from "./components/CompletionModal";
import { DailyGoalCard } from "./components/DailyGoalCard";
import { GemActionPanel } from "./components/GemActionPanel";
import { LuckyChestModal } from "./components/LuckyChestModal";
import { ProgressBar } from "./components/ProgressBar";
import { QuestAcceptModal } from "./components/QuestAcceptModal";
import { QuestCard } from "./components/QuestCard";
import { SessionHistory } from "./components/SessionHistory";
import { ShopSection } from "./components/ShopSection";
import { StatsPanel } from "./components/StatsPanel";
import { TimerPanel } from "./components/TimerPanel";
import { UnlockPreviewCard } from "./components/UnlockPreviewCard";
import { gemSpecialActions } from "./data/balancing";
import { useAppDerivedState } from "./hooks/useAppDerivedState";
import { usePersistentState } from "./hooks/usePersistentState";
import type { ChestReward, CompletionSummary, Difficulty, Quest, ReflectionData, ShopItem } from "./types";
import {
  applyChestReward,
  applyAvailableGoalRewards,
  applyQuestStart,
  applyQuestCompletion,
  calculateQuestReward,
  drawChestReward,
  getLatestUnlock,
  getLevelInfo,
  isUnlocked,
  rescueStreak,
  rerollQuest,
  spendCoins,
  spendGems,
} from "./utils/gameRules";
import { loadProgress, loadQuests, saveProgress, saveQuests } from "./utils/storage";

const emptyForm = {
  title: "",
  category: "",
  durationMinutes: 25,
  difficulty: "easy" as Difficulty,
  note: "",
};

const placeboCodeLine = "no gameplay effect";

function App() {
  const [quests, setQuests] = usePersistentState<Quest[]>(loadQuests, saveQuests);
  const [progress, setProgress] = usePersistentState(loadProgress, saveProgress);
  const [questDraft, setQuestDraft] = useState(emptyForm);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [chestReward, setChestReward] = useState<ChestReward | null>(null);
  const [completionSummary, setCompletionSummary] = useState<CompletionSummary | null>(null);
  const [toast, setToast] = useState<string>("Bereit für deine nächste Quest.");

  const {
    levelInfo,
    focusSummary,
    statsSummary,
    streakState,
    activeQuest,
    completedToday,
    acceptedQuests,
    runningQuests,
    latestCompleted,
    latestUnlock,
    nextUnlock,
    standardItems,
    premiumItems,
    sortedQuests,
    dailyGoals,
    weeklyGoals,
    nextDailyGoal,
    nextWeeklyGoal,
  } = useAppDerivedState(quests, progress, activeQuestId);

  function updateQuest(questId: string, update: Partial<Quest>) {
    setQuests((current) => current.map((quest) => (quest.id === questId ? { ...quest, ...update } : quest)));
  }

  function handleCreateQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = questDraft.title.trim();
    const category = questDraft.category.trim();

    if (!title || !category || questDraft.durationMinutes < 1) {
      setToast("Titel, Fach und Dauer werden benötigt.");
      return;
    }

    const newQuest: Quest = {
      id: crypto.randomUUID(),
      title,
      category,
      durationMinutes: questDraft.durationMinutes,
      difficulty: questDraft.difficulty,
      note: questDraft.note.trim() || undefined,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    setQuests((current) => [newQuest, ...current]);
    setQuestDraft(emptyForm);
    setToast("Neue Quest erstellt. Tippe sie an, um sie bewusst anzunehmen.");
  }

  function handleAcceptQuest(quest: Quest) {
    if (quest.status !== "open") {
      setSelectedQuest(null);
      setToast("Diese Quest kann gerade nicht angenommen werden.");
      return;
    }

    // Der bewusste Annahmeschritt ist die einzige Stelle, an der offene Quests startbar werden.
    updateQuest(quest.id, { status: "accepted", acceptedAt: new Date().toISOString() });
    setSelectedQuest(null);
    setToast("Quest angenommen. Du kannst sie jetzt starten.");
  }

  function handleStartQuest(quest: Quest) {
    if (quest.status !== "accepted") {
      setToast("Nur angenommene Quests können gestartet werden.");
      return;
    }

    setQuests((current) =>
      current.map((currentQuest) => {
        if (currentQuest.id === quest.id) {
          return { ...currentQuest, status: "in_progress", startedAt: new Date().toISOString() };
        }

        return currentQuest.status === "in_progress" ? { ...currentQuest, status: "accepted" } : currentQuest;
      }),
    );
    setProgress((current) => applyQuestStart(current));
    setActiveQuestId(quest.id);
    setToast("Fokusmodus gestartet.");
  }

  function handleCancelFocus() {
    if (activeQuest?.id) {
      // Abbruch ist bewusst ein eigener Zustand: keine Belohnung, aber späteres Wiederöffnen bleibt möglich.
      updateQuest(activeQuest.id, { status: "cancelled", cancelledAt: new Date().toISOString() });
    }
    setActiveQuestId(null);
    setToast("Quest abgebrochen. Du kannst sie später wieder öffnen.");
  }

  function handleCompleteQuest(quest: Quest, focusMinutes: number) {
    if (quest.status !== "in_progress" || progress.sessionHistory.some((session) => session.questId === quest.id)) {
      setToast("Diese Quest wurde bereits beendet oder ist nicht im Fokusmodus.");
      return;
    }

    const reward = calculateQuestReward(quest);
    const oldLevel = levelInfo.level;
    const newLevel = getLevelInfo(progress.xp + reward.xp).level;
    const unlocked = newLevel > oldLevel ? getLatestUnlock(newLevel) : undefined;
    const unlockText = newLevel > oldLevel ? ` Level-Up auf ${newLevel}! ${unlocked?.title ?? ""}` : "";

    updateQuest(quest.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
    setProgress((current) => applyQuestCompletion(current, quest, reward, focusMinutes));
    setActiveQuestId(null);
    setCompletionSummary({
      questId: quest.id,
      questTitle: quest.title,
      reward,
      previousLevel: oldLevel,
      newLevel,
      unlocked,
    });
    setToast(`${reward.message}${unlockText}`);
  }

  function handleReopenQuest(quest: Quest) {
    if (quest.status !== "cancelled") {
      setToast("Nur abgebrochene Quests können wieder geöffnet werden.");
      return;
    }

    updateQuest(quest.id, { status: "open", cancelledAt: undefined });
    setToast("Quest wieder geöffnet. Wähle sie aus, um sie bewusst anzunehmen.");
  }

  function handleSaveReflection(questId: string, reflection: ReflectionData) {
    updateQuest(questId, { reflection });
    setProgress((current) => ({
      ...current,
      sessionHistory: current.sessionHistory.map((session) =>
        session.questId === questId ? { ...session, reflection } : session,
      ),
    }));
    setToast("Reflexion gespeichert.");
  }

  function handleRescueStreak() {
    const result = rescueStreak(progress);
    setProgress(result.progress);
    setToast(result.message);
  }

  function handleRerollQuest(quest: Quest) {
    if (quest.status !== "open") {
      setToast("Nur offene Quests können neu gewürfelt werden.");
      return;
    }

    if (progress.gems < 1) {
      setToast("Für Quest-Reroll fehlt 1 Gem.");
      return;
    }

    const nextQuest = rerollQuest(quest);
    setQuests((current) => current.map((item) => (item.id === quest.id ? nextQuest : item)));
    setProgress((current) => spendGems(current, 1));
    setToast("Quest neu gewürfelt. Prüfe sie und nimm sie bewusst an.");
  }

  function handleBuyItem(item: ShopItem) {
    if (!isUnlocked(item, levelInfo.level)) {
      setToast(`${item.name} wird ab Level ${item.unlockLevel} freigeschaltet.`);
      return;
    }

    if (item.currency === "coins" && progress.coins < item.price) {
      setToast("Dafür fehlen noch Coins.");
      return;
    }

    const reward = item.isLuckyChest && item.chestTier ? drawChestReward(item.chestTier) : null;

    setProgress((current) => {
      if (!isUnlocked(item, getLevelInfo(current.xp).level) || current.coins < item.price) {
        return current;
      }

      const paid = spendCoins(current, item.price);

      if (!item.isLuckyChest) {
        return applyAvailableGoalRewards({ ...paid, purchasedRewards: [...paid.purchasedRewards, item.name] }).progress;
      }

      return reward ? applyChestReward(paid, reward) : paid;
    });

    if (reward) {
      setChestReward(reward);
    }

    setToast(reward ? `${item.name} geöffnet: ${reward.title}.` : `${item.name} gekauft.`);
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <span className="eyebrow">LernQuest MVP</span>
          <h1>Willkommen zurück, Held des Lernens.</h1>
          <p>Nimm Quests bewusst an, bleib im Fokus und schalte mit jedem Level bessere Belohnungen frei.</p>
        </div>
        <a className="button button--primary" href="#new-quest">
          Neue Quest
        </a>
      </section>

      <section className="dashboard-grid" aria-label="Dashboard">
        <DashboardCard label="Coins" value={progress.coins} detail="Standardwährung" />
        <DashboardCard label="XP" value={progress.xp} detail="nur für Levelaufstieg" />
        <DashboardCard label="Gems" value={progress.gems} detail="seltene Spezialwährung" />
        <DashboardCard label="Level" value={levelInfo.level} detail="automatisch berechnet" />
        <DashboardCard label="Heute erledigt" value={completedToday} detail="abgeschlossene Quests" />
        <DashboardCard label="Streak" value={`${streakState.currentStreak} Tage`} detail={`Bestwert: ${streakState.longestStreak}`} />
        <DashboardCard label="Fokus heute" value={`${focusSummary.todayMinutes} Min`} detail="Tagesziel zählt live" />
        <DashboardCard label="Fokus Woche" value={`${focusSummary.weekMinutes} Min`} detail="für Wochenziele" />
      </section>

      <section className="level-section">
        <ProgressBar
          value={levelInfo.xpInCurrentLevel}
          max={levelInfo.xpForNextLevel}
          label={`Level ${levelInfo.level} Fortschritt`}
        />
        <div className="unlock-summary">
          <p className="status-line">{toast}</p>
          <p>
            {nextUnlock
              ? `Nächstes Ziel: Level ${nextUnlock.level} - ${nextUnlock.title}.`
              : `Letzter Unlock: ${latestUnlock?.title ?? "Startausrüstung"}.`}
          </p>
        </div>
      </section>

      <section className="dashboard-experience">
        <div className="panel progress-panel">
          <div className="section-heading">
            <span className="eyebrow">Heutiger Fortschritt</span>
            <h2>{completedToday > 0 ? "Du bist im Lauf." : "Der erste Schritt wartet."}</h2>
          </div>
          <p>{completedToday > 0 ? "Konstanz schlägt Perfektion." : "Ein Level weiter beginnt mit einer Quest."}</p>
          <div className="daily-goal-grid">
            {dailyGoals.map((goal) => (
              <DailyGoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
        <UnlockPreviewCard nextUnlock={nextUnlock} levelInfo={levelInfo} />
      </section>

      <section className="dashboard-experience">
        <div className="panel progress-panel">
          <div className="section-heading">
            <span className="eyebrow">Wochenziele</span>
            <h2>Strategischer Fortschritt</h2>
          </div>
          <div className="daily-goal-grid">
            {weeklyGoals.map((goal) => (
              <DailyGoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
        <div className="panel longterm-panel">
          <div className="section-heading">
            <span className="eyebrow">Nächster Schritt</span>
            <h2>Langzeitmotivation</h2>
          </div>
          <p>Nächstes Level: noch {levelInfo.xpForNextLevel - levelInfo.xpInCurrentLevel} XP.</p>
          <p>{nextUnlock ? `Nächster Unlock: ${nextUnlock.title} auf Level ${nextUnlock.level}.` : "Alle aktuellen Unlocks erreicht."}</p>
          <p>{nextDailyGoal ? `Tagesziel: ${nextDailyGoal.title}.` : "Alle Tagesziele erledigt."}</p>
          <p>{nextWeeklyGoal ? `Wochenziel: ${nextWeeklyGoal.title}.` : "Alle Wochenziele erledigt."}</p>
          <p>{streakState.canRescue ? "Streak in Gefahr: Rettung möglich." : "Streak läuft stabil, wenn heute eine Quest zählt."}</p>
        </div>
      </section>

      <section className="dashboard-experience">
        <div className="panel active-quest-panel">
          <div className="section-heading">
            <span className="eyebrow">Aktive Quests</span>
            <h2>{acceptedQuests.length + runningQuests.length} bereit</h2>
          </div>
          <p>
            {acceptedQuests.length + runningQuests.length > 0
              ? "Angenommene Quests haben einen klaren nächsten Schritt."
              : "Nimm eine offene Quest an, wenn du bewusst starten willst."}
          </p>
        </div>
        <div className="panel success-panel">
          <div className="section-heading">
            <span className="eyebrow">Letzte Erfolge</span>
            <h2>{latestCompleted.length > 0 ? "Abgeschlossen" : "Noch leer"}</h2>
          </div>
          {latestCompleted.length > 0 ? (
            <ul className="success-list">
              {latestCompleted.map((quest) => (
                <li key={quest.id}>{quest.title}</li>
              ))}
            </ul>
          ) : (
            <p>Heute zählt jede abgeschlossene Einheit.</p>
          )}
        </div>
      </section>

      <GemActionPanel gems={progress.gems} streakState={streakState} onRescueStreak={handleRescueStreak} />

      <div className="main-grid">
        <section className="panel" id="new-quest">
          <div className="section-heading">
            <span className="eyebrow">Quest-System</span>
            <h2>Neue Quest anlegen</h2>
          </div>
          <form className="quest-form" onSubmit={handleCreateQuest}>
            <label>
              Titel
              <input
                value={questDraft.title}
                onChange={(event) => setQuestDraft({ ...questDraft, title: event.target.value })}
                placeholder="z. B. Matheaufgaben lösen"
              />
            </label>
            <label>
              Fach / Kategorie
              <input
                value={questDraft.category}
                onChange={(event) => setQuestDraft({ ...questDraft, category: event.target.value })}
                placeholder="z. B. Mathe"
              />
            </label>
            <label>
              Dauer in Minuten
              <input
                min="1"
                type="number"
                value={questDraft.durationMinutes}
                onChange={(event) => setQuestDraft({ ...questDraft, durationMinutes: Number(event.target.value) })}
              />
            </label>
            <label>
              Schwierigkeit
              <select
                value={questDraft.difficulty}
                onChange={(event) => setQuestDraft({ ...questDraft, difficulty: event.target.value as Difficulty })}
              >
                <option value="easy">leicht</option>
                <option value="medium">mittel</option>
                <option value="hard">schwer</option>
              </select>
            </label>
            <label className="quest-form__wide">
              Optionale Notiz
              <textarea
                value={questDraft.note}
                onChange={(event) => setQuestDraft({ ...questDraft, note: event.target.value })}
                placeholder="Was genau soll erledigt werden?"
              />
            </label>
            <button className="button button--primary quest-form__wide" type="submit">
              Quest erstellen
            </button>
          </form>
        </section>

        <TimerPanel quest={activeQuest} onComplete={handleCompleteQuest} onCancel={handleCancelFocus} />
      </div>

      <section className="panel">
        <div className="section-heading">
          <span className="eyebrow">Offene Quests</span>
          <h2>Antippen, annehmen, starten</h2>
        </div>
        <div className="quest-list">
          {sortedQuests.length > 0 ? (
            sortedQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onSelect={setSelectedQuest}
                onStart={handleStartQuest}
                onReopen={handleReopenQuest}
                onReroll={handleRerollQuest}
                gems={progress.gems}
              />
            ))
          ) : (
            <p className="empty-state">Noch keine Quests. Erstelle eine Quest und nimm sie bewusst an.</p>
          )}
        </div>
      </section>

      <StatsPanel stats={statsSummary} />
      <SessionHistory sessions={progress.sessionHistory} />

      <ShopSection
        eyebrow="Standard-Shop"
        title="Immer erreichbare Belohnungen"
        variant="standard"
        items={standardItems}
        coins={progress.coins}
        level={levelInfo.level}
        onBuy={handleBuyItem}
      />

      <ShopSection
        eyebrow="Premium-Shop"
        title="Freischaltungen durch Level"
        variant="premium"
        items={premiumItems}
        coins={progress.coins}
        level={levelInfo.level}
        onBuy={handleBuyItem}
      />

      <section className="panel special-actions">
        <div className="section-heading">
          <span className="eyebrow">Gem-Sonderfunktionen</span>
          <h2>Vorbereitet für später</h2>
        </div>
        <div className="special-grid">
          {gemSpecialActions.map((action) => {
            const locked = levelInfo.level < action.unlockLevel;
            return (
              <article className={`special-card ${locked ? "shop-card--locked" : "shop-card--unlocked"}`} key={action.id}>
                <span className={`unlock-label ${locked ? "unlock-label--locked" : "unlock-label--open"}`}>
                  {locked ? `Level ${action.unlockLevel} nötig` : "Vorbereitet"}
                </span>
                <h3>{action.name}</h3>
                <p>{action.description}</p>
                <strong>{action.gemPrice} Gems</strong>
              </article>
            );
          })}
        </div>
      </section>

      {(progress.purchasedRewards.length > 0 ||
        progress.discountTokens > 0 ||
        progress.streakProtectionTokens > 0 ||
        progress.specialVouchers > 0) && (
        <section className="inventory">
          <span className="eyebrow">Inventar</span>
          <p>
            {[...progress.purchasedRewards, `${progress.discountTokens} Rabatt-Token`, `${progress.streakProtectionTokens} Streak-Schutz`, `${progress.specialVouchers} Spezialgutschein`]
              .filter((entry) => !entry.startsWith("0 "))
              .join(" · ")}
          </p>
        </section>
      )}

      <QuestAcceptModal quest={selectedQuest} onAccept={handleAcceptQuest} onDecline={() => setSelectedQuest(null)} />
      <LuckyChestModal reward={chestReward} onClose={() => setChestReward(null)} />
      <CompletionModal
        summary={completionSummary}
        onSaveReflection={handleSaveReflection}
        onClose={() => setCompletionSummary(null)}
      />
    </main>
  );
}

export default App;
