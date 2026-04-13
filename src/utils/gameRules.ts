import {
  chestRewards,
  completionBonusCoins,
  dailyGoalDefinitions,
  levelUnlocks,
  questRewardTable,
  weeklyGoalDefinitions,
} from "../data/balancing";
import { studyQuestTemplates } from "../data/questContent";
import type {
  ChestReward,
  ChestTier,
  DailyGoal,
  Difficulty,
  FocusSummary,
  LevelInfo,
  LevelUnlock,
  Quest,
  RewardResult,
  SessionHistoryEntry,
  ShopItem,
  StatsSummary,
  StreakState,
  Subject,
  SubjectPriority,
  SubjectPrioritySetting,
  UserProgress,
} from "../types";

export function calculateQuestReward(quest: Quest): RewardResult {
  const base = questRewardTable[quest.difficulty];

  return {
    coins: base.coins,
    xp: base.xp,
    bonusCoins: completionBonusCoins,
    reflectionBonusPrepared: true,
    message: `Quest abgeschlossen: +${base.coins + completionBonusCoins} Coins und +${base.xp} XP.`,
  };
}

export function getXpRequirementForLevel(level: number): number {
  if (level <= 1) return 100;
  if (level <= 4) return 100 + (level - 1) * 40;

  const afterLevelFour = level - 4;
  return 220 + afterLevelFour * 55 + Math.floor(afterLevelFour * afterLevelFour * 6);
}

export function getTotalXpForLevel(level: number): number {
  let total = 0;

  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    total += getXpRequirementForLevel(currentLevel);
  }

  return total;
}

export function getLevelInfo(xp: number): LevelInfo {
  let level = 1;
  let remainingXp = xp;

  while (remainingXp >= getXpRequirementForLevel(level)) {
    remainingXp -= getXpRequirementForLevel(level);
    level += 1;
  }

  const totalXpAtCurrentLevel = getTotalXpForLevel(level);
  const xpForNextLevel = getXpRequirementForLevel(level);

  return {
    level,
    xpInCurrentLevel: remainingXp,
    xpForNextLevel,
    totalXpAtCurrentLevel,
    totalXpForNextLevel: totalXpAtCurrentLevel + xpForNextLevel,
  };
}

export function isUnlocked(item: Pick<ShopItem, "unlockLevel">, level: number): boolean {
  return level >= item.unlockLevel;
}

export function getLatestUnlock(level: number): LevelUnlock | undefined {
  return [...levelUnlocks].reverse().find((unlock) => unlock.level <= level);
}

export function getNextUnlock(level: number): LevelUnlock | undefined {
  return levelUnlocks.find((unlock) => unlock.level > level);
}

export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return todayKey(date);
}

export function yesterdayKey(date = new Date()): string {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return todayKey(previous);
}

