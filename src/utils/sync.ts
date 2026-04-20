import type { AccountState, Quest, SyncBundle, UserProgress } from "../types";
import { appDataVersion } from "./storage";

const syncApiUrl = import.meta.env.VITE_SYNC_API_URL as string | undefined;

export function isSyncBackendConfigured(): boolean {
  return Boolean(syncApiUrl?.trim());
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32);
}

export async function hashSyncSecret(username: string, secret: string): Promise<string> {
  const value = `${normalizeUsername(username)}:${secret.trim()}`;
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function endpointFor(username: string): string {
  const base = syncApiUrl?.replace(/\/$/, "");
  return `${base}/users/${encodeURIComponent(normalizeUsername(username))}`;
}

export function createSyncBundle(account: AccountState, quests: Quest[], progress: UserProgress): SyncBundle {
  if (!account.username || !account.passphraseHash) {
    throw new Error("Account nicht vollständig.");
  }

  return {
    appDataVersion,
    username: normalizeUsername(account.username),
    passphraseHash: account.passphraseHash,
    updatedAt: new Date().toISOString(),
    quests,
    progress,
  };
}

export function mergeSyncData(local: { quests: Quest[]; progress: UserProgress }, remote: SyncBundle): { quests: Quest[]; progress: UserProgress } {
  const questMap = new Map<string, Quest>();
  for (const quest of remote.quests) questMap.set(quest.id, quest);
  for (const quest of local.quests) {
    const existing = questMap.get(quest.id);
    const existingTime = existing ? Date.parse(existing.completedAt ?? existing.startedAt ?? existing.createdAt) : 0;
    const localTime = Date.parse(quest.completedAt ?? quest.startedAt ?? quest.createdAt);
    if (!existing || localTime >= existingTime) {
      questMap.set(quest.id, quest);
    }
  }

  return {
    quests: [...questMap.values()],
    progress: {
      ...remote.progress,
      ...local.progress,
      coins: Math.max(local.progress.coins, remote.progress.coins),
      xp: Math.max(local.progress.xp, remote.progress.xp),
      gems: Math.max(local.progress.gems, remote.progress.gems),
      streak: Math.max(local.progress.streak, remote.progress.streak),
      longestStreak: Math.max(local.progress.longestStreak, remote.progress.longestStreak),
      completedDaysHistory: [...new Set([...remote.progress.completedDaysHistory, ...local.progress.completedDaysHistory])].sort(),
      rescuedStreakDates: [...new Set([...remote.progress.rescuedStreakDates, ...local.progress.rescuedStreakDates])].sort(),
      startedQuestDaysHistory: [...new Set([...remote.progress.startedQuestDaysHistory, ...local.progress.startedQuestDaysHistory])].sort(),
      chestOpenDates: [...remote.progress.chestOpenDates, ...local.progress.chestOpenDates],
      purchasedRewards: [...new Set([...remote.progress.purchasedRewards, ...local.progress.purchasedRewards])],
      streakRewardClaims: [
        ...remote.progress.streakRewardClaims,
        ...local.progress.streakRewardClaims.filter(
          (claim) => !remote.progress.streakRewardClaims.some((remoteClaim) => remoteClaim.rewardId === claim.rewardId),
        ),
      ],
      sessionHistory: [
        ...new Map([...remote.progress.sessionHistory, ...local.progress.sessionHistory].map((session) => [session.id, session])).values(),
      ].sort((a, b) => b.date.localeCompare(a.date)),
      totalCoinsEarned: Math.max(local.progress.totalCoinsEarned, remote.progress.totalCoinsEarned),
      totalCoinsSpent: Math.max(local.progress.totalCoinsSpent, remote.progress.totalCoinsSpent),
      totalXpEarned: Math.max(local.progress.totalXpEarned, remote.progress.totalXpEarned),
      totalGemsEarned: Math.max(local.progress.totalGemsEarned, remote.progress.totalGemsEarned),
      totalFocusMinutes: Math.max(local.progress.totalFocusMinutes, remote.progress.totalFocusMinutes),
      dailyGoalProgress: { ...remote.progress.dailyGoalProgress, ...local.progress.dailyGoalProgress },
      weeklyGoalProgress: { ...remote.progress.weeklyGoalProgress, ...local.progress.weeklyGoalProgress },
      dailyQuickQuestStates: { ...remote.progress.dailyQuickQuestStates, ...local.progress.dailyQuickQuestStates },
      dailyQuickBonusDates: [...new Set([...remote.progress.dailyQuickBonusDates, ...local.progress.dailyQuickBonusDates])],
      subjectPriorities: local.progress.subjectPriorities,
      soundEnabled: local.progress.soundEnabled,
    },
  };
}

export async function fetchRemoteBundle(username: string): Promise<SyncBundle | null> {
  if (!isSyncBackendConfigured()) {
    throw new Error("Kein Sync-Backend konfiguriert.");
  }

  const response = await fetch(endpointFor(username), { method: "GET" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Kontodaten konnten nicht geladen werden.");
  return (await response.json()) as SyncBundle;
}

export async function saveRemoteBundle(bundle: SyncBundle): Promise<void> {
  if (!isSyncBackendConfigured()) {
    throw new Error("Kein Sync-Backend konfiguriert.");
  }

  const response = await fetch(endpointFor(bundle.username), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bundle),
  });
  if (!response.ok) throw new Error("Kontodaten konnten nicht gespeichert werden.");
}
