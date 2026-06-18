import { initialProgress, initialQuests } from "../data/seed";
import type {
  AccountState,
  AppMode,
  AppState,
  BrainworkoutAreaId,
  Quest,
  QuestStatus,
  QuestType,
  RewardInventoryItem,
  Subject,
  SubjectId,
  SubjectPriority,
  UserProgress,
} from "../types";
import { normalizeQuestDuration } from "./durations";
import { getLevelInfo, todayKey } from "./gameRules";

const QUESTS_KEY = "lernquest.quests";
const PROGRESS_KEY = "lernquest.progress";
const META_KEY = "lernquest.meta";
const ACCOUNT_KEY = "lernquest.account";
const APP_STATE_KEY = "lernquest.appState";
const APP_DATA_VERSION = 9;

export const appDataVersion = APP_DATA_VERSION;

interface StorageMeta {
  appDataVersion: number;
  migratedAt?: string;
}

const validQuestStatuses: QuestStatus[] = ["open", "accepted", "in_progress", "completed", "cancelled"];
const validQuestTypes: QuestType[] = ["study", "daily_quick", "housework"];
const validSubjects: Subject[] = ["PB", "Deutsch", "Mathe"];
const brainworkoutAreas: BrainworkoutAreaId[] = [
  "math_first_semester",
  "physics_first_semester",
  "language_poetry_slam",
  "logic_puzzles",
  "chess_external",
  "driving_license",
  "housework_life",
];

