import type { ActivitySummary, CalendarActivityDay, SessionHistoryEntry, UserProgress } from "../types";
import { getWeekKey, todayKey } from "./gameRules";

function dateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function aggregateSessions(sessions: SessionHistoryEntry[]): Map<string, Omit<CalendarActivityDay, "dayOfMonth" | "isToday" | "isCurrentMonth" | "intensity" | "active">> {
  const map = new Map<string, Omit<CalendarActivityDay, "dayOfMonth" | "isToday" | "isCurrentMonth" | "intensity" | "active">>();

  for (const session of sessions) {
    const current = map.get(session.dateKey) ?? {
      dateKey: session.dateKey,
      questCount: 0,
      focusMinutes: 0,
      coinsEarned: 0,
    };
    map.set(session.dateKey, {
      ...current,
      questCount: current.questCount + 1,
      focusMinutes: current.focusMinutes + session.durationMinutes,
      coinsEarned: current.coinsEarned + session.earnedCoins,
    });
  }

  return map;
}

function intensityFor(minutes: number, quests: number): 0 | 1 | 2 | 3 {
  if (minutes >= 90 || quests >= 3) return 3;
  if (minutes >= 45 || quests >= 2) return 2;
  if (minutes > 0 || quests > 0) return 1;
  return 0;
}

export function buildCalendarActivity(progress: UserProgress, monthDate = new Date()): CalendarActivityDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayOffset);
  const sessionMap = aggregateSessions(progress.sessionHistory);
  const activeHistory = new Set(progress.completedDaysHistory);
  const today = todayKey();
  const days: CalendarActivityDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const dateKey = todayKey(current);
    const session = sessionMap.get(dateKey);
    const questCount = session?.questCount ?? (activeHistory.has(dateKey) ? 1 : 0);
    const focusMinutes = session?.focusMinutes ?? 0;
    const coinsEarned = session?.coinsEarned ?? 0;

    days.push({
      dateKey,
      dayOfMonth: current.getDate(),
      isToday: dateKey === today,
      isCurrentMonth: current.getMonth() === month,
      questCount,
      focusMinutes,
      coinsEarned,
      active: questCount > 0 || activeHistory.has(dateKey),
      intensity: intensityFor(focusMinutes, questCount),
    });
  }

  return days;
}

export function buildActivitySummary(progress: UserProgress, selectedDay?: CalendarActivityDay): ActivitySummary {
  const today = new Date();
  const activeDays = new Set(progress.completedDaysHistory);
  const last30 = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    return todayKey(date);
  });
  const currentMonth = buildCalendarActivity(progress, today).filter((day) => day.isCurrentMonth);
  const weekFocus = new Map<string, number>();

  for (const session of progress.sessionHistory) {
    const key = session.weekKey || getWeekKey(dateFromKey(session.dateKey));
    weekFocus.set(key, (weekFocus.get(key) ?? 0) + session.durationMinutes);
  }

  return {
    activeDaysLast30: last30.filter((dateKey) => activeDays.has(dateKey)).length,
    currentMonthActiveDays: currentMonth.filter((day) => day.active).length,
    currentMonthFocusMinutes: currentMonth.reduce((sum, day) => sum + day.focusMinutes, 0),
    bestWeekFocusMinutes: Math.max(0, ...weekFocus.values()),
    selectedDay,
  };
}
