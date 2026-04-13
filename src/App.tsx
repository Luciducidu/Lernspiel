import { FormEvent, useState } from "react";
import { ActiveQuestCard } from "./components/ActiveQuestCard";
import { DashboardCard } from "./components/DashboardCard";
import { DashboardHero } from "./components/DashboardHero";
import { CompletionModal } from "./components/CompletionModal";
import { DailyQuickQuestCard } from "./components/DailyQuickQuestCard";
import { DailyGoalCard } from "./components/DailyGoalCard";
import { GemActionPanel } from "./components/GemActionPanel";
import { LevelProgressCard } from "./components/LevelProgressCard";
import { LuckyChestModal } from "./components/LuckyChestModal";
import { ProgressBar } from "./components/ProgressBar";
import { QuestAcceptModal } from "./components/QuestAcceptModal";
import { QuestCard } from "./components/QuestCard";
import { SettingsPanel } from "./components/SettingsPanel";
import { SessionHistory } from "./components/SessionHistory";
import { ShopSection } from "./components/ShopSection";
import { SidebarNavigation } from "./components/SidebarNavigation";
import { StatsPanel } from "./components/StatsPanel";
import { SubjectPriorityCard } from "./components/SubjectPriorityCard";
import { TimerPanel } from "./components/TimerPanel";
import { UnlockPreviewCard } from "./components/UnlockPreviewCard";
import { gemSpecialActions } from "./data/balancing";
import { subjectOptions, subjectTopics } from "./data/questContent";
import { useAppDerivedState } from "./hooks/useAppDerivedState";
import { usePersistentState } from "./hooks/usePersistentState";
import type {
  AppPage,
  ChestReward,
  CompletionSummary,
  Difficulty,
  MultipleChoiceQuestion,
  Quest,
  QuestStatus,
  QuestType,
  ReflectionData,
  ShopItem,
  Subject,
  SubjectPriority,
  SubjectPrioritySetting,
} from "./types";
import { answerDailyQuickQuest, getDailyQuickQuestionsForDate, getDailyQuickState } from "./utils/dailyQuick";
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
  todayKey,
} from "./utils/gameRules";
import { loadProgress, loadQuests, saveProgress, saveQuests } from "./utils/storage";
import { getSubjectFocusText, inferQuestSubject } from "./utils/subjects";

const emptyForm = {
  title: "",
  subject: "Deutsch" as Subject,
  topic: "Analyse",
  durationMinutes: 25,
  difficulty: "easy" as Difficulty,
  note: "",
};

