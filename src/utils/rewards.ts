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
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
};

export function getRewardIcon(reward: Pick<ChestReward, "category" | "coins" | "gems" | "iconKey">): string {
  if (reward.iconKey === "coins-large") return "C+";
  if (reward.iconKey === "coins") return "C";
  if (reward.iconKey === "gems") return "G";
  if (reward.iconKey === "ticket") return "T";
  if (reward.iconKey === "shield") return "S";
  if (reward.iconKey === "star") return "*";
  if (reward.category === "coins") return (reward.coins ?? 0) >= 250 ? "C+" : "C";
  if (reward.category === "gems") return "G";
  if (reward.category === "activity") return "T";
  if (reward.category === "streak") return "S";
  if (reward.category === "special") return "*";
  return "+";
}

export function getRewardValueText(reward: ChestReward): string {
  if (reward.coins) return `+${reward.coins} Coins`;
  if (reward.gems) return `+${reward.gems} ${reward.gems === 1 ? "Gem" : "Gems"}`;
  if (reward.activity) return reward.activity;
  if (reward.discountTokens) return `+${reward.discountTokens} Rabatt-Token`;
  if (reward.streakProtectionTokens) return `+${reward.streakProtectionTokens} Streak-Schutz`;
  if (reward.specialVouchers) return `+${reward.specialVouchers} Spezialgutschein`;
  return reward.displayValue || reward.title;
}
