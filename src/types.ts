export type Difficulty = "easy" | "medium" | "hard";

export type QuestType = "study" | "daily_quick" | "housework";

export type QuestStatus = "open" | "accepted" | "in_progress" | "completed" | "cancelled";

export type ShopSection = "standard" | "premium";

export type ChestTier = "bronze" | "silver" | "gold";

export type RewardCurrency = "coins" | "gems";

export type RewardStatus = "available" | "active" | "used";

export type AppPage = "dashboard" | "quests" | "focus" | "shop" | "progress" | "planning" | "settings";

export type AppMode = "abi" | "brainworkout";

export type BrainworkoutAreaId =
  | "math_first_semester"
  | "physics_first_semester"
  | "language_poetry_slam"
  | "logic_puzzles"
  | "chess_external"
  | "driving_license"
  | "housework_life";

export type BrainworkoutQuestType =
  | "math_foundations"
  | "physics_understanding"
  | "poetry_language"
  | "logic_puzzle"
  | "chess_app"
  | "driving_app"
  | "weekly_reflection"
  | "housework";

export type DailyPlanTier = "minimum" | "normal" | "strong";

export type WeeklyEnergyLevel = "low" | "medium" | "high";

export type WeeklyPressureLevel = "low" | "medium" | "high";

export type WeeklyPlanStatus = "draft" | "active" | "completed";

export type BrainworkoutReflectionMood = "good" | "mixed" | "hard";

export interface BrainworkoutWeeklyPlan {
  weekId: string;
  startDate: string;
  endDate: string;
  availableTimeEstimate: "under_2h" | "2_4h" | "4_6h" | "over_6h";
  fixedAppointmentsNote: string;
  mainFocusArea: BrainworkoutAreaId;
  energyLevel: WeeklyEnergyLevel;
  obligations: string[];
  pressureLevel: WeeklyPressureLevel;
  concreteGoal: string;
  status: WeeklyPlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BrainworkoutWeeklyReflection {
  id: string;
  weekId: string;
  completedAt: string;
  accomplished: string;
  tooMuch: string;
  understood: string;
  enjoyable: string;
  simplifyNextWeek: string;
  nextWeekGoal: string;
  mood?: BrainworkoutReflectionMood;
  energyAfterWeek?: WeeklyEnergyLevel;
  notes?: string;
}

export type AccountMode = "local" | "account";

export type SyncStatus = "idle" | "syncing" | "success" | "error" | "offline";

export interface AccountState {
  mode: AccountMode;
  username?: string;
  passphraseHash?: string;
  lastSyncedAt?: string;
  syncStatus: SyncStatus;
  syncMessage?: string;
}

export interface SyncBundle {
  appDataVersion: number;
  username: string;
  passphraseHash: string;
  updatedAt: string;
  quests: Quest[];
  progress: UserProgress;
  appState?: AppState;
}

export interface AppGlobalState {
  coins: number;
  gems: number;
  purchasedRewards: string[];
  rewardInventory: RewardInventoryItem[];
  streak: number;
  longestStreak: number;
  soundEnabled: boolean;
}

export interface ModeProgressState {
  xp: number;
  level: number;
  questIds: string[];
  sessionHistoryIds: string[];
  dailyStateKeys: string[];
  weeklyStateKeys: string[];
}

export interface AbiModeState extends ModeProgressState {
  subjects: Subject[];
  topicProgress: Record<string, number>;
}

export interface BrainworkoutModeState extends ModeProgressState {
  areas: BrainworkoutAreaId[];
  areaProgress: Record<BrainworkoutAreaId, number>;
  weeklyReflectionIds: string[];
  weeklyPlans: BrainworkoutWeeklyPlan[];
  weeklyReflections: BrainworkoutWeeklyReflection[];
}

export interface AppState {
  appDataVersion: number;
  activeMode: AppMode;
  global: AppGlobalState;
  abi: AbiModeState;
  brainworkout: BrainworkoutModeState;
}

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
  appMode?: AppMode;
  type: QuestType;
  title: string;
  category: string;
  description?: string;
  area?: BrainworkoutAreaId;
  brainworkoutQuestType?: BrainworkoutQuestType;
  dailyPlanTier?: DailyPlanTier;
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
  extraTimeMinutes?: number;
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
  rewardInventory: RewardInventoryItem[];
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
  soundEnabled: boolean;
}

export interface RewardInventoryItem {
  id: string;
  shopItemId: string;
  name: string;
  description: string;
  durationLabel?: string;
  price: number;
  currency: RewardCurrency;
  purchasedAt: string;
  status: RewardStatus;
}

export interface PurchaseResult {
  itemName: string;
  durationLabel?: string;
  price: number;
  currency: RewardCurrency;
  purchasedAt: string;
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
  appMode?: AppMode;
  questType?: QuestType;
  subject?: Subject;
  area?: BrainworkoutAreaId;
  brainworkoutQuestType?: BrainworkoutQuestType;
  dailyPlanTier?: DailyPlanTier;
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

export type RewardRarity = "common" | "uncommon" | "rare" | "epic";

export type RewardCategory = "coins" | "gems" | "activity" | "streak" | "special" | "bonus";

export interface ChestReward {
  id: string;
  type: ChestRewardType;
  tier: ChestTier;
  rarity: RewardRarity;
  category: RewardCategory;
  label: string;
  displayValue: string;
  internalCoinValue: number;
  iconKey: string;
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
