import type { GoalReward } from "../types";

export interface StreakRewardDefinition {
  id: string;
  milestoneDays: number;
  title: string;
  description: string;
  reward: GoalReward & {
    badge?: string;
    luckyChestTier?: "bronze" | "silver" | "gold";
    discountTokens?: number;
  };
}

export const streakRewardDefinitions: StreakRewardDefinition[] = [
  {
    id: "streak-3",
    milestoneDays: 3,
    title: "3-Tage-Serie",
    description: "Der erste kleine Lauf ist geschafft.",
    reward: { coins: 50, xp: 15, badge: "Startserie" },
  },
  {
    id: "streak-7",
    milestoneDays: 7,
    title: "7-Tage-Streak",
    description: "Eine volle Lernwoche gehalten.",
    reward: { coins: 120, xp: 35, gems: 1, badge: "Wochenfokus" },
  },
  {
    id: "streak-14",
    milestoneDays: 14,
    title: "14 Tage Konstanz",
    description: "Zwei Wochen stabile Vorbereitung.",
    reward: { coins: 180, xp: 60, gems: 1, luckyChestTier: "bronze" },
  },
  {
    id: "streak-21",
    milestoneDays: 21,
    title: "21 Tage Rhythmus",
    description: "Lernen ist spürbar zur Routine geworden.",
    reward: { coins: 260, xp: 80, gems: 2, badge: "Routine" },
  },
  {
    id: "streak-30",
    milestoneDays: 30,
    title: "30 Tage Abi-Modus",
    description: "Ein voller Monat mit Lernaktivität.",
    reward: { coins: 380, xp: 120, gems: 2, luckyChestTier: "silver" },
  },
  {
    id: "streak-50",
    milestoneDays: 50,
    title: "50 Tage Disziplin",
    description: "Ein sehr starker Langzeitlauf.",
    reward: { coins: 650, xp: 180, gems: 3, discountTokens: 1 },
  },
  {
    id: "streak-100",
    milestoneDays: 100,
    title: "100 Tage Legende",
    description: "Langfristige Vorbereitung auf Top-Niveau.",
    reward: { coins: 1200, xp: 300, gems: 5, luckyChestTier: "gold", badge: "Abi-Legende" },
  },
];
