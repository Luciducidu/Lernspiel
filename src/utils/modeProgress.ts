import type {
  AppMode,
  BrainworkoutAreaId,
  BrainworkoutModeState,
  DailyPlanTier,
  Quest,
  SessionHistoryEntry,
  Subject,
} from "../types";
import { brainworkoutAreaLabels, dailyPlanTierLabels } from "../data/brainworkoutQuestPool";
import { getQuestAppMode } from "./modeScopedQuestSelectors";

export function getSessionAppMode(session: SessionHistoryEntry): AppMode {
  if (session.appMode === "brainworkout" || session.questType === "housework" || session.category === "Hausarbeit") {
    return "brainworkout";
  }

  return "abi";
}

export function getModeSessions(sessions: SessionHistoryEntry[], activeMode: AppMode): SessionHistoryEntry[] {
  return sessions.filter((session) => getSessionAppMode(session) === activeMode);
}

export function buildAbiProgress(quests: Quest[], sessions: SessionHistoryEntry[]) {
  const abiQuests = quests.filter((quest) => getQuestAppMode(quest) === "abi");
  const abiSessions = getModeSessions(sessions, "abi");
  const subjects: Subject[] = ["PB", "Deutsch", "Mathe"];
  const subjectRows = subjects.map((subject) => {
    const subjectSessions = abiSessions.filter((session) => session.subject === subject || session.category === subject);
    return {
      label: subject,
      minutes: subjectSessions.reduce((sum, session) => sum + session.durationMinutes, 0),
      units: subjectSessions.length,
    };
  });

  const topicCounts = new Map<string, number>();
  for (const quest of abiQuests.filter((quest) => quest.status === "completed")) {
    topicCounts.set(quest.topic ?? quest.category, (topicCounts.get(quest.topic ?? quest.category) ?? 0) + 1);
  }

  return {
    quests: abiQuests,
    sessions: abiSessions,
    subjectRows,
    topics: [...topicCounts.entries()].map(([label, units]) => ({ label, units })).sort((a, b) => b.units - a.units),
    abiTrainingCount: abiQuests.filter((quest) => quest.status === "completed" && quest.taskType === "abi_training").length,
    writingPlanCount: abiQuests.filter((quest) => quest.status === "completed" && (quest.mode === "schreibplan" || quest.outputType === "Schreibplan")).length,
  };
}

export function buildBrainworkoutProgress(
  quests: Quest[],
  sessions: SessionHistoryEntry[],
  brainworkout: BrainworkoutModeState,
) {
  const brainQuests = quests.filter((quest) => getQuestAppMode(quest) === "brainworkout");
  const brainSessions = getModeSessions(sessions, "brainworkout");
  const areaRows = (Object.keys(brainworkoutAreaLabels) as BrainworkoutAreaId[]).map((area) => {
    const areaSessions = brainSessions.filter((session) => session.area === area || session.category === brainworkoutAreaLabels[area]);
    return {
      area,
      label: brainworkoutAreaLabels[area],
      minutes: areaSessions.reduce((sum, session) => sum + session.durationMinutes, 0),
      units: areaSessions.length,
      progress: brainworkout.areaProgress[area] ?? 0,
    };
  });

  const tierRows = (["minimum", "normal", "strong"] as DailyPlanTier[]).map((tier) => ({
    label: dailyPlanTierLabels[tier],
    units: brainSessions.filter((session) => session.dailyPlanTier === tier).length,
  }));

  return {
    quests: brainQuests,
    sessions: brainSessions,
    areaRows,
    tierRows,
    reflectionCount: brainworkout.weeklyReflections.length,
    latestReflection: [...brainworkout.weeklyReflections].sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0],
    latestPlan: [...brainworkout.weeklyPlans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0],
  };
}