export function getWeekKey(date = new Date()): string {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (local.getDay() + 6) % 7;
  local.setDate(local.getDate() - day + 3);
  const firstThursday = new Date(local.getFullYear(), 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
  const week = 1 + Math.round((local.getTime() - firstThursday.getTime()) / 604800000);
  return `${local.getFullYear()}-W${`${week}`.padStart(2, "0")}`;
}

export function getStreakState(progress: UserProgress): StreakState {
  const history = [...new Set(progress.completedDaysHistory)].sort();
  const today = todayKey();
  const yesterday = yesterdayKey();
  const rescueDate = progress.lastCompletedDate ? addDays(progress.lastCompletedDate, 1) : undefined;
  const missedExactlyYesterday = Boolean(
    progress.lastCompletedDate &&
      progress.lastCompletedDate < yesterday &&
      rescueDate === yesterday &&
      !progress.rescuedStreakDates.includes(rescueDate),
  );
  const isStillCurrent = progress.lastCompletedDate === today || progress.lastCompletedDate === yesterday || missedExactlyYesterday;

  return {
    currentStreak: isStillCurrent ? progress.streak : 0,
    longestStreak: progress.longestStreak,
    lastCompletedDate: progress.lastCompletedDate,
    completedDaysHistory: history,
    canRescue: missedExactlyYesterday && !history.includes(today),
    rescueDate,
  };
}

function updateStreak(progress: UserProgress, dateKey: string): Pick<
  UserProgress,
  "streak" | "longestStreak" | "lastCompletedDate" | "completedDaysHistory"
> {
  const history = [...new Set([...progress.completedDaysHistory, dateKey])].sort();

  if (progress.lastCompletedDate === dateKey) {
    return {
      streak: progress.streak,
      longestStreak: Math.max(progress.longestStreak, progress.streak),
      lastCompletedDate: dateKey,
      completedDaysHistory: history,
    };
  }

  const continues = progress.lastCompletedDate === addDays(dateKey, -1);
  const streak = continues ? progress.streak + 1 : 1;

  return {
    streak,
    longestStreak: Math.max(progress.longestStreak, streak),
    lastCompletedDate: dateKey,
    completedDaysHistory: history,
  };
}

function applyGoalReward(progress: UserProgress, reward = {} as NonNullable<DailyGoal["reward"]>): UserProgress {
  const xp = progress.xp + (reward.xp ?? 0);
  const gems = progress.gems + (reward.gems ?? 0);

  return {
    ...progress,
    coins: progress.coins + (reward.coins ?? 0),
    xp,
    level: getLevelInfo(xp).level,
    gems,
    totalCoinsEarned: progress.totalCoinsEarned + (reward.coins ?? 0),
    totalXpEarned: progress.totalXpEarned + (reward.xp ?? 0),
    totalGemsEarned: progress.totalGemsEarned + (reward.gems ?? 0),
  };
}

export function buildDailyGoals(progress: UserProgress): DailyGoal[] {
  const date = todayKey();
  const progressForDay = progress.dailyGoalProgress[date]?.claimedGoalIds ?? [];
  const completedToday = progress.sessionHistory.filter((session) => session.dateKey === date).length;
  const focusToday = progress.sessionHistory
    .filter((session) => session.dateKey === date)
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const startedToday = progress.startedQuestDaysHistory.includes(date) ? 1 : 0;

  return dailyGoalDefinitions.map((goal) => ({
    ...goal,
    current:
      goal.id === "daily-complete-1" || goal.id === "daily-complete-2"
        ? completedToday
        : goal.id === "daily-start-1"
          ? startedToday
          : focusToday,
    claimed: progressForDay.includes(goal.id),
  }));
}

export function buildWeeklyGoals(progress: UserProgress): DailyGoal[] {
  const week = getWeekKey();
  const progressForWeek = progress.weeklyGoalProgress[week]?.claimedGoalIds ?? [];
  const sessionsThisWeek = progress.sessionHistory.filter((session) => session.weekKey === week);
  const completed = sessionsThisWeek.length;
  const focus = sessionsThisWeek.reduce((sum, session) => sum + session.durationMinutes, 0);
  const days = new Set(sessionsThisWeek.map((session) => session.dateKey)).size;
  const chests = progress.chestOpenDates.filter((date) => getWeekKey(new Date(`${date}T12:00:00`)) === week).length;

  return weeklyGoalDefinitions.map((goal) => ({
    ...goal,
    current:
      goal.id === "weekly-complete-5"
        ? completed
        : goal.id === "weekly-focus-120"
          ? focus
          : goal.id === "weekly-days-4"
            ? days
            : chests,
    claimed: progressForWeek.includes(goal.id),
  }));
}

export function applyAvailableGoalRewards(progress: UserProgress): { progress: UserProgress; messages: string[] } {
  let next = progress;
  const messages: string[] = [];
  const date = todayKey();
  const week = getWeekKey();
  const dailyClaimed = new Set(next.dailyGoalProgress[date]?.claimedGoalIds ?? []);

  for (const goal of buildDailyGoals(next)) {
    if (goal.current >= goal.target && !dailyClaimed.has(goal.id)) {
      dailyClaimed.add(goal.id);
      next = applyGoalReward(next, goal.reward);
      messages.push(`${goal.title}: Zielbelohnung erhalten.`);
    }
  }

  next = {
    ...next,
    dailyGoalProgress: { ...next.dailyGoalProgress, [date]: { dateKey: date, claimedGoalIds: [...dailyClaimed] } },
  };

  const weeklyClaimed = new Set(next.weeklyGoalProgress[week]?.claimedGoalIds ?? []);
  for (const goal of buildWeeklyGoals(next)) {
    if (goal.current >= goal.target && !weeklyClaimed.has(goal.id)) {
      weeklyClaimed.add(goal.id);
      next = applyGoalReward(next, goal.reward);
      messages.push(`${goal.title}: Wochenbelohnung erhalten.`);
    }
  }

  return {
    progress: {
      ...next,
      weeklyGoalProgress: { ...next.weeklyGoalProgress, [week]: { weekKey: week, claimedGoalIds: [...weeklyClaimed] } },
    },
    messages,
  };
}

export function applyQuestStart(progress: UserProgress): UserProgress {
  const day = todayKey();
  const startedQuestDaysHistory = progress.startedQuestDaysHistory.includes(day)
    ? progress.startedQuestDaysHistory
    : [...progress.startedQuestDaysHistory, day];
  return applyAvailableGoalRewards({ ...progress, startedQuestDaysHistory }).progress;
}

export function applyQuestCompletion(progress: UserProgress, quest: Quest, reward: RewardResult, focusMinutes: number): UserProgress {
  if (quest.status !== "in_progress" || progress.sessionHistory.some((session) => session.questId === quest.id)) {
    return progress;
  }

  const date = new Date();
  const dateKey = todayKey(date);
  const weekKey = getWeekKey(date);
  const earnedCoins = reward.coins + reward.bonusCoins;
  const xp = progress.xp + reward.xp;
  const streak = updateStreak(progress, dateKey);
  const session: SessionHistoryEntry = {
    id: crypto.randomUUID(),
    questId: quest.id,
    date: date.toISOString(),
    dateKey,
    weekKey,
    questTitle: quest.title,
    category: quest.category,
    difficulty: quest.difficulty,
    durationMinutes: Math.max(1, focusMinutes),
    earnedCoins,
    earnedXp: reward.xp,
    reflection: quest.reflection,
    status: "completed",
  };

  const next = {
    ...progress,
    coins: progress.coins + earnedCoins,
    xp,
    level: getLevelInfo(xp).level,
    ...streak,
    completedToday: progress.lastCompletedDate === dateKey ? progress.completedToday + 1 : 1,
    totalCoinsEarned: progress.totalCoinsEarned + earnedCoins,
    totalXpEarned: progress.totalXpEarned + reward.xp,
    totalFocusMinutes: progress.totalFocusMinutes + Math.max(1, focusMinutes),
    sessionHistory: [session, ...progress.sessionHistory],
  };

  return applyAvailableGoalRewards(next).progress;
}

export function drawChestReward(tier: ChestTier): ChestReward {
  const rewards = chestRewards[tier];
  const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const reward of rewards) {
    roll -= reward.weight;
    if (roll <= 0) return reward;
  }

  return rewards[rewards.length - 1];
}

