import { FormEvent, useState } from "react";
import { ActiveQuestCard } from "./components/ActiveQuestCard";
import { ActivityCalendar } from "./components/ActivityCalendar";
import { AccountPanel } from "./components/AccountPanel";
import { DashboardCard } from "./components/DashboardCard";
import { DashboardHero } from "./components/DashboardHero";
import { CelebrationToast, type CelebrationToastData } from "./components/CelebrationToast";
import { ChestContentsModal } from "./components/ChestContentsModal";
import { ClaimableRewardsPanel } from "./components/ClaimableRewardsPanel";
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
import { StreakRewardsPanel } from "./components/StreakRewardsPanel";
import { TimerPanel } from "./components/TimerPanel";
import { UnlockPreviewCard } from "./components/UnlockPreviewCard";
import { chestRewards, gemSpecialActions } from "./data/balancing";
import { houseworkTopics, modeOptions, outputTypeOptions, subjectOptions, subjectTopics, taskTypeOptions } from "./data/questContent";
import { useAppDerivedState } from "./hooks/useAppDerivedState";
import { usePersistentState } from "./hooks/usePersistentState";
import type {
  AppPage,
  ChestReward,
  ChestTier,
  CompletionSummary,
  Difficulty,
  MultipleChoiceQuestion,
  Quest,
  QuestStatus,
  QuestType,
  QuestMode,
  QuestOutputType,
  QuestTaskType,
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
  claimGoalReward,
  applyQuestStart,
  applyQuestCompletion,
  calculateQuestReward,
  drawChestReward,
  getLatestUnlock,
  getLevelInfo,
  getWeekKey,
  isUnlocked,
  rescueStreak,
  rerollQuest,
  spendCoins,
  spendGems,
  todayKey,
} from "./utils/gameRules";
import { loadAccount, loadProgress, loadQuests, saveAccount, saveProgress, saveQuests } from "./utils/storage";
import { getSubjectFocusText, inferQuestSubject } from "./utils/subjects";
import {
  customQuestDurationOptions,
  normalizeCustomQuestDuration,
  normalizeQuestDuration,
  recommendedDurationForQuest,
} from "./utils/durations";
import { buildStreakRewards, claimStreakReward, getNextStreakReward } from "./utils/streakRewards";
import { createSyncBundle, fetchRemoteBundle, hashSyncSecret, mergeSyncData, normalizeUsername, saveRemoteBundle } from "./utils/sync";

const emptyForm = {
  type: "study" as QuestType,
  title: "",
  subject: "Deutsch" as Subject,
  topic: "Analyse und Interpretation",
  taskType: "anwendung" as QuestTaskType,
  mode: "solo" as QuestMode,
  outputType: "Stichpunkte" as QuestOutputType,
  durationMinutes: 25,
  difficulty: "easy" as Difficulty,
  note: "",
};

