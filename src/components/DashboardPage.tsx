import type { ReactNode } from "react";
import type {
  AppMode,
  AppPage,
  AppState,
  BrainworkoutWeeklyPlan,
  BrainworkoutWeeklyReflection,
  DailyGoal,
  FocusSummary,
  LevelInfo,
  LevelUnlock,
  MultipleChoiceQuestion,
  Quest,
  StreakState,
  SubjectPrioritySetting,
} from "../types";
import { getQuestAppMode } from "../utils/modeScopedQuestSelectors";
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
  currentWeeklyPlan?: BrainworkoutWeeklyPlan;
  latestWeeklyReflection?: BrainworkoutWeeklyReflection;
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
  onCopyReflectionPrompt: () => void;
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
  currentWeeklyPlan,
  latestWeeklyReflection,
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
  onCopyReflectionPrompt,
}: DashboardPageProps) {
  const recommendedAbiQuest = quests.find((quest) => getQuestAppMode(quest) === "abi" && quest.type === "study" && quest.status === "open");
  const recommendedBrainworkoutQuest = quests.find((quest) => getQuestAppMode(quest) === "brainworkout" && quest.status === "open");
  const brainworkoutQuests = quests.filter((quest) => getQuestAppMode(quest) === "brainworkout");

  if (activeMode === "brainworkout") {
    return (
      <BrainworkoutDashboard
        brainworkout={appState.brainworkout}
        levelInfo={levelInfo}
        nextUnlock={nextUnlock}
        activeQuest={activeQuest}
        acceptedCount={acceptedCount}
        recommendedQuest={recommendedBrainworkoutQuest}
        quests={brainworkoutQuests}
        weeklyGoals={weeklyGoals}
        currentWeeklyPlan={currentWeeklyPlan}
        latestWeeklyReflection={latestWeeklyReflection}
        streakState={streakState}
        focusSummary={focusSummary}
        onNavigate={onNavigate}
        onSelectQuest={onSelectQuest}
        onCopyReflectionPrompt={onCopyReflectionPrompt}
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