export function applyChestReward(progress: UserProgress, reward: ChestReward): UserProgress {
  const date = todayKey();
  const next = {
    ...progress,
    coins: progress.coins + (reward.coins ?? 0),
    gems: progress.gems + (reward.gems ?? 0),
    discountTokens: progress.discountTokens + (reward.discountTokens ?? 0),
    streakProtectionTokens: progress.streakProtectionTokens + (reward.streakProtectionTokens ?? 0),
    specialVouchers: progress.specialVouchers + (reward.specialVouchers ?? 0),
    totalCoinsEarned: progress.totalCoinsEarned + (reward.coins ?? 0),
    totalGemsEarned: progress.totalGemsEarned + (reward.gems ?? 0),
    chestOpenDates: [...progress.chestOpenDates, date],
    purchasedRewards: reward.activity ? [...progress.purchasedRewards, reward.activity] : progress.purchasedRewards,
  };

  return applyAvailableGoalRewards(next).progress;
}

export function spendCoins(progress: UserProgress, amount: number): UserProgress {
  const safeAmount = Math.max(0, amount);
  if (progress.coins < safeAmount) {
    return progress;
  }

  return { ...progress, coins: progress.coins - safeAmount, totalCoinsSpent: progress.totalCoinsSpent + safeAmount };
}

export function spendGems(progress: UserProgress, amount: number): UserProgress {
  const safeAmount = Math.max(0, amount);
  if (progress.gems < safeAmount) {
    return progress;
  }

  return { ...progress, gems: progress.gems - safeAmount };
}

