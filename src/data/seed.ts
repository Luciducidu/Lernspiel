import type { Quest, UserProgress } from "../types";
import { allQuestTemplates, createQuestFromTemplate } from "./questContent";

export const initialQuests: Quest[] = allQuestTemplates.map(createQuestFromTemplate);

export const initialProgress: UserProgress = {
  coins: 120,
  xp: 0,
  level: 1,
  gems: 0,
  streak: 0,
  longestStreak: 0,
  completedDaysHistory: [],
  rescuedStreakDates: [],
  streakRewardClaims: [],
  completedToday: 0,
  purchasedRewards: [],
  rewardInventory: [],
  discountTokens: 0,
  streakProtectionTokens: 0,
  specialVouchers: 0,
  totalCoinsEarned: 0,
  totalCoinsSpent: 0,
  totalXpEarned: 0,
  totalGemsEarned: 0,
  totalFocusMinutes: 0,
  startedQuestDaysHistory: [],
  chestOpenDates: [],
  dailyGoalProgress: {},
  weeklyGoalProgress: {},
  dailyQuickQuestStates: {},
  dailyQuickBonusDates: [],
  sessionHistory: [],
  soundEnabled: true,
  subjectPriorities: [
    { id: "pb", label: "PB", priority: "high" },
    { id: "mathe", label: "Mathe", priority: "high" },
    { id: "deutsch", label: "Deutsch", priority: "high" },
    { id: "physik", label: "Physik", priority: "paused" },
  ],
};
