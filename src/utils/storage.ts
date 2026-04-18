import { initialProgress, initialQuests } from "../data/seed";
import type { Quest, QuestStatus, QuestType, Subject, SubjectId, SubjectPriority, UserProgress } from "../types";
import { normalizeQuestDuration } from "./durations";
import { getLevelInfo, todayKey } from "./gameRules";

const QUESTS_KEY = "lernquest.quests";
const PROGRESS_KEY = "lernquest.progress";
const META_KEY = "lernquest.meta";
const APP_DATA_VERSION = 5;

interface StorageMeta {
  appDataVersion: number;
  migratedAt?: string;
}

const validQuestStatuses: QuestStatus[] = ["open", "accepted", "in_progress", "completed", "cancelled"];
const validQuestTypes: QuestType[] = ["study", "daily_quick"];
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

function normalizeQuest(quest: Quest): Quest {
  const migratedStatus = quest.status === ("active" as QuestStatus) ? "in_progress" : quest.status;
  const status = validQuestStatuses.includes(migratedStatus) ? migratedStatus : "open";
  const type = validQuestTypes.includes(quest.type) ? quest.type : "study";
  const subject = quest.subject && validSubjects.includes(quest.subject) ? quest.subject : inferSubjectFromCategory(quest.category);

  return normalizeQuestDuration({
    ...quest,
    id: quest.id || crypto.randomUUID(),
    type,
    title: quest.title?.trim() || "Unbenannte Quest",
    category: quest.category?.trim() || "Allgemein",
    subject,
    topic: quest.topic?.trim() || undefined,
    durationMinutes: Math.max(1, Number(quest.durationMinutes) || 25),
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
    .filter((quest) => validSubjects.includes(quest.subject as Subject))
    .filter((quest) => !quest.id.startsWith("quest-seed-"))
    .filter((quest) => Boolean(quest.taskType && quest.mode && quest.outputType));
  const existingIds = new Set(normalized.map((quest) => quest.id));
  const missingSeedQuests = initialQuests.filter((quest) => !existingIds.has(quest.id)).map(normalizeQuest);
  return [...missingSeedQuests, ...normalized];
}

export function saveQuests(quests: Quest[]): void {
  writeJson(
    QUESTS_KEY,
    quests
      .map(normalizeQuest)
      .filter((quest) => validSubjects.includes(quest.subject as Subject))
      .filter((quest) => !quest.id.startsWith("quest-seed-"))
      .filter((quest) => Boolean(quest.taskType && quest.mode && quest.outputType)),
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