function App() {
  const [quests, setQuests] = usePersistentState<Quest[]>(loadQuests, saveQuests);
  const [progress, setProgress] = usePersistentState(loadProgress, saveProgress);
  const [account, setAccount] = usePersistentState(loadAccount, saveAccount);
  const [activePage, setActivePage] = useState<AppPage>("dashboard");
  const [questTab, setQuestTab] = useState<"daily" | "open" | "accepted" | "completed">("daily");
  const [progressTab, setProgressTab] = useState<
    "overview" | "claims" | "daily" | "weekly" | "streaks" | "calendar" | "stats" | "history" | "unlocks"
  >("overview");
  const [subjectFilter, setSubjectFilter] = useState<"all" | Subject>("all");
  const [questTypeFilter, setQuestTypeFilter] = useState<"all" | QuestType>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | Difficulty>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | QuestStatus>("all");
  const [questDraft, setQuestDraft] = useState(emptyForm);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [chestReward, setChestReward] = useState<ChestReward | null>(null);
  const [previewChestTier, setPreviewChestTier] = useState<ChestTier | null>(null);
  const [completionSummary, setCompletionSummary] = useState<CompletionSummary | null>(null);
  const [celebration, setCelebration] = useState<CelebrationToastData | null>(null);
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
  const dailyQuickCorrectCount = dailyQuickQuestionsForToday.filter(
    (question) => getDailyQuickState(progress, question.id, todaysDateKey)?.status === "correct",
  ).length;
  const topicOptions = questDraft.type === "housework" ? [...houseworkTopics] : subjectTopics[questDraft.subject];
  const draftDurationOptions = customQuestDurationOptions(questDraft.durationMinutes);
  const draftRecommendedDuration = recommendedDurationForQuest(questDraft);
  const streakRewards = buildStreakRewards(progress);
  const nextStreakReward = getNextStreakReward(progress);
  const filteredStudyQuests = sortedQuests.filter((quest) => {
    const questSubject = inferQuestSubject(quest);
    return (
      (questTypeFilter === "all" || quest.type === questTypeFilter) &&
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

  function updateQuestDuration(quest: Quest, durationMinutes: number) {
    updateQuest(quest.id, normalizeQuestDuration({ ...quest, durationMinutes }));
    setToast(`${durationMinutes} Minuten für diese Quest gesetzt.`);
  }

  function updateQuestDraft(update: Partial<typeof questDraft>) {
    const next = { ...questDraft, ...update };
    setQuestDraft({ ...next, durationMinutes: normalizeCustomQuestDuration(next.durationMinutes) });
  }

  function showCelebration(data: Omit<CelebrationToastData, "id">) {
    setCelebration({ ...data, id: crypto.randomUUID() });
  }

  function getClaimedGoalDiff(before: typeof progress, after: typeof progress): string[] {
    const date = todayKey();
    const week = getWeekKey();
    const beforeDaily = new Set(before.dailyGoalProgress[date]?.claimedGoalIds ?? []);
    const afterDaily = after.dailyGoalProgress[date]?.claimedGoalIds ?? [];
    const beforeWeekly = new Set(before.weeklyGoalProgress[week]?.claimedGoalIds ?? []);
    const afterWeekly = after.weeklyGoalProgress[week]?.claimedGoalIds ?? [];

    return [
      ...afterDaily.filter((goalId) => !beforeDaily.has(goalId)).map((goalId) => `Tagesziel: ${goalId}`),
      ...afterWeekly.filter((goalId) => !beforeWeekly.has(goalId)).map((goalId) => `Wochenziel: ${goalId}`),
    ];
  }

  function handleCreateQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = questDraft.title.trim();
    const topic = questDraft.type === "housework" ? questDraft.topic.trim() || "Hausarbeit" : questDraft.topic.trim();

    if (!title || !topic || questDraft.durationMinutes < 1) {
      setToast("Titel, Fach und Dauer werden benötigt.");
      return;
    }

    const newQuest: Quest = {
      ...normalizeQuestDuration(questDraft),
      id: crypto.randomUUID(),
      title,
      type: questDraft.type,
      isCustom: true,
      category: questDraft.type === "housework" ? "Hausarbeit" : questDraft.subject,
      subject: questDraft.type === "housework" ? undefined : questDraft.subject,
      topic,
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

    const startedAt = new Date().toISOString();

    // Der bewusste Annahmeschritt startet offene Quests direkt: keine zweite Start-Huerde nach dem Modal.
    setQuests((current) =>
      current.map((currentQuest) => {
        if (currentQuest.id === quest.id) {
          return {
            ...currentQuest,
            status: "in_progress",
            acceptedAt: startedAt,
            startedAt,
            pausedAt: undefined,
            accumulatedPausedMs: 0,
          };
        }

        return currentQuest.status === "in_progress" ? { ...currentQuest, status: "accepted" } : currentQuest;
      }),
    );
    const nextProgress = applyQuestStart(progress);
    const claimedGoals = getClaimedGoalDiff(progress, nextProgress);
    setProgress(nextProgress);
    if (claimedGoals.length > 0) {
      showCelebration({
        tone: "reward",
        title: "Zielbelohnung erhalten",
        message: "Dein Queststart hat ein Tages- oder Wochenziel abgeschlossen.",
        rewards: claimedGoals,
      });
    }
    setActiveQuestId(quest.id);
    setActivePage("focus");
    setSelectedQuest(null);
    setToast("Quest angenommen. Fokusmodus startet.");
  }

  function handleStartQuest(quest: Quest) {
    if (quest.status !== "accepted") {
      setToast("Nur angenommene Quests können gestartet werden.");
      return;
    }

    setQuests((current) =>
      current.map((currentQuest) => {
        if (currentQuest.id === quest.id) {
          return {
            ...currentQuest,
            status: "in_progress",
            startedAt: new Date().toISOString(),
            pausedAt: undefined,
            accumulatedPausedMs: 0,
          };
        }

        return currentQuest.status === "in_progress" ? { ...currentQuest, status: "accepted" } : currentQuest;
      }),
    );
    const nextProgress = applyQuestStart(progress);
    const claimedGoals = getClaimedGoalDiff(progress, nextProgress);
    setProgress(nextProgress);
    if (claimedGoals.length > 0) {
      showCelebration({
        tone: "reward",
        title: "Zielbelohnung erhalten",
        message: "Dein Start hat ein Tages- oder Wochenziel abgeschlossen.",
        rewards: claimedGoals,
      });
    }
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

  function handlePauseFocus(quest: Quest) {
    if (quest.status !== "in_progress" || quest.pausedAt) {
      return;
    }
    updateQuest(quest.id, { pausedAt: new Date().toISOString() });
    setToast("Session pausiert. Keine Strafe, nur eine saubere Unterbrechung.");
  }

  function handleResumeFocus(quest: Quest) {
    if (quest.status !== "in_progress" || !quest.pausedAt) {
      return;
    }
    const pausedAt = new Date(quest.pausedAt).getTime();
    const pauseMs = Number.isFinite(pausedAt) ? Math.max(0, Date.now() - pausedAt) : 0;
    updateQuest(quest.id, {
      pausedAt: undefined,
      accumulatedPausedMs: (quest.accumulatedPausedMs ?? 0) + pauseMs,
    });
    setToast("Weiterlernen. Der Timer läuft sauber weiter.");
  }

  function handleAddExtraTime(quest: Quest, minutes: number) {
    if (quest.status !== "in_progress") {
      setToast("Extra-Zeit kann nur im laufenden Fokusmodus hinzugefügt werden.");
      return;
    }

    const safeMinutes = Math.max(5, Math.min(20, Math.round(minutes / 5) * 5));
    updateQuest(quest.id, {
      durationMinutes: quest.durationMinutes + safeMinutes,
      extraTimeMinutes: (quest.extraTimeMinutes ?? 0) + safeMinutes,
    });
    setToast(`+${safeMinutes} Minuten Extra-Zeit hinzugefügt.`);
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
    const nextProgress = applyQuestCompletion(progress, quest, reward, focusMinutes);
    const claimedGoals = getClaimedGoalDiff(progress, nextProgress);
    setProgress(nextProgress);
    setActiveQuestId(null);
    setCompletionSummary({
      questId: quest.id,
      questTitle: quest.title,
      reward,
      previousLevel: oldLevel,
      newLevel,
      unlocked,
    });
    if (claimedGoals.length > 0 && newLevel === oldLevel) {
      showCelebration({
        tone: "reward",
        title: "Zielbelohnung freigeschaltet",
        message: "Neben der Quest wurde auch ein Ziel abgeschlossen.",
        rewards: claimedGoals,
      });
    }
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

  function handleClaimStreakReward(rewardId: string) {
    const result = claimStreakReward(progress, rewardId);
    if (!result.ok || !result.reward) {
      setToast(result.message);
      return;
    }

    setProgress(result.progress);
    showCelebration({
      tone: result.reward.milestoneDays >= 30 ? "level" : "reward",
      title: result.reward.title,
      message: "Streak-Belohnung abgeholt.",
      rewards: [
        result.reward.reward.coins ? `+${result.reward.reward.coins} Coins` : "",
        result.reward.reward.xp ? `+${result.reward.reward.xp} XP` : "",
        result.reward.reward.gems ? `+${result.reward.reward.gems} Gems` : "",
        result.reward.reward.badge ? `Badge: ${result.reward.reward.badge}` : "",
      ].filter(Boolean),
    });
    setToast(result.message);
  }

  function handleClaimGoal(scope: "daily" | "weekly", goalId: string) {
    const result = claimGoalReward(progress, scope, goalId);
    if (!result.ok || !result.goal) {
      setToast(result.message);
      return;
    }

    setProgress(result.progress);
    showCelebration({
      tone: "reward",
      title: result.goal.title,
      message: scope === "daily" ? "Tagesquest-Belohnung abgeholt." : "Wochenquest-Belohnung abgeholt.",
      rewards: [
        result.goal.reward?.coins ? `+${result.goal.reward.coins} Coins` : "",
        result.goal.reward?.xp ? `+${result.goal.reward.xp} XP` : "",
        result.goal.reward?.gems ? `+${result.goal.reward.gems} Gems` : "",
      ].filter(Boolean),
    });
    setToast(result.message);
  }

  function handleAnswerDailyQuick(question: MultipleChoiceQuestion, optionId: string) {
    const oldLevel = getLevelInfo(progress.xp).level;
    const result = answerDailyQuickQuest(progress, question, optionId, dailyQuickQuestionIds, todaysDateKey);
    setProgress(result.progress);
    const newLevel = getLevelInfo(result.progress.xp).level;
    if (newLevel > oldLevel) {
      showCelebration({
        tone: "level",
        title: `Level ${newLevel} erreicht`,
        message: "Eine kurze Daily Quick Quest hat dich ein Level weitergebracht.",
        rewards: [`+${newLevel - oldLevel} Level`],
      });
    } else if (result.correct) {
      showCelebration({
        tone: "success",
        title: "Daily Quick richtig",
        message: question.explanation,
        rewards: ["Fortschritt für 5 richtige Daily-Fragen"],
      });
    }
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
      showCelebration({
        tone: reward.tier === "gold" ? "level" : "reward",
        title: `${item.name} geöffnet`,
        message: reward.description,
        rewards: [
          reward.coins ? `+${reward.coins} Coins` : "",
          reward.gems ? `+${reward.gems} ${reward.gems === 1 ? "Gem" : "Gems"}` : "",
          reward.activity ?? "",
        ].filter(Boolean),
      });
    }

    setToast(reward ? `${item.name} geöffnet: ${reward.title}.` : `${item.name} gekauft.`);
  }

  function handlePreviewChest(item: ShopItem) {
    if (!item.isLuckyChest || !item.chestTier) {
      return;
    }

    setPreviewChestTier(item.chestTier);
  }

  function handleChangeSubjectPriority(id: SubjectPrioritySetting["id"], priority: SubjectPriority) {
    setProgress((current) => ({
      ...current,
      subjectPriorities: current.subjectPriorities.map((subject) => (subject.id === id ? { ...subject, priority } : subject)),
    }));
    setToast("Fach-Priorisierung gespeichert.");
  }

  async function handleLogin(usernameInput: string, syncKey: string) {
    const username = normalizeUsername(usernameInput);
    if (!username || syncKey.trim().length < 6) {
      setAccount((current) => ({
        ...current,
        syncStatus: "error",
        syncMessage: "Benutzername und ein Sync-Schlüssel mit mindestens 6 Zeichen werden benötigt.",
      }));
      return;
    }

    setAccount((current) => ({ ...current, syncStatus: "syncing", syncMessage: "Konto wird geprüft..." }));

    try {
      const passphraseHash = await hashSyncSecret(username, syncKey);
      const remote = await fetchRemoteBundle(username);
      const baseAccount = { mode: "account" as const, username, passphraseHash, syncStatus: "syncing" as const };

      if (remote && remote.passphraseHash !== passphraseHash) {
        setAccount((current) => ({
          ...current,
          syncStatus: "error",
          syncMessage: "Sync-Schlüssel passt nicht zu diesem Benutzernamen.",
        }));
        return;
      }

      const merged = remote ? mergeSyncData({ quests, progress }, remote) : { quests, progress };
      setQuests(merged.quests);
      setProgress(merged.progress);
      await saveRemoteBundle(createSyncBundle(baseAccount, merged.quests, merged.progress));
      setAccount({
        mode: "account",
        username,
        passphraseHash,
        lastSyncedAt: new Date().toISOString(),
        syncStatus: "success",
        syncMessage: remote ? "Lokale Daten wurden mit Kontodaten zusammengeführt." : "Konto erstellt und lokale Daten hochgeladen.",
      });
      setToast("Konto verbunden. Fortschritt ist synchronisiert.");
    } catch (error) {
      setAccount((current) => ({
        ...current,
        mode: "local",
        syncStatus: "error",
        syncMessage: error instanceof Error ? error.message : "Synchronisation fehlgeschlagen.",
      }));
    }
  }

  async function handleManualSync() {
    if (account.mode !== "account" || !account.username || !account.passphraseHash) {
      setToast("Du bist aktuell im lokalen Modus.");
      return;
    }

    setAccount((current) => ({ ...current, syncStatus: "syncing", syncMessage: "Synchronisation läuft..." }));

    try {
      const remote = await fetchRemoteBundle(account.username);
      if (remote && remote.passphraseHash !== account.passphraseHash) {
        throw new Error("Sync-Schlüssel passt nicht mehr zum Konto.");
      }
      const merged = remote ? mergeSyncData({ quests, progress }, remote) : { quests, progress };
      setQuests(merged.quests);
      setProgress(merged.progress);
      await saveRemoteBundle(createSyncBundle(account, merged.quests, merged.progress));
      setAccount((current) => ({
        ...current,
        lastSyncedAt: new Date().toISOString(),
        syncStatus: "success",
        syncMessage: "Daten wurden synchronisiert.",
      }));
      setToast("Daten synchronisiert.");
    } catch (error) {
      setAccount((current) => ({
        ...current,
        syncStatus: "error",
        syncMessage: error instanceof Error ? error.message : "Synchronisation fehlgeschlagen.",
      }));
    }
  }

  function handleLogout() {
    setAccount({
      mode: "local",
      syncStatus: "idle",
      syncMessage: "Abgemeldet. Lokale Daten bleiben auf diesem Gerät erhalten.",
    });
    setToast("Abgemeldet. Du nutzt die App lokal weiter.");
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
      onDurationChange={updateQuestDuration}
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
                  {dailyQuickCorrectCount}/{dailyQuickQuestionsForToday.length} richtig
                </span>
              </div>
              <p className="daily-quick-reward-note">
                Beantworte alle 5 Daily-Fragen richtig und hole dir 30 Coins im Belohnungs-Tab ab. Noch offen:{" "}
                {Math.max(0, dailyQuickQuestionsForToday.length - dailyQuickAnsweredCount)}.
              </p>
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
                  Questtyp
                  <select
                    value={questDraft.type}
                    onChange={(event) => {
                      const type = event.target.value as QuestType;
                      updateQuestDraft({
                        type,
                        topic: type === "housework" ? houseworkTopics[0] : subjectTopics[questDraft.subject][0],
                        taskType: type === "housework" ? "anwendung" : questDraft.taskType,
                        mode: type === "housework" ? "solo" : questDraft.mode,
                        outputType: type === "housework" ? "Stichpunkte" : questDraft.outputType,
                      });
                    }}
                  >
                    <option value="study">Lernquest</option>
                    <option value="housework">Hausarbeit</option>
                  </select>
                </label>
                {questDraft.type === "study" ? (
                <label>
                  Fach
                  <select
                    value={questDraft.subject}
                    onChange={(event) => {
                      const subject = event.target.value as Subject;
                      updateQuestDraft({ subject, topic: subjectTopics[subject][0] });
                    }}
                  >
                    {subjectOptions.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </label>
                ) : null}
                <label>
                  {questDraft.type === "housework" ? "Bereich" : "Thema / Unterbereich"}
                  <select
                    value={questDraft.topic}
                    onChange={(event) => updateQuestDraft({ topic: event.target.value })}
                  >
                    {topicOptions.map((topic) => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </label>
                {questDraft.type === "study" ? (
                <label>
                  Aufgabentyp
                  <select
                    value={questDraft.taskType}
                    onChange={(event) => updateQuestDraft({ taskType: event.target.value as QuestTaskType })}
                  >
                    {taskTypeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                ) : null}
                {questDraft.type === "study" ? (
                <label>
                  Modus
                  <select
                    value={questDraft.mode}
                    onChange={(event) => updateQuestDraft({ mode: event.target.value as QuestMode })}
                  >
                    {modeOptions.map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </label>
                ) : null}
                {questDraft.type === "study" ? (
                <label>
                  Output
                  <select
                    value={questDraft.outputType}
                    onChange={(event) => updateQuestDraft({ outputType: event.target.value as QuestOutputType })}
                  >
                    {outputTypeOptions.map((output) => (
                      <option key={output} value={output}>{output}</option>
                    ))}
                  </select>
                </label>
                ) : null}
                <label>
                  Schwierigkeit
                  <select
                    value={questDraft.difficulty}
                    onChange={(event) => updateQuestDraft({ difficulty: event.target.value as Difficulty })}
                  >
                    <option value="easy">leicht</option>
                    <option value="medium">mittel</option>
                    <option value="hard">schwer</option>
                  </select>
                </label>
                <div className="quest-form__wide">
                  <span className="form-label">Dauer wählen</span>
                  <div className="custom-duration-control">
                    <input
                      aria-label="Dauer der eigenen Quest"
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={questDraft.durationMinutes}
                      onChange={(event) => setQuestDraft({ ...questDraft, durationMinutes: Number(event.target.value) })}
                    />
                    <strong>{questDraft.durationMinutes} Min</strong>
                  </div>
                  <div className="duration-chip-row duration-chip-row--form">
                    {draftDurationOptions.map((option) => (
                      <button
                        className={`duration-chip ${option.minutes === questDraft.durationMinutes ? "duration-chip--selected" : ""} ${
                          option.minutes === draftRecommendedDuration ? "duration-chip--recommended" : ""
                        }`}
                        key={option.minutes}
                        type="button"
                        onClick={() => setQuestDraft({ ...questDraft, durationMinutes: option.minutes })}
                      >
                        {option.label} {option.minutes === draftRecommendedDuration ? "empfohlen" : ""}
                      </button>
                    ))}
                  </div>
                  <small className="duration-helper">
                    Eigene Quests sind flexibel in 5-Minuten-Schritten von 10 bis 120 Minuten. Die Empfehlung bleibt als Orientierung sichtbar.
                  </small>
                </div>
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
                <h2>Lernquests, Hausarbeit und Daily Quick Quests</h2>
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
                      if ((nextType === "study" || nextType === "housework") && questTab === "daily") setQuestTab("open");
                    }}
                  >
                    <option value="all">Alle Typen</option>
                    <option value="study">Lernquests</option>
                    <option value="daily_quick">Daily Quick Quests</option>
                    <option value="housework">Hausarbeit</option>
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
            <TimerPanel
              quest={activeQuest}
              onComplete={handleCompleteQuest}
              onCancel={handleCancelFocus}
              onPause={handlePauseFocus}
              onResume={handleResumeFocus}
              onAddExtraTime={handleAddExtraTime}
              soundEnabled={progress.soundEnabled}
            />
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
              onPreviewChest={handlePreviewChest}
            />
            <ShopSection
              eyebrow="Lucky Chests"
              title="Truhen und Zufallsbelohnungen"
              variant="chests"
              items={chestItems}
              coins={progress.coins}
              level={levelInfo.level}
              onBuy={handleBuyItem}
              onPreviewChest={handlePreviewChest}
            />
            <ShopSection
              eyebrow="Premium-Shop"
              title="Freischaltungen durch Level"
              variant="premium"
              items={premiumRewardItems}
              coins={progress.coins}
              level={levelInfo.level}
              onBuy={handleBuyItem}
              onPreviewChest={handlePreviewChest}
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
              <button className={progressTab === "claims" ? "tab tab--active" : "tab"} type="button" onClick={() => setProgressTab("claims")}>Belohnungen</button>
              <button className={progressTab === "daily" ? "tab tab--active" : "tab"} type="button" onClick={() => setProgressTab("daily")}>Tagesquests</button>
              <button className={progressTab === "weekly" ? "tab tab--active" : "tab"} type="button" onClick={() => setProgressTab("weekly")}>Wochenquests</button>
              <button className={progressTab === "streaks" ? "tab tab--active" : "tab"} type="button" onClick={() => setProgressTab("streaks")}>Streaks</button>
              <button className={progressTab === "calendar" ? "tab tab--active" : "tab"} type="button" onClick={() => setProgressTab("calendar")}>Kalender</button>
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
                {nextStreakReward ? (
                  <section className="content-card">
                    <div className="section-heading">
                      <span className="eyebrow">Nächste Streak-Belohnung</span>
                      <h2>{nextStreakReward.title}</h2>
                    </div>
                    <p>{nextStreakReward.description}</p>
                    <ProgressBar
                      value={Math.min(streakState.longestStreak, nextStreakReward.milestoneDays)}
                      max={nextStreakReward.milestoneDays}
                      label="Streak-Fortschritt"
                    />
                  </section>
                ) : null}
              </>
            ) : null}

            {progressTab === "daily" ? (
              <section className="content-card goal-overview-card">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Tagesquests</span>
                    <h2>Heute bis Mitternacht</h2>
                  </div>
                  <span className="reset-hint">Reset: täglich 00:00</span>
                </div>
                <div className="daily-goal-grid">{dailyGoals.map((goal) => <DailyGoalCard key={goal.id} goal={goal} onClaim={(goalId) => handleClaimGoal("daily", goalId)} />)}</div>
              </section>
            ) : null}

            {progressTab === "weekly" ? (
              <section className="content-card goal-overview-card goal-overview-card--weekly">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Wochenquests</span>
                    <h2>Diese Lernwoche</h2>
                  </div>
                  <span className="reset-hint">Reset: Montag 00:00</span>
                </div>
                <div className="daily-goal-grid weekly-goal-grid">{weeklyGoals.map((goal) => <DailyGoalCard key={goal.id} goal={goal} onClaim={(goalId) => handleClaimGoal("weekly", goalId)} />)}</div>
              </section>
            ) : null}

            {progressTab === "claims" ? (
              <ClaimableRewardsPanel
                dailyGoals={dailyGoals}
                weeklyGoals={weeklyGoals}
                streakRewards={streakRewards}
                currentStreak={streakState.currentStreak}
                longestStreak={streakState.longestStreak}
                onClaimDaily={(goalId) => handleClaimGoal("daily", goalId)}
                onClaimWeekly={(goalId) => handleClaimGoal("weekly", goalId)}
                onClaimStreak={handleClaimStreakReward}
              />
            ) : null}

            {progressTab === "streaks" ? (
              <StreakRewardsPanel
                currentStreak={streakState.currentStreak}
                longestStreak={streakState.longestStreak}
                rewards={streakRewards}
                onClaim={handleClaimStreakReward}
              />
            ) : null}

            {progressTab === "calendar" ? <ActivityCalendar progress={progress} /> : null}

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
          <div className="page-stack">
            <div className="two-column-page">
              <AccountPanel account={account} onLogin={handleLogin} onLogout={handleLogout} onSync={handleManualSync} />
              <SubjectPriorityCard subjects={progress.subjectPriorities} />
            </div>
            <SettingsPanel
              subjects={progress.subjectPriorities}
              soundEnabled={progress.soundEnabled}
              onChangePriority={handleChangeSubjectPriority}
              onToggleSound={(enabled) => {
                setProgress((current) => ({ ...current, soundEnabled: enabled }));
                setToast(enabled ? "Timer-Sound aktiviert." : "Timer-Sound deaktiviert.");
              }}
            />
          </div>
        ) : null}
      </main>

      <CelebrationToast celebration={celebration} onClose={() => setCelebration(null)} />
      <QuestAcceptModal quest={selectedQuest} onAccept={handleAcceptQuest} onDecline={() => setSelectedQuest(null)} />
      <ChestContentsModal
        tier={previewChestTier}
        rewards={previewChestTier ? chestRewards[previewChestTier] : []}
        onClose={() => setPreviewChestTier(null)}
      />
      <LuckyChestModal reward={chestReward} rewardPool={chestReward ? chestRewards[chestReward.tier] : []} onClose={() => setChestReward(null)} />
      <CompletionModal
        summary={completionSummary}
        onSaveReflection={handleSaveReflection}
        onClose={() => setCompletionSummary(null)}
      />
    </div>
  );
}

export default App;
