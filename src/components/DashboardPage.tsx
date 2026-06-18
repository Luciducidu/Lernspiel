import type { ReactNode } from "react";
import type {
  AppMode,
  AppPage,
  AppState,
  DailyGoal,
  FocusSummary,
  LevelInfo,
  LevelUnlock,
  MultipleChoiceQuestion,
  Quest,
  StreakState,
  SubjectPrioritySetting,
} from "../types";
import { AbiDashboard } from "./AbiDashboard";
import { BrainworkoutDashboard } from "./BrainworkoutDashboard";

interface DashboardPageProps {
  activeMode: AppMode;
  appState: AppState;
  focusText: string;
  levelInfo: LevelInfo;
  nextUnlock?: LevelUnlock;
  activeQuest: Quest | null;
  acceptedCount: number;
  subjects: SubjectPrioritySetting[];
  nextDailyGoal?: DailyGoal;
  weeklyGoals: DailyGoal[];
  quests: Quest[];
  dailyQuickQuestions: MultipleChoiceQuestion[];
  dailyQuickAnsweredCount: number;
  dailyQuickCorrectCount: number;
  streakState: StreakState;
  focusSummary: FocusSummary;
  completedToday: number;
  renderDailyQuickList: (list: MultipleChoiceQuestion[], compact?: boolean) => ReactNode;
  onNavigate: (page: AppPage) => void;
  onOpenDaily: () => void;
  onSelectQuest: (quest: Quest) => void;
}

export function DashboardPage({
  activeMode,
  appState,
  focusText,
  levelInfo,
  nextUnlock,
  activeQuest,
  acceptedCount,
  subjects,
  nextDailyGoal,
  weeklyGoals,
  quests,
  dailyQuickQuestions,
  dailyQuickAnsweredCount,
  dailyQuickCorrectCount,
  streakState,
  focusSummary,
  completedToday,
  renderDailyQuickList,
  onNavigate,
  onOpenDaily,
  onSelectQuest,
}: DashboardPageProps) {
  const recommendedAbiQuest = quests.find((quest) => quest.type === "study" && quest.status === "open");
  const recommendedBrainworkoutQuest = quests.find((quest) => quest.type === "housework" && quest.status === "open");

  if (activeMode === "brainworkout") {
    return (
      <BrainworkoutDashboard
        brainworkout={appState.brainworkout}
        levelInfo={levelInfo}
        nextUnlock={nextUnlock}
        activeQuest={activeQuest}
        acceptedCount={acceptedCount}
        recommendedQuest={recommendedBrainworkoutQuest}
        weeklyGoals={weeklyGoals}
        streakState={streakState}
        focusSummary={focusSummary}
        onNavigate={onNavigate}
        onSelectQuest={onSelectQuest}
      />
    );
  }

  return (
    <AbiDashboard
      focusText={focusText}
      levelInfo={levelInfo}
      nextUnlock={nextUnlock}
      activeQuest={activeQuest}
      acceptedCount={acceptedCount}
      subjects={subjects}
      nextDailyGoal={nextDailyGoal}
      weeklyGoals={weeklyGoals}
      recommendedQuest={recommendedAbiQuest}
      dailyQuickQuestions={dailyQuickQuestions}
      dailyQuickAnsweredCount={dailyQuickAnsweredCount}
      dailyQuickCorrectCount={dailyQuickCorrectCount}
      streakState={streakState}
      focusSummary={focusSummary}
      completedToday={completedToday}
      renderDailyQuickList={renderDailyQuickList}
      onNavigate={onNavigate}
      onOpenDaily={onOpenDaily}
      onSelectQuest={onSelectQuest}
    />
  );
}
