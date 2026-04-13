import { useMemo } from "react";
import { shopItems } from "../data/balancing";
import type { Quest, UserProgress } from "../types";
import {
  buildDailyGoals,
  buildFocusSummary,
  buildStatsSummary,
  buildWeeklyGoals,
  getLatestUnlock,
  getLevelInfo,
  getNextUnlock,
  getStreakState,
  todayKey,
} from "../utils/gameRules";

const questStatusOrder: Record<Quest["status"], number> = {
  in_progress: 0,
  accepted: 1,
  open: 2,
  cancelled: 3,
  completed: 4,
};

export function useAppDerivedState(quests: Quest[], progress: UserProgress, activeQuestId: string | null) {
  return useMemo(() => {
    const levelInfo = getLevelInfo(progress.xp);
    const focusSummary = buildFocusSummary(progress);
    const statsSummary = buildStatsSummary(progress);
    const streakState = getStreakState(progress);
    const runningQuest = quests.find((quest) => quest.status === "in_progress") ?? null;
    const activeQuest =
      quests.find((quest) => quest.id === activeQuestId && quest.status === "in_progress") ?? runningQuest;
    const completedToday = progress.sessionHistory.filter((session) => session.dateKey === todayKey()).length;
    const acceptedQuests = quests.filter((quest) => quest.status === "accepted");
    const runningQuests = quests.filter((quest) => quest.status === "in_progress");
    const latestCompleted = quests
      .filter((quest) => quest.status === "completed")
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
      .slice(0, 3);
    const nextUnlock = getNextUnlock(levelInfo.level);
    const latestUnlock = getLatestUnlock(levelInfo.level);
    const dailyGoals = buildDailyGoals(progress);
    const weeklyGoals = buildWeeklyGoals(progress);

    return {
      levelInfo,
      focusSummary,
      statsSummary,
      streakState,
      activeQuest,
      completedToday,
      acceptedQuests,
      runningQuests,
      latestCompleted,
      latestUnlock,
      nextUnlock,
      standardItems: shopItems.filter((item) => item.section === "standard"),
      premiumItems: shopItems.filter((item) => item.section === "premium"),
      sortedQuests: [...quests].sort((a, b) => questStatusOrder[a.status] - questStatusOrder[b.status]),
      dailyGoals,
      weeklyGoals,
      nextDailyGoal: dailyGoals.find((goal) => goal.current < goal.target),
      nextWeeklyGoal: weeklyGoals.find((goal) => goal.current < goal.target),
    };
  }, [activeQuestId, progress, quests]);
}
