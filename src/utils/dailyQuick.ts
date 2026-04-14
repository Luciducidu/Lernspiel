import { dailyQuickQuestConfig } from "../data/balancing";
import { dailyQuickQuestions } from "../data/questContent";
import type {
  AnswerOptionSet,
  DailyQuickQuestState,
  MultipleChoiceQuestion,
  Subject,
  SubjectPriority,
  SubjectPrioritySetting,
  UserProgress,
} from "../types";
import { getLevelInfo, todayKey } from "./gameRules";

const subjectPriorityIds: Record<Subject, SubjectPrioritySetting["id"]> = {
  PB: "pb",
  Deutsch: "deutsch",
  Mathe: "mathe",
};

const priorityWeights: Record<SubjectPriority, number> = {
  high: 5,
  medium: 3,
  low: 1.2,
  paused: 0.45,
};

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getPriorityWeight(subject: Subject, priorities: SubjectPrioritySetting[]): number {
  const subjectId = subjectPriorityIds[subject];
  const priority = priorities.find((item) => item.id === subjectId)?.priority ?? "medium";
  return priorityWeights[priority];
}

function rotateQuestionOptions(question: MultipleChoiceQuestion, dateKey: string): MultipleChoiceQuestion {
  const rotation = hashString(`${dateKey}:answers:${question.id}`) % question.options.length;
  if (rotation === 0) {
    return question;
  }

  const originalCorrectText = question.options.find((option) => option.id === question.correctOptionId)?.text;
  const rotatedTexts = [...question.options.slice(rotation), ...question.options.slice(0, rotation)].map((option) => option.text);
  const optionIds = ["a", "b", "c", "d"] as const;
  const options = rotatedTexts.map((text, index) => ({ id: optionIds[index], text })) as AnswerOptionSet;
  const correctOptionId = options.find((option) => option.text === originalCorrectText)?.id ?? "a";

  return {
    ...question,
    options,
    correctOptionId,
  };
}

export function getDailyQuickQuestionsForDate(
  priorities: SubjectPrioritySetting[],
  dateKey = todayKey(),
  count = dailyQuickQuestConfig.questsPerDay,
): MultipleChoiceQuestion[] {
  return dailyQuickQuestions
    .filter((question) => question.options.length === 4)
    .map((question) => {
      const randomScore = hashString(`${dateKey}:${question.id}`) / 4294967295;
      const priorityWeight = getPriorityWeight(question.subject, priorities);
      return { question, score: randomScore / priorityWeight };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map((item) => rotateQuestionOptions(item.question, dateKey));
}

export function getDailyQuickState(
  progress: UserProgress,
  questionId: string,
  dateKey = todayKey(),
): DailyQuickQuestState | undefined {
  return progress.dailyQuickQuestStates[dateKey]?.[questionId];
}

export function answerDailyQuickQuest(
  progress: UserProgress,
  question: MultipleChoiceQuestion,
  selectedOptionId: string,
  todaysQuestionIds: string[],
  dateKey = todayKey(),
): { progress: UserProgress; correct: boolean; message: string } {
  const existingState = progress.dailyQuickQuestStates[dateKey]?.[question.id];
  if (existingState?.answeredAt) {
    return {
      progress,
      correct: existingState.status === "correct",
      message: "Diese Daily Quick Quest wurde heute bereits beantwortet.",
    };
  }

  const correct = selectedOptionId === question.correctOptionId;
  const state: DailyQuickQuestState = {
    questionId: question.id,
    dateKey,
    status: correct ? "correct" : "incorrect",
    selectedOptionId,
    answeredAt: new Date().toISOString(),
  };

  const statesForDay = {
    ...(progress.dailyQuickQuestStates[dateKey] ?? {}),
    [question.id]: state,
  };
  const allAnswered = todaysQuestionIds.every((id) => Boolean(statesForDay[id]?.answeredAt));
  const allAnsweredBonusAvailable = allAnswered && !progress.dailyQuickBonusDates.includes(dateKey);
  const earnedCoins =
    (correct ? dailyQuickQuestConfig.correctCoins : 0) +
    (allAnsweredBonusAvailable ? dailyQuickQuestConfig.allAnsweredBonusCoins : 0);
  const earnedXp = correct ? dailyQuickQuestConfig.correctXp : 0;
  const nextXp = progress.xp + earnedXp;

  const nextProgress: UserProgress = {
    ...progress,
    coins: progress.coins + earnedCoins,
    xp: nextXp,
    level: getLevelInfo(nextXp).level,
    totalCoinsEarned: progress.totalCoinsEarned + earnedCoins,
    totalXpEarned: progress.totalXpEarned + earnedXp,
    dailyQuickQuestStates: {
      ...progress.dailyQuickQuestStates,
      [dateKey]: statesForDay,
    },
    dailyQuickBonusDates: allAnsweredBonusAvailable
      ? [...progress.dailyQuickBonusDates, dateKey]
      : progress.dailyQuickBonusDates,
  };

  const rewardText = correct
    ? `Richtig: +${dailyQuickQuestConfig.correctCoins} Coins und +${dailyQuickQuestConfig.correctXp} XP.`
    : "Nicht richtig: keine Coins, aber die Wiederholung zaehlt.";
  const bonusText = allAnsweredBonusAvailable
    ? ` Tagesrunde komplett: +${dailyQuickQuestConfig.allAnsweredBonusCoins} Coins Bonus.`
    : "";

  return {
    progress: nextProgress,
    correct,
    message: `${rewardText}${bonusText}`,
  };
}