function App() {
  const [quests, setQuests] = usePersistentState<Quest[]>(loadQuests, saveQuests);
  const [progress, setProgress] = usePersistentState(loadProgress, saveProgress);
  const [activePage, setActivePage] = useState<AppPage>("dashboard");
  const [questTab, setQuestTab] = useState<"daily" | "open" | "accepted" | "completed">("daily");
  const [progressTab, setProgressTab] = useState<"overview" | "goals" | "stats" | "history" | "unlocks">("overview");
  const [subjectFilter, setSubjectFilter] = useState<"all" | Subject>("all");
  const [questTypeFilter, setQuestTypeFilter] = useState<"all" | QuestType>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | Difficulty>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | QuestStatus>("all");
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
  const subjectFocus = getSubjectFocusText(progress.subjectPriorities);
  const todaysDateKey = todayKey();
  const dailyQuickQuestionsForToday = getDailyQuickQuestionsForDate(progress.subjectPriorities, todaysDateKey);
  const dailyQuickQuestionIds = dailyQuickQuestionsForToday.map((question) => question.id);
  const filteredDailyQuickQuestions = dailyQuickQuestionsForToday.filter(
    (question) => subjectFilter === "all" || question.subject === subjectFilter,
  );
  const dailyQuickAnsweredCount = dailyQuickQuestionsForToday.filter((question) =>
    Boolean(getDailyQuickState(progress, question.id, todaysDateKey)?.answeredAt),
  ).length;
  const topicOptions = subjectTopics[questDraft.subject];
  const filteredStudyQuests = sortedQuests.filter((quest) => {
    const questSubject = inferQuestSubject(quest);
    return (
      (subjectFilter === "all" || questSubject === subjectFilter) &&
      (difficultyFilter === "all" || quest.difficulty === difficultyFilter) &&
      (statusFilter === "all" || quest.status === statusFilter)
    );
  });
  const openQuestList = filteredStudyQuests.filter((quest) => quest.status === "open" || quest.status === "cancelled");
  const acceptedQuestList = filteredStudyQuests.filter((quest) => quest.status === "accepted" || quest.status === "in_progress");
  const completedQuestList = filteredStudyQuests.filter((quest) => quest.status === "completed");
  const chestItems = [...standardItems, ...premiumItems].filter((item) => item.isLuckyChest);
  const standardRewardItems = standardItems.filter((item) => !item.isLuckyChest);
  const premiumRewardItems = premiumItems.filter((item) => !item.isLuckyChest);

  function updateQuest(questId: string, update: Partial<Quest>) {
    setQuests((current) => current.map((quest) => (quest.id === questId ? { ...quest, ...update } : quest)));
  }

  function handleCreateQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = questDraft.title.trim();
    const topic = questDraft.topic.trim();

    if (!title || !topic || questDraft.durationMinutes < 1) {
      setToast("Titel, Fach und Dauer werden benötigt.");
      return;
    }

    const newQuest: Quest = {
      id: crypto.randomUUID(),
      title,
      type: "study",
      category: questDraft.subject,
      subject: questDraft.subject,
      topic,
      durationMinutes: questDraft.durationMinutes,
      difficulty: questDraft.difficulty,
      note: questDraft.note.trim() || undefined,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    setQuests((current) => [newQuest, ...current]);
    setQuestDraft(emptyForm);
    setToast("Neue Quest erstellt. Tippe sie an, um sie bewusst anzunehmen.");
    setQuestTab("open");
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
    setActivePage("focus");
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

    const nextQuest = rerollQuest(quest, progress.subjectPriorities);
    setQuests((current) => current.map((item) => (item.id === quest.id ? nextQuest : item)));
    setProgress((current) => spendGems(current, 1));
    setToast("Quest neu gewürfelt. Prüfe sie und nimm sie bewusst an.");
  }

  function handleAnswerDailyQuick(question: MultipleChoiceQuestion, optionId: string) {
    const result = answerDailyQuickQuest(progress, question, optionId, dailyQuickQuestionIds, todaysDateKey);
    setProgress(result.progress);
    setToast(result.message);
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

  function handleChangeSubjectPriority(id: SubjectPrioritySetting["id"], priority: SubjectPriority) {
    setProgress((current) => ({
      ...current,
      subjectPriorities: current.subjectPriorities.map((subject) => (subject.id === id ? { ...subject, priority } : subject)),
    }));
    setToast("Fach-Priorisierung gespeichert.");
  }

  function renderQuestList(list: Quest[]) {
    if (list.length === 0) {
      return <p className="empty-state">In diesem Bereich gibt es gerade keine Quests.</p>;
    }

    return list.map((quest) => (
      <QuestCard
        key={quest.id}
        quest={quest}
        onSelect={setSelectedQuest}
        onStart={handleStartQuest}
        onReopen={handleReopenQuest}
        onReroll={handleRerollQuest}
        gems={progress.gems}
      />
    ));
  }

  function renderDailyQuickList(list: MultipleChoiceQuestion[], compact = false) {
    if (list.length === 0) {
      return <p className="empty-state">Keine Daily Quick Quest passt zu diesem Filter.</p>;
    }

    return list.map((question) => (
      <DailyQuickQuestCard
        key={question.id}
        question={question}
        state={getDailyQuickState(progress, question.id, todaysDateKey)}
        compact={compact}
        onAnswer={handleAnswerDailyQuick}
      />
    ));
  }

  const pageTitle: Record<AppPage, string> = {
    dashboard: "Dashboard",
    quests: "Quests",
    focus: "Fokusmodus",
    shop: "Shop",
    progress: "Fortschritt",
    settings: "Einstellungen",
  };

  return (
    <div className="app-frame">
      <SidebarNavigation activePage={activePage} onNavigate={setActivePage} />
      <main className="page-shell">
        <header className="topbar">
          <div>
            <span className="eyebrow">LernQuest</span>
            <h1>{pageTitle[activePage]}</h1>
          </div>
          <div className="topbar-currencies" aria-label="Währungen">
            <span>{progress.coins} Coins</span>
            <span>{progress.xp} XP</span>
            <span>{progress.gems} Gems</span>
          </div>
        </header>

        <p className="status-line">{toast}</p>

        {activePage === "dashboard" ? (
          <div className="page-stack">
            <DashboardHero
              focusText={subjectFocus.focus}
              levelInfo={levelInfo}
              nextUnlock={nextUnlock}
              onNavigate={setActivePage}
            />
            <section className="dashboard-priority-grid">
              <ActiveQuestCard activeQuest={activeQuest} acceptedCount={acceptedQuests.length} onNavigate={setActivePage} />
              <SubjectPriorityCard subjects={progress.subjectPriorities} />
              <article className="compact-card">
                <span className="eyebrow">Tagesziel</span>
                {nextDailyGoal ? <DailyGoalCard goal={nextDailyGoal} /> : <p>Alle Tagesziele erledigt.</p>}
              </article>
            </section>
            <section className="content-card daily-quick-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Daily Quick Quests</span>
                  <h2>Kurze Abi-Wiederholung</h2>
                </div>
                <span className="daily-quick-counter">
                  {dailyQuickAnsweredCount}/{dailyQuickQuestionsForToday.length} heute
                </span>
              </div>
              <div className="daily-quick-grid daily-quick-grid--compact">
                {renderDailyQuickList(dailyQuickQuestionsForToday.slice(0, 3), true)}
              </div>
              <button className="button button--ghost" type="button" onClick={() => { setActivePage("quests"); setQuestTab("daily"); }}>
                Alle Daily Quick Quests
              </button>
            </section>
            <section className="dashboard-summary-grid">
              <DashboardCard label="Streak" value={`${streakState.currentStreak} Tage`} detail={`Bestwert: ${streakState.longestStreak}`} />
              <DashboardCard label="Fokus heute" value={`${focusSummary.todayMinutes} Min`} detail="für Tagesziele" />
              <DashboardCard label="Heute erledigt" value={completedToday} detail="abgeschlossene Quests" />
            </section>
            <section className="quick-actions">
              <button className="quick-action-card" type="button" onClick={() => setActivePage("quests")}>
                <strong>Neue Quest</strong>
                <span>Planen und bewusst annehmen</span>
              </button>
              <button className="quick-action-card" type="button" onClick={() => setActivePage("focus")}>
                <strong>Fokusmodus</strong>
                <span>Ruhige Session öffnen</span>
              </button>
              <button className="quick-action-card" type="button" onClick={() => setActivePage("shop")}>
                <strong>Shop</strong>
                <span>Belohnungen ansehen</span>
              </button>
            </section>
          </div>
        ) : null}

        {activePage === "quests" ? (
          <div className="page-stack">
            <section className="content-card" id="new-quest">
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
                  Fach
                  <select
                    value={questDraft.subject}
                    onChange={(event) => {
                      const subject = event.target.value as Subject;
                      setQuestDraft({ ...questDraft, subject, topic: subjectTopics[subject][0] });
                    }}
                  >
                    {subjectOptions.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Thema / Unterbereich
                  <select
                    value={questDraft.topic}
                    onChange={(event) => setQuestDraft({ ...questDraft, topic: event.target.value })}
                  >
                    {topicOptions.map((topic) => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
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

            {activeQuest ? (
              <section className="content-card">
                <div className="section-heading">
                  <span className="eyebrow">Aktive Quest</span>
                  <h2>Läuft gerade</h2>
                </div>
                <div className="quest-list">{renderQuestList([activeQuest])}</div>
              </section>
            ) : null}

            <section className="content-card">
              <div className="section-heading">
                <span className="eyebrow">Quest-Liste</span>
                <h2>Abi-Quests und Daily Quick Quests</h2>
              </div>
              <div className="quest-filter-bar" aria-label="Quest-Filter">
                <label>
                  Fach
                  <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value as "all" | Subject)}>
                    <option value="all">Alle Faecher</option>
                    {subjectOptions.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Questtyp
                  <select
                    value={questTypeFilter}
                    onChange={(event) => {
                      const nextType = event.target.value as "all" | QuestType;
                      setQuestTypeFilter(nextType);
                      if (nextType === "daily_quick") setQuestTab("daily");
                      if (nextType === "study" && questTab === "daily") setQuestTab("open");
                    }}
                  >
                    <option value="all">Alle Typen</option>
                    <option value="study">Lernquests</option>
                    <option value="daily_quick">Daily Quick Quests</option>
                  </select>
                </label>
                <label>
                  Schwierigkeit
                  <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value as "all" | Difficulty)}>
                    <option value="all">Alle</option>
                    <option value="easy">leicht</option>
                    <option value="medium">mittel</option>
                    <option value="hard">schwer</option>
                  </select>
                </label>
                <label>
                  Status
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | QuestStatus)}>
                    <option value="all">Alle</option>
                    <option value="open">offen</option>
                    <option value="accepted">angenommen</option>
                    <option value="in_progress">laeuft</option>
                    <option value="completed">abgeschlossen</option>
                    <option value="cancelled">abgebrochen</option>
                  </select>
                </label>
              </div>
              <div className="tabs" role="tablist" aria-label="Quest-Filter">
                <button className={questTab === "daily" ? "tab tab--active" : "tab"} type="button" onClick={() => setQuestTab("daily")}>Daily</button>
                <button className={questTab === "open" ? "tab tab--active" : "tab"} type="button" onClick={() => setQuestTab("open")}>Offen</button>
                <button className={questTab === "accepted" ? "tab tab--active" : "tab"} type="button" onClick={() => setQuestTab("accepted")}>Angenommen</button>
                <button className={questTab === "completed" ? "tab tab--active" : "tab"} type="button" onClick={() => setQuestTab("completed")}>Abgeschlossen</button>
              </div>
              {questTab === "daily" || questTypeFilter === "daily_quick" ? (
                <div className="daily-quick-grid">{renderDailyQuickList(filteredDailyQuickQuestions)}</div>
              ) : null}
              {questTypeFilter !== "daily_quick" && questTab !== "daily" ? (
                <div className="quest-list">
                  {questTab === "open" ? renderQuestList(openQuestList) : null}
                  {questTab === "accepted" ? renderQuestList(acceptedQuestList) : null}
                  {questTab === "completed" ? renderQuestList(completedQuestList) : null}
                </div>
              ) : null}
            </section>
          </div>
        ) : null}

        {activePage === "focus" ? (
          <div className="focus-page">
            <TimerPanel quest={activeQuest} onComplete={handleCompleteQuest} onCancel={handleCancelFocus} />
          </div>
        ) : null}

        {activePage === "shop" ? (
          <div className="page-stack">
            <ShopSection
              eyebrow="Standard-Shop"
              title="Immer verfügbare Belohnungen"
              variant="standard"
              items={standardRewardItems}
              coins={progress.coins}
              level={levelInfo.level}
              onBuy={handleBuyItem}
            />
            <ShopSection
              eyebrow="Lucky Chests"
              title="Truhen und Zufallsbelohnungen"
              variant="chests"
              items={chestItems}
              coins={progress.coins}
              level={levelInfo.level}
              onBuy={handleBuyItem}
            />
            <ShopSection
              eyebrow="Premium-Shop"
              title="Freischaltungen durch Level"
              variant="premium"
              items={premiumRewardItems}
              coins={progress.coins}
              level={levelInfo.level}
              onBuy={handleBuyItem}
            />
            <GemActionPanel gems={progress.gems} streakState={streakState} onRescueStreak={handleRescueStreak} />
            <section className="content-card">
              <div className="section-heading">
                <span className="eyebrow">Spezialaktionen</span>
                <h2>Gem-Funktionen</h2>
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
          </div>
        ) : null}

        {activePage === "progress" ? (
          <div className="page-stack">
            <div className="tabs" role="tablist" aria-label="Fortschrittsbereiche">
              <button className={progressTab === "overview" ? "tab tab--active" : "tab"} type="button" onClick={() => setProgressTab("overview")}>Übersicht</button>
              <button className={progressTab === "goals" ? "tab tab--active" : "tab"} type="button" onClick={() => setProgressTab("goals")}>Ziele</button>
              <button className={progressTab === "stats" ? "tab tab--active" : "tab"} type="button" onClick={() => setProgressTab("stats")}>Statistik</button>
              <button className={progressTab === "history" ? "tab tab--active" : "tab"} type="button" onClick={() => setProgressTab("history")}>Historie</button>
              <button className={progressTab === "unlocks" ? "tab tab--active" : "tab"} type="button" onClick={() => setProgressTab("unlocks")}>Unlocks</button>
            </div>

            {progressTab === "overview" ? (
              <>
                <section className="dashboard-summary-grid">
                  <LevelProgressCard levelInfo={levelInfo} />
                  <DashboardCard label="Streak" value={`${streakState.currentStreak} Tage`} detail={`Bestwert: ${streakState.longestStreak}`} />
                  <DashboardCard label="Fokus Woche" value={`${focusSummary.weekMinutes} Min`} detail={`${focusSummary.totalMinutes} Min gesamt`} />
                </section>
                <UnlockPreviewCard nextUnlock={nextUnlock} levelInfo={levelInfo} />
              </>
            ) : null}

            {progressTab === "goals" ? (
              <section className="two-column-page">
                <div className="content-card">
                  <div className="section-heading">
                    <span className="eyebrow">Tagesziele</span>
                    <h2>Heute</h2>
                  </div>
                  <div className="daily-goal-grid">{dailyGoals.map((goal) => <DailyGoalCard key={goal.id} goal={goal} />)}</div>
                </div>
                <div className="content-card">
                  <div className="section-heading">
                    <span className="eyebrow">Wochenziele</span>
                    <h2>Diese Woche</h2>
                  </div>
                  <div className="daily-goal-grid">{weeklyGoals.map((goal) => <DailyGoalCard key={goal.id} goal={goal} />)}</div>
                </div>
              </section>
            ) : null}

            {progressTab === "stats" ? <StatsPanel stats={statsSummary} /> : null}
            {progressTab === "history" ? <SessionHistory sessions={progress.sessionHistory} /> : null}
            {progressTab === "unlocks" ? (
              <section className="two-column-page">
                <UnlockPreviewCard nextUnlock={nextUnlock} levelInfo={levelInfo} />
                <div className="content-card">
                  <div className="section-heading">
                    <span className="eyebrow">Letzte Erfolge</span>
                    <h2>Sessions</h2>
                  </div>
                  {latestCompleted.length > 0 ? (
                    <ul className="success-list">{latestCompleted.map((quest) => <li key={quest.id}>{quest.title}</li>)}</ul>
                  ) : (
                    <p className="empty-state">Noch keine abgeschlossene Quest.</p>
                  )}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {activePage === "settings" ? (
          <div className="two-column-page">
            <SettingsPanel subjects={progress.subjectPriorities} onChangePriority={handleChangeSubjectPriority} />
            <SubjectPriorityCard subjects={progress.subjectPriorities} />
          </div>
        ) : null}
      </main>

      <QuestAcceptModal quest={selectedQuest} onAccept={handleAcceptQuest} onDecline={() => setSelectedQuest(null)} />
      <LuckyChestModal reward={chestReward} onClose={() => setChestReward(null)} />
      <CompletionModal
        summary={completionSummary}
        onSaveReflection={handleSaveReflection}
        onClose={() => setCompletionSummary(null)}
      />
    </div>
  );
}

export default App;
