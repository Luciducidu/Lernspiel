export type Difficulty = "easy" | "medium" | "hard";

export type QuestStatus = "open" | "accepted" | "in_progress" | "completed" | "cancelled";

export type ShopSection = "standard" | "premium";

export type ChestTier = "bronze" | "silver" | "gold";

export type RewardCurrency = "coins" | "gems";

export type AppPage = "dashboard" | "quests" | "focus" | "shop" | "progress" | "settings";

export type SubjectId = "pb" | "mathe" | "deutsch" | "physik";

export type SubjectPriority = "high" | "medium" | "low" | "paused";

export interface SubjectPrioritySetting {
  id: SubjectId;
  label: string;
  priority: SubjectPriority;
}

export interface Quest {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  difficulty: Difficulty;
  note?: string;
  status: QuestStatus;
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  reflection?: ReflectionData;
}

export interface UserProgress {
  coins: number;
  xp: number;
  level: number;
  gems: number;
  streak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  completedDaysHistory: string[];
  rescuedStreakDates: string[];
  completedToday: number;
  purchasedRewards: string[];
  discountTokens: number;
  streakProtectionTokens: number;
  specialVouchers: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalXpEarned: number;
  totalGemsEarned: number;
  totalFocusMinutes: number;
  startedQuestDaysHistory: string[];
  chestOpenDates: string[];
  dailyGoalProgress: Record<string, DailyGoalProgress>;
  weeklyGoalProgress: Record<string, WeeklyGoalProgress>;
  sessionHistory: SessionHistoryEntry[];
  subjectPriorities: SubjectPrioritySetting[];
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  currency: RewardCurrency;
  durationLabel?: string;
  description: string;
  section: ShopSection;
  unlockLevel: number;
  isLuckyChest?: boolean;
  chestTier?: ChestTier;
}

export interface RewardResult {
  coins: number;
  xp: number;
  bonusCoins: number;
  reflectionBonusPrepared: boolean;
  message: string;
}

export type ReflectionMood = "good" | "okay" | "hard";

export interface ReflectionData {
  mood: ReflectionMood;
  note?: string;
  createdAt: string;
}

export interface UnlockInfo {
  level: number;
  title: string;
  description: string;
  itemIds: string[];
}

export interface CompletionSummary {
  questId: string;
  questTitle: string;
  reward: RewardResult;
  previousLevel: number;
  newLevel: number;
  unlocked?: UnlockInfo;
}

export interface DailyGoal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  reward?: GoalReward;
  claimed?: boolean;
}

export interface GoalReward {
  coins?: number;
  xp?: number;
  gems?: number;
}

export interface DailyGoalProgress {
  dateKey: string;
  claimedGoalIds: string[];
}

export interface WeeklyGoalProgress {
  weekKey: string;
  claimedGoalIds: string[];
}

export interface SessionHistoryEntry {
  id: string;
  questId: string;
  date: string;
  dateKey: string;
  weekKey: string;
  questTitle: string;
  category: string;
  difficulty: Difficulty;
  durationMinutes: number;
  earnedCoins: number;
  earnedXp: number;
  reflection?: ReflectionData;
  status: "completed";
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  completedDaysHistory: string[];
  canRescue: boolean;
  rescueDate?: string;
}

export type GemActionType = "streak_rescue" | "quest_reroll" | "special_purchase";

export interface GemAction {
  id: string;
  type: GemActionType;
  name: string;
  gemCost: number;
  description: string;
  unlockLevel: number;
}

export interface FocusSummary {
  totalMinutes: number;
  todayMinutes: number;
  weekMinutes: number;
}

export interface StatsSummary {
  totalCompletedQuests: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalXpEarned: number;
  currentStreak: number;
  longestStreak: number;
  totalFocusMinutes: number;
  focusTodayMinutes: number;
  focusWeekMinutes: number;
  chestsOpened: number;
  totalGemsEarned: number;
  topCategory: string;
  difficultyDistribution: Record<Difficulty, number>;
  completedByDay: Array<{ dateKey: string; count: number }>;
}

export type ChestRewardType =
  | "coins"
  | "gems"
  | "free_activity"
  | "discount_token"
  | "streak_protection"
  | "special_voucher";

export interface ChestReward {
  type: ChestRewardType;
  tier: ChestTier;
  title: string;
  description: string;
  coins?: number;
  gems?: number;
  activity?: string;
  discountTokens?: number;
  streakProtectionTokens?: number;
  specialVouchers?: number;
  weight: number;
}

export interface LevelInfo {
  level: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  totalXpAtCurrentLevel: number;
  totalXpForNextLevel: number;
}

export interface LevelUnlock {
  level: number;
  title: string;
  description: string;
  itemIds: string[];
}

export interface GemSpecialAction {
  id: string;
  name: string;
  gemPrice: number;
  description: string;
  unlockLevel: number;
  status: "prepared";
}
