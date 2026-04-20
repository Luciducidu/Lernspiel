import { initialProgress, initialQuests } from "../data/seed";
import type {
  AccountState,
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
const APP_DATA_VERSION = 8;

export const appDataVersion = APP_DATA_VERSION;

interface StorageMeta {
  appDataVersion: number;
  migratedAt?: string;
}

const validQuestStatuses: QuestStatus[] = ["open", "accepted", "in_progress", "completed", "cancelled"];
const validQuestTypes: QuestType[] = ["study", "daily_quick", "housework"];
const validSubjects: Subject[] = ["PB", "Deutsch", "Mathe"];

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
