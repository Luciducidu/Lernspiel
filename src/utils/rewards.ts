import type { ChestReward, RewardCategory, RewardRarity } from "../types";

export const rewardCategoryLabels: Record<RewardCategory, string> = {
  coins: "Coins",
  gems: "Gems",
  activity: "Gutschein",
  streak: "Streak",
  special: "Spezial",
  bonus: "Bonus",
};

export const rewardRarityLabels: Record<RewardRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
};

export function getRewardIcon(reward: Pick<ChestReward, "category" | "coins" | "gems">): string {
  if (reward.category === "coins") return (reward.coins ?? 0) >= 250 ? "🪙" : "¢";
  if (reward.category === "gems") return "◆";
  if (reward.category === "activity") return "▣";
  if (reward.category === "streak") return "♢";
  if (reward.category === "special") return "★";
  return "✦";
}

export function getRewardValueText(reward: ChestReward): string {
  if (reward.coins) return `+${reward.coins} Coins`;
  if (reward.gems) return `+${reward.gems} ${reward.gems === 1 ? "Gem" : "Gems"}`;
  if (reward.activity) return reward.activity;
  if (reward.discountTokens) return `+${reward.discountTokens} Rabatt-Token`;
  if (reward.streakProtectionTokens) return `+${reward.streakProtectionTokens} Streak-Schutz`;
  if (reward.specialVouchers) return `+${reward.specialVouchers} Spezialgutschein`;
  return reward.title;
}
