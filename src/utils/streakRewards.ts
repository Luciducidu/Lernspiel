import { streakRewardDefinitions } from "../data/streakRewards";
import type { StreakReward, StreakRewardClaim, UserProgress } from "../types";
import { getLevelInfo } from "./gameRules";

function longestRunFromHistory(days: string[]): number {
  const sorted = [...new Set(days)].sort();
  let longest = 0;
  let current = 0;
  let previous: string | null = null;

  for (const day of sorted) {
    if (!previous) {
      current = 1;
    } else {
      const prevDate = new Date(`${previous}T12:00:00`);
      prevDate.setDate(prevDate.getDate() + 1);
      current = prevDate.toISOString().slice(0, 10) === day ? current + 1 : 1;
    }
    previous = day;
    longest = Math.max(longest, current);
  }

  return longest;
}

export function getEffectiveLongestStreak(progress: UserProgress): number {
  return Math.max(progress.longestStreak, progress.streak, longestRunFromHistory(progress.completedDaysHistory));
}

export function buildStreakRewards(progress: UserProgress): StreakReward[] {
  const effectiveLongest = getEffectiveLongestStreak(progress);
  const claimedIds = new Set(progress.streakRewardClaims.map((claim) => claim.rewardId));

  return streakRewardDefinitions.map((definition) => ({
    ...definition,
    status: claimedIds.has(definition.id)
      ? "claimed"
      : effectiveLongest >= definition.milestoneDays
        ? "available"
        : "locked",
  }));
}

export function getNextStreakReward(progress: UserProgress): StreakReward | undefined {
  return buildStreakRewards(progress).find((reward) => reward.status !== "claimed");
}

export function claimStreakReward(
  progress: UserProgress,
  rewardId: string,
): { progress: UserProgress; ok: boolean; message: string; reward?: StreakReward } {
  const rewards = buildStreakRewards(progress);
  const reward = rewards.find((item) => item.id === rewardId);

  if (!reward) {
    return { progress, ok: false, message: "Diese Streak-Belohnung existiert nicht." };
  }

  if (reward.status === "locked") {
    return { progress, ok: false, message: `Diese Belohnung wird nach ${reward.milestoneDays} Streak-Tagen freigeschaltet.` };
  }

  if (reward.status === "claimed") {
    return { progress, ok: false, message: "Diese Streak-Belohnung wurde bereits abgeholt." };
  }

  const xp = progress.xp + (reward.reward.xp ?? 0);
  const claim: StreakRewardClaim = {
    rewardId: reward.id,
    milestoneDays: reward.milestoneDays,
    claimedAt: new Date().toISOString(),
  };

  return {
    ok: true,
    reward,
    message: `${reward.title} abgeholt.`,
    progress: {
      ...progress,
      coins: progress.coins + (reward.reward.coins ?? 0),
      xp,
      level: getLevelInfo(xp).level,
      gems: progress.gems + (reward.reward.gems ?? 0),
      discountTokens: progress.discountTokens + (reward.reward.discountTokens ?? 0),
      totalCoinsEarned: progress.totalCoinsEarned + (reward.reward.coins ?? 0),
      totalXpEarned: progress.totalXpEarned + (reward.reward.xp ?? 0),
      totalGemsEarned: progress.totalGemsEarned + (reward.reward.gems ?? 0),
      streakRewardClaims: [...progress.streakRewardClaims, claim],
    },
  };
}