export function rescueStreak(progress: UserProgress): { progress: UserProgress; ok: boolean; message: string } {
  const state = getStreakState(progress);
  if (!state.canRescue || !state.rescueDate) {
    return { progress, ok: false, message: "Streak-Rettung ist nur für den unmittelbar letzten verpassten Tag möglich." };
  }
  if (progress.gems < 2) {
    return { progress, ok: false, message: "Dafür fehlen 2 Gems." };
  }

  const rescuedHistory = [...new Set([...progress.completedDaysHistory, state.rescueDate])].sort();
  const next = {
    ...progress,
    gems: progress.gems - 2,
    completedDaysHistory: rescuedHistory,
    rescuedStreakDates: [...progress.rescuedStreakDates, state.rescueDate],
    lastCompletedDate: state.rescueDate,
    streak: Math.max(1, progress.streak + 1),
    longestStreak: Math.max(progress.longestStreak, progress.streak + 1),
  };

  return { progress: next, ok: true, message: "Streak gerettet. Der verpasste Tag wurde geschützt." };
}

const subjectPriorityIds: Record<Subject, SubjectPrioritySetting["id"]> = {
  PB: "pb",
  Deutsch: "deutsch",
  Mathe: "mathe",
  Physik: "physik",
};

const rerollPriorityWeights: Record<SubjectPriority, number> = {
  high: 5,
  medium: 3,
  low: 1,
  paused: 0.35,
};

function getSubjectPriorityWeight(subject: Subject, priorities: SubjectPrioritySetting[]): number {
  const priorityId = subjectPriorityIds[subject];
  const priority = priorities.find((item) => item.id === priorityId)?.priority ?? "medium";
  return rerollPriorityWeights[priority];
}

export function rerollQuest(quest: Quest, priorities: SubjectPrioritySetting[] = []): Quest {
  const weightedTemplates = studyQuestTemplates.map((template) => ({
    template,
    weight: getSubjectPriorityWeight(template.subject, priorities),
  }));
  const totalWeight = weightedTemplates.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * Math.max(1, totalWeight);
  const picked =
    weightedTemplates.find((item) => {
      roll -= item.weight;
      return roll <= 0;
    }) ?? weightedTemplates[0];
  const template = picked.template;

  return {
    ...quest,
    ...template,
    id: crypto.randomUUID(),
    type: "study",
    createdAt: new Date().toISOString(),
    status: "open",
    acceptedAt: undefined,
    startedAt: undefined,
    completedAt: undefined,
    cancelledAt: undefined,
    reflection: undefined,
  };
}

export function buildFocusSummary(progress: UserProgress): FocusSummary {
  const day = todayKey();
  const week = getWeekKey();
  return {
    totalMinutes: progress.totalFocusMinutes,
    todayMinutes: progress.sessionHistory
      .filter((session) => session.dateKey === day)
      .reduce((sum, session) => sum + session.durationMinutes, 0),
    weekMinutes: progress.sessionHistory
      .filter((session) => session.weekKey === week)
      .reduce((sum, session) => sum + session.durationMinutes, 0),
  };
}

export function buildStatsSummary(progress: UserProgress): StatsSummary {
  const categoryCounts = new Map<string, number>();
  const difficultyDistribution: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  const completedByDay = new Map<string, number>();
  const focus = buildFocusSummary(progress);

  for (const session of progress.sessionHistory) {
    categoryCounts.set(session.category, (categoryCounts.get(session.category) ?? 0) + 1);
    difficultyDistribution[session.difficulty] += 1;
    completedByDay.set(session.dateKey, (completedByDay.get(session.dateKey) ?? 0) + 1);
  }

  const topCategory = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Noch keine";

  return {
    totalCompletedQuests: progress.sessionHistory.length,
    totalCoinsEarned: progress.totalCoinsEarned,
    totalCoinsSpent: progress.totalCoinsSpent,
    totalXpEarned: progress.totalXpEarned,
    currentStreak: progress.streak,
    longestStreak: progress.longestStreak,
    totalFocusMinutes: focus.totalMinutes,
    focusTodayMinutes: focus.todayMinutes,
    focusWeekMinutes: focus.weekMinutes,
    chestsOpened: progress.chestOpenDates.length,
    totalGemsEarned: progress.totalGemsEarned,
    topCategory,
    difficultyDistribution,
    completedByDay: [...completedByDay.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([dateKey, count]) => ({ dateKey, count })),
  };
}
