import { initialProgress, initialQuests } from "../data/seed";
import type { Quest, QuestStatus, UserProgress } from "../types";
import { getLevelInfo, todayKey } from "./gameRules";

const QUESTS_KEY = "lernquest.quests";
const PROGRESS_KEY = "lernquest.progress";
const META_KEY = "lernquest.meta";
const APP_DATA_VERSION = 2;

interface StorageMeta {
  appDataVersion: number;
  migratedAt?: string;
}

const validQuestStatuses: QuestStatus[] = ["open", "accepted", "in_progress", "completed", "cancelled"];

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

  return {
    ...quest,
    id: quest.id || crypto.randomUUID(),
    title: quest.title?.trim() || "Unbenannte Quest",
    category: quest.category?.trim() || "Allgemein",
    durationMinutes: Math.max(1, Number(quest.durationMinutes) || 25),
    status,
    createdAt: quest.createdAt || new Date().toISOString(),
  };
}

function ensureMeta(): void {
  const meta = readJson<StorageMeta>(META_KEY, { appDataVersion: 1 });
  if (meta.appDataVersion < APP_DATA_VERSION) {
    writeJson<StorageMeta>(META_KEY, { appDataVersion: APP_DATA_VERSION, migratedAt: new Date().toISOString() });
  }
}

export function loadQuests(): Quest[] {
  ensureMeta();
  const stored = readJson<Quest[]>(QUESTS_KEY, initialQuests);
  return (Array.isArray(stored) && stored.length > 0 ? stored : initialQuests).map(normalizeQuest);
}

export function saveQuests(quests: Quest[]): void {
  writeJson(QUESTS_KEY, quests.map(normalizeQuest));
}

export function loadProgress(): UserProgress {
  ensureMeta();
  const stored = readJson<Partial<UserProgress>>(PROGRESS_KEY, initialProgress);
  const xp = clampNumber(stored.xp, initialProgress.xp);
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
    totalCoinsEarned: clampNumber(stored.totalCoinsEarned, 0),
    totalCoinsSpent: clampNumber(stored.totalCoinsSpent, 0),
    totalXpEarned: clampNumber(stored.totalXpEarned, 0),
    totalGemsEarned: clampNumber(stored.totalGemsEarned, 0),
    totalFocusMinutes: clampNumber(stored.totalFocusMinutes, 0),
    startedQuestDaysHistory: Array.isArray(stored.startedQuestDaysHistory) ? stored.startedQuestDaysHistory : [],
    chestOpenDates: Array.isArray(stored.chestOpenDates) ? stored.chestOpenDates : [],
    dailyGoalProgress: stored.dailyGoalProgress ?? {},
    weeklyGoalProgress: stored.weeklyGoalProgress ?? {},
    sessionHistory: Array.isArray(stored.sessionHistory) ? stored.sessionHistory : [],
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
