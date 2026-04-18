export type Difficulty = "easy" | "medium" | "hard";

export type QuestType = "study" | "daily_quick";

export type QuestStatus = "open" | "accepted" | "in_progress" | "completed" | "cancelled";

export type ShopSection = "standard" | "premium";

export type ChestTier = "bronze" | "silver" | "gold";

export type RewardCurrency = "coins" | "gems";

export type AppPage = "dashboard" | "quests" | "focus" | "shop" | "progress" | "settings";

export type SubjectId = "pb" | "mathe" | "deutsch" | "physik";

export type Subject = "PB" | "Deutsch" | "Mathe";

export type QuestTaskType = "recall" | "struktur" | "analyse" | "anwendung" | "chatgpt_training" | "abi_training";

export type QuestMode = "solo" | "mit_chatgpt" | "unter_zeitdruck" | "schreibplan" | "abfrage" | "klausurnah";

export type QuestOutputType =
  | "Stichpunkte"
  | "Schreibplan"
  | "kurze Erklärung"
  | "Vergleich"
  | "Rechnung"
  | "Analyse"
  | "Urteil"
  | "Gliederung"
  | "mündliche Erklärung"
  | "ChatGPT-Dialog";

export type TimeCategory = "kurz" | "normal" | "lang";

export interface CustomQuestDurationOption {
  minutes: number;
  isQuickPick: boolean;
  label: string;
}

export type SubjectPriority = "high" | "medium" | "low" | "paused";

export interface SubjectPrioritySetting {
  id: SubjectId;
  label: string;
  priority: SubjectPriority;
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  category: string;
  subject?: Subject;
  topic?: string;
  taskType?: QuestTaskType;
  mode?: QuestMode;
  outputType?: QuestOutputType;
  isCustom?: boolean;
  durationMinutes: number;
  recommendedDurationMinutes?: number;
  durationOptions?: number[];
  timeCategory?: TimeCategory;
  difficulty: Difficulty;
  note?: string;
  status: QuestStatus;
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  pausedAt?: string;
  accumulatedPausedMs?: number;
  completedAt?: string;
  cancelledAt?: string;
  reflection?: ReflectionData;
}

export interface AnswerOption {
  id: string;
  text: string;
}

export type AnswerOptionSet = [AnswerOption, AnswerOption, AnswerOption, AnswerOption];

export interface MultipleChoiceQuestion {
  id: string;
  type: "daily_quick";
  subject: Subject;
  topic: string;
  question: string;
  options: AnswerOptionSet;
  correctOptionId: string;
  explanation: string;
}

export type DailyQuickAnswerStatus = "unanswered" | "correct" | "incorrect";

export interface DailyQuickQuestState {
  questionId: string;
  dateKey: string;
  status: DailyQuickAnswerStatus;
  selectedOptionId?: string;
  answeredAt?: string;
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
  streakRewardClaims: StreakRewardClaim[];
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
  dailyQuickQuestStates: Record<string, Record<string, DailyQuickQuestState>>;
  dailyQuickBonusDates: string[];
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
  formula?: RewardFormulaResult;
}

export interface RewardFormulaResult {
  baseCoins: number;
  baseXp: number;
  difficultyMultiplier: number;
  timeBonusCoins: number;
  timeBonusXp: number;
  completionBonusCoins: number;
  totalCoins: number;
  totalXp: number;
  durationMinutes: number;
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
  status?: GoalRewardStatus;
}

export type GoalRewardStatus = "locked" | "available" | "claimed";

export interface DailyQuest extends DailyGoal {
  resetKey: string;
  scope: "daily";
}

export interface WeeklyQuest extends DailyGoal {
  resetKey: string;
  scope: "weekly";
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

export type StreakRewardStatus = "locked" | "available" | "claimed";

export interface StreakReward {
  id: string;
  milestoneDays: number;
  title: string;
  description: string;
  reward: GoalReward & {
    badge?: string;
    luckyChestTier?: ChestTier;
    discountTokens?: number;
  };
  status: StreakRewardStatus;
}

export interface StreakRewardClaim {
  rewardId: string;
  milestoneDays: number;
  claimedAt: string;
}

export interface CalendarActivityDay {
  dateKey: string;
  dayOfMonth: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  questCount: number;
  focusMinutes: number;
  coinsEarned: number;
  active: boolean;
  intensity: 0 | 1 | 2 | 3;
}

export interface ActivitySummary {
  activeDaysLast30: number;
  currentMonthActiveDays: number;
  currentMonthFocusMinutes: number;
  bestWeekFocusMinutes: number;
  selectedDay?: CalendarActivityDay;
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