function readJson<T>(key: string, fallback: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) {
    return fallback;
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    // Defekte lokale Daten sollen die App nicht blockieren.
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not persist ${key}`, error);
  }
}

function clampNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function normalizeRewardInventory(items: unknown): RewardInventoryItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item): item is Partial<RewardInventoryItem> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: item.id || crypto.randomUUID(),
      shopItemId: item.shopItemId || "legacy-reward",
      name: item.name?.trim() || "Belohnung",
      description: item.description?.trim() || "Gekaufte Belohnung aus dem Shop.",
      durationLabel: item.durationLabel,
      price: clampNumber(item.price, 0),
      currency: item.currency === "gems" ? "gems" : "coins",
      purchasedAt: item.purchasedAt || new Date().toISOString(),
      status: item.status === "active" || item.status === "used" ? item.status : "available",
    }));
}

function normalizeQuest(quest: Quest): Quest {
  const migratedStatus = quest.status === ("active" as QuestStatus) ? "in_progress" : quest.status;
  const status = validQuestStatuses.includes(migratedStatus) ? migratedStatus : "open";
  const type = validQuestTypes.includes(quest.type) ? quest.type : "study";
  const subject =
    type === "housework"
      ? undefined
      : quest.subject && validSubjects.includes(quest.subject)
        ? quest.subject
        : inferSubjectFromCategory(quest.category);

  return normalizeQuestDuration({
    ...quest,
    id: quest.id || crypto.randomUUID(),
    type,
    title: quest.title?.trim() || "Unbenannte Quest",
    category: type === "housework" ? "Hausarbeit" : quest.category?.trim() || "Allgemein",
    subject,
    topic: quest.topic?.trim() || undefined,
    durationMinutes: Math.max(1, Number(quest.durationMinutes) || 25),
    extraTimeMinutes: clampNumber(quest.extraTimeMinutes, 0),
    accumulatedPausedMs: clampNumber(quest.accumulatedPausedMs, 0),
    status,
    createdAt: quest.createdAt || new Date().toISOString(),
  });
}

function inferSubjectFromCategory(category = ""): Subject | undefined {
  const normalized = category.toLowerCase();
  if (normalized.includes("pb") || normalized.includes("politik")) return "PB";
  if (normalized.includes("deutsch")) return "Deutsch";
  if (normalized.includes("mathe")) return "Mathe";
  return undefined;
}

function isSupportedStoredQuest(quest: Quest): boolean {
  if (quest.type === "housework") {
    return quest.category === "Hausarbeit" && Boolean(quest.taskType && quest.mode && quest.outputType);
  }

  return validSubjects.includes(quest.subject as Subject) && Boolean(quest.taskType && quest.mode && quest.outputType);
}

function ensureMeta(): void {
  const meta = readJson<StorageMeta>(META_KEY, { appDataVersion: 1 });
  if (meta.appDataVersion < APP_DATA_VERSION) {
    writeJson<StorageMeta>(META_KEY, { appDataVersion: APP_DATA_VERSION, migratedAt: new Date().toISOString() });
  }
}

function normalizeSubjectPriority(id: SubjectId, storedPriority: SubjectPriority | undefined): SubjectPriority {
  if (id === "deutsch" && (!storedPriority || storedPriority === "medium")) {
    return "high";
  }

  if (id === "physik" && (!storedPriority || storedPriority === "low")) {
    return "paused";
  }

  return storedPriority ?? initialProgress.subjectPriorities.find((subject) => subject.id === id)?.priority ?? "medium";
}

function modeLevelFromXp(xp: number): number {
  return getLevelInfo(xp).level;
}

function makeGlobalState(progress: UserProgress): AppState["global"] {
  return {
    coins: progress.coins,
    gems: progress.gems,
    purchasedRewards: progress.purchasedRewards,
    rewardInventory: progress.rewardInventory,
    streak: progress.streak,
    longestStreak: progress.longestStreak,
    soundEnabled: progress.soundEnabled,
  };
}

function makeAbiState(progress: UserProgress, quests: Quest[]): AppState["abi"] {
  const abiQuestIds = quests.filter((quest) => quest.type !== "housework").map((quest) => quest.id);
  const abiSessionIds = progress.sessionHistory
    .filter((session) => session.questType !== "housework")
    .map((session) => session.id);

  return {
    xp: clampNumber(progress.xp, 0),
    level: modeLevelFromXp(progress.xp),
    questIds: abiQuestIds,
    sessionHistoryIds: abiSessionIds,
    dailyStateKeys: Object.keys(progress.dailyGoalProgress),
    weeklyStateKeys: Object.keys(progress.weeklyGoalProgress),
    subjects: ["PB", "Deutsch", "Mathe"],
    topicProgress: {},
  };
}

function makeBrainworkoutState(progress: UserProgress, quests: Quest[]): AppState["brainworkout"] {
  const brainQuestIds = quests.filter((quest) => quest.type === "housework").map((quest) => quest.id);
  const brainSessionIds = progress.sessionHistory
    .filter((session) => session.questType === "housework")
    .map((session) => session.id);

  return {
    xp: 0,
    level: 1,
    questIds: brainQuestIds,
    sessionHistoryIds: brainSessionIds,
    dailyStateKeys: [],
    weeklyStateKeys: [],
    areas: brainworkoutAreas,
    areaProgress: {
      math_first_semester: 0,
      physics_first_semester: 0,
      language_poetry_slam: 0,
      logic_puzzles: 0,
      chess_external: 0,
      driving_license: 0,
      housework_life: brainSessionIds.length,
    },
    weeklyReflectionIds: [],
  };
}

function defaultAppState(): AppState {
  const progress = loadProgress();
  const quests = loadQuests();
  return {
    appDataVersion: APP_DATA_VERSION,
    activeMode: "abi",
    global: makeGlobalState(progress),
    abi: makeAbiState(progress, quests),
    brainworkout: makeBrainworkoutState(progress, quests),
  };
}

function normalizeMode(value: unknown): AppMode {
  return value === "brainworkout" ? "brainworkout" : "abi";
}

function normalizeAppState(stored: Partial<AppState>): AppState {
  const migrated = defaultAppState();
  const activeMode = normalizeMode(stored.activeMode);
  const abiXp = clampNumber(stored.abi?.xp, migrated.abi.xp);
  const brainXp = clampNumber(stored.brainworkout?.xp, migrated.brainworkout.xp);

  return {
    appDataVersion: APP_DATA_VERSION,
    activeMode,
    global: {
      ...migrated.global,
      ...stored.global,
      coins: clampNumber(stored.global?.coins, migrated.global.coins),
      gems: clampNumber(stored.global?.gems, migrated.global.gems),
      purchasedRewards: Array.isArray(stored.global?.purchasedRewards) ? stored.global.purchasedRewards : migrated.global.purchasedRewards,
      rewardInventory: normalizeRewardInventory(stored.global?.rewardInventory ?? migrated.global.rewardInventory),
      streak: clampNumber(stored.global?.streak, migrated.global.streak),
      longestStreak: clampNumber(stored.global?.longestStreak, migrated.global.longestStreak),
      soundEnabled: typeof stored.global?.soundEnabled === "boolean" ? stored.global.soundEnabled : migrated.global.soundEnabled,
    },
    abi: {
      ...migrated.abi,
      ...stored.abi,
      xp: abiXp,
      level: modeLevelFromXp(abiXp),
      questIds: Array.isArray(stored.abi?.questIds) ? stored.abi.questIds : migrated.abi.questIds,
      sessionHistoryIds: Array.isArray(stored.abi?.sessionHistoryIds) ? stored.abi.sessionHistoryIds : migrated.abi.sessionHistoryIds,
      dailyStateKeys: Array.isArray(stored.abi?.dailyStateKeys) ? stored.abi.dailyStateKeys : migrated.abi.dailyStateKeys,
      weeklyStateKeys: Array.isArray(stored.abi?.weeklyStateKeys) ? stored.abi.weeklyStateKeys : migrated.abi.weeklyStateKeys,
      subjects: ["PB", "Deutsch", "Mathe"],
      topicProgress: stored.abi?.topicProgress ?? migrated.abi.topicProgress,
    },
    brainworkout: {
      ...migrated.brainworkout,
      ...stored.brainworkout,
      xp: brainXp,
      level: modeLevelFromXp(brainXp),
      questIds: Array.isArray(stored.brainworkout?.questIds) ? stored.brainworkout.questIds : migrated.brainworkout.questIds,
      sessionHistoryIds: Array.isArray(stored.brainworkout?.sessionHistoryIds)
        ? stored.brainworkout.sessionHistoryIds
        : migrated.brainworkout.sessionHistoryIds,
      dailyStateKeys: Array.isArray(stored.brainworkout?.dailyStateKeys)
        ? stored.brainworkout.dailyStateKeys
        : migrated.brainworkout.dailyStateKeys,
      weeklyStateKeys: Array.isArray(stored.brainworkout?.weeklyStateKeys)
        ? stored.brainworkout.weeklyStateKeys
        : migrated.brainworkout.weeklyStateKeys,
      areas: brainworkoutAreas,
      areaProgress: { ...migrated.brainworkout.areaProgress, ...stored.brainworkout?.areaProgress },
      weeklyReflectionIds: Array.isArray(stored.brainworkout?.weeklyReflectionIds)
        ? stored.brainworkout.weeklyReflectionIds
        : migrated.brainworkout.weeklyReflectionIds,
    },
  };
}

export function loadQuests(): Quest[] {
  ensureMeta();
  const stored = readJson<Quest[]>(QUESTS_KEY, initialQuests);
  const normalized = (Array.isArray(stored) && stored.length > 0 ? stored : initialQuests)
    .map(normalizeQuest)
    .filter(isSupportedStoredQuest)
    .filter((quest) => !quest.id.startsWith("quest-seed-"))
    .filter((quest) => !quest.id.startsWith("abi-quest-seed-"))
    .filter((quest) => !quest.id.startsWith("housework-quest-seed-"));
  const existingIds = new Set(normalized.map((quest) => quest.id));
  const missingSeedQuests = initialQuests.filter((quest) => !existingIds.has(quest.id)).map(normalizeQuest);
  return [...missingSeedQuests, ...normalized];
}

export function saveQuests(quests: Quest[]): void {
  writeJson(
    QUESTS_KEY,
    quests
      .map(normalizeQuest)
      .filter(isSupportedStoredQuest)
      .filter((quest) => !quest.id.startsWith("quest-seed-"))
      .filter((quest) => !quest.id.startsWith("abi-quest-seed-"))
      .filter((quest) => !quest.id.startsWith("housework-quest-seed-")),
  );
}

export function loadProgress(): UserProgress {
  ensureMeta();
  const stored = readJson<Partial<UserProgress>>(PROGRESS_KEY, initialProgress);
  const hasEarnedProgress = Boolean(
    (stored.totalXpEarned ?? 0) > 0 ||
      (stored.sessionHistory?.length ?? 0) > 0 ||
      Object.keys(stored.dailyQuickQuestStates ?? {}).length > 0,
  );
  const migratedSeedXp = !hasEarnedProgress && stored.xp === 80 ? 0 : stored.xp;
  const xp = clampNumber(migratedSeedXp, initialProgress.xp);
  const coins = clampNumber(stored.coins, initialProgress.coins);
  const gems = clampNumber(stored.gems, initialProgress.gems);
  const streak = clampNumber(stored.streak, 0);

  return {
    ...initialProgress,
    ...stored,
    coins,
    xp,
    gems,
    level: getLevelInfo(xp).level,
    streak,
    completedToday: stored.lastCompletedDate === todayKey() ? clampNumber(stored.completedToday, 0) : 0,
    purchasedRewards: Array.isArray(stored.purchasedRewards) ? stored.purchasedRewards : [],
    rewardInventory: normalizeRewardInventory(stored.rewardInventory),
    discountTokens: clampNumber(stored.discountTokens, 0),
    streakProtectionTokens: clampNumber(stored.streakProtectionTokens, 0),
    specialVouchers: clampNumber(stored.specialVouchers, 0),
    longestStreak: Math.max(clampNumber(stored.longestStreak, streak), streak),
    completedDaysHistory: Array.isArray(stored.completedDaysHistory)
      ? [...new Set(stored.completedDaysHistory)]
      : stored.lastCompletedDate
        ? [stored.lastCompletedDate]
        : [],
    rescuedStreakDates: Array.isArray(stored.rescuedStreakDates) ? stored.rescuedStreakDates : [],
    streakRewardClaims: Array.isArray(stored.streakRewardClaims) ? stored.streakRewardClaims : [],
    totalCoinsEarned: clampNumber(stored.totalCoinsEarned, 0),
    totalCoinsSpent: clampNumber(stored.totalCoinsSpent, 0),
    totalXpEarned: clampNumber(stored.totalXpEarned, 0),
    totalGemsEarned: clampNumber(stored.totalGemsEarned, 0),
    totalFocusMinutes: clampNumber(stored.totalFocusMinutes, 0),
    startedQuestDaysHistory: Array.isArray(stored.startedQuestDaysHistory) ? stored.startedQuestDaysHistory : [],
    chestOpenDates: Array.isArray(stored.chestOpenDates) ? stored.chestOpenDates : [],
    dailyGoalProgress: stored.dailyGoalProgress ?? {},
    weeklyGoalProgress: stored.weeklyGoalProgress ?? {},
    dailyQuickQuestStates: stored.dailyQuickQuestStates ?? {},
    dailyQuickBonusDates: Array.isArray(stored.dailyQuickBonusDates) ? stored.dailyQuickBonusDates : [],
    sessionHistory: Array.isArray(stored.sessionHistory) ? stored.sessionHistory : [],
    soundEnabled: typeof stored.soundEnabled === "boolean" ? stored.soundEnabled : initialProgress.soundEnabled,
    subjectPriorities: Array.isArray(stored.subjectPriorities)
      ? initialProgress.subjectPriorities.map((subject) => ({
          ...subject,
          priority: normalizeSubjectPriority(
            subject.id,
            stored.subjectPriorities?.find((item) => item.id === subject.id)?.priority,
          ),
        }))
      : initialProgress.subjectPriorities,
  };
}

export function saveProgress(progress: UserProgress): void {
  writeJson(PROGRESS_KEY, {
    ...progress,
    coins: clampNumber(progress.coins, 0),
    gems: clampNumber(progress.gems, 0),
    xp: clampNumber(progress.xp, 0),
    level: getLevelInfo(progress.xp).level,
  });
}

export function loadAppState(): AppState {
  ensureMeta();
  const stored = readJson<Partial<AppState>>(APP_STATE_KEY, {});
  return normalizeAppState(stored);
}

export function saveAppState(appState: AppState): void {
  writeJson(APP_STATE_KEY, normalizeAppState(appState));
}

export function loadAccount(): AccountState {
  const stored = readJson<Partial<AccountState>>(ACCOUNT_KEY, {});
  return {
    mode: stored.mode === "account" ? "account" : "local",
    username: typeof stored.username === "string" ? stored.username : undefined,
    passphraseHash: typeof stored.passphraseHash === "string" ? stored.passphraseHash : undefined,
    lastSyncedAt: typeof stored.lastSyncedAt === "string" ? stored.lastSyncedAt : undefined,
    syncStatus: stored.syncStatus ?? "idle",
    syncMessage: typeof stored.syncMessage === "string" ? stored.syncMessage : undefined,
  };
}

export function saveAccount(account: AccountState): void {
  writeJson(ACCOUNT_KEY, account);
}
