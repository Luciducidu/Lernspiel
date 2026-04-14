import type { Quest, UserProgress } from "../types";
import { createQuestFromTemplate, studyQuestTemplates } from "./questContent";

const initialQuestTemplateIndexes = [0, 2, 4, 10, 13, 16, 20, 22, 26, 28];

export const initialQuests: Quest[] = initialQuestTemplateIndexes.map((templateIndex, index) =>
  createQuestFromTemplate(studyQuestTemplates[templateIndex], index),
);

export const initialProgress: UserProgress = {
  coins: 120,
  xp: 0,
  level: 1,
  gems: 0,
  streak: 0,
  longestStreak: 0,
  completedDaysHistory: [],
  rescuedStreakDates: [],
  completedToday: 0,
  purchasedRewards: [],
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
  subjectPriorities: [
    { id: "pb", label: "PB", priority: "high" },
    { id: "mathe", label: "Mathe", priority: "high" },
    { id: "deutsch", label: "Deutsch", priority: "high" },
    { id: "physik", label: "Physik", priority: "paused" },
  ],
};
