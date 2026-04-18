import type { CustomQuestDurationOption, Difficulty, Quest, QuestTaskType, Subject, TimeCategory } from "../types";

export const allowedDurations = [10, 15, 20, 25, 30, 35, 45, 60] as const;
export const customQuestDurationMin = 10;
export const customQuestDurationMax = 120;
export const customQuestDurationStep = 5;
export const customQuestQuickDurations = [15, 20, 25, 30, 45, 60, 90] as const;

const presetsByTaskType: Record<QuestTaskType, { options: number[]; defaultDuration: number }> = {
  recall: { options: [10, 15, 20], defaultDuration: 15 },
  struktur: { options: [15, 20, 25], defaultDuration: 20 },
  analyse: { options: [25, 30, 35, 45], defaultDuration: 30 },
  anwendung: { options: [20, 30, 45], defaultDuration: 30 },
  chatgpt_training: { options: [15, 20, 25, 30], defaultDuration: 20 },
  abi_training: { options: [30, 45, 60], defaultDuration: 45 },
};

const difficultyShift: Record<Difficulty, number> = {
  easy: -1,
  medium: 0,
  hard: 1,
};

function categoryForDuration(minutes: number): TimeCategory {
  if (minutes <= 20) return "kurz";
  if (minutes <= 35) return "normal";
  return "lang";
}

function clampCustomDuration(minutes: number): number {
  const rounded = Math.round(minutes / customQuestDurationStep) * customQuestDurationStep;
  return Math.min(customQuestDurationMax, Math.max(customQuestDurationMin, rounded));
}

function subjectPreference(subject?: Subject): number[] {
  if (subject === "PB") return [20, 25, 30, 45];
  if (subject === "Deutsch") return [20, 25, 30, 35, 45];
  if (subject === "Mathe") return [20, 30, 45, 60];
  return [20, 25, 30];
}

function closestAllowed(value: number, options: number[]): number {
  return [...options].sort((a, b) => Math.abs(a - value) - Math.abs(b - value))[0] ?? 25;
}

type DurationQuestInput = Partial<
  Pick<Quest, "taskType" | "subject" | "difficulty" | "mode" | "outputType" | "durationMinutes" | "isCustom">
>;

export function customQuestDurationOptions(selectedMinutes = 30): CustomQuestDurationOption[] {
  const selected = clampCustomDuration(selectedMinutes);
  const values = [...new Set([...customQuestQuickDurations, selected])].sort((a, b) => a - b);

  return values.map((minutes) => ({
    minutes,
    isQuickPick: customQuestQuickDurations.includes(minutes as (typeof customQuestQuickDurations)[number]),
    label: `${minutes} Min`,
  }));
}

export function normalizeCustomQuestDuration(minutes: number): number {
  return clampCustomDuration(minutes);
}

export function durationOptionsForQuest(quest: DurationQuestInput): number[] {
  const preset = quest.taskType ? presetsByTaskType[quest.taskType] : { options: [20, 25, 30], defaultDuration: 25 };
  const subjectOptions = subjectPreference(quest.subject);
  const merged = [...new Set([...preset.options, ...preset.options.filter((duration) => subjectOptions.includes(duration))])].sort(
    (a, b) => a - b,
  );

  if (quest.mode === "schreibplan") {
    return merged.filter((duration) => duration <= 30);
  }

  return merged;
}

export function recommendedDurationForQuest(quest: DurationQuestInput): number {
  const options = durationOptionsForQuest(quest);
  const preset = quest.taskType ? presetsByTaskType[quest.taskType] : { options, defaultDuration: 25 };
  const baseIndex = Math.max(0, options.indexOf(closestAllowed(preset.defaultDuration, options)));
  const shiftedIndex = Math.min(options.length - 1, Math.max(0, baseIndex + difficultyShift[quest.difficulty ?? "medium"]));
  let recommended = options[shiftedIndex] ?? preset.defaultDuration;

  if (quest.subject === "Deutsch" && quest.mode === "schreibplan") {
    recommended = closestAllowed(Math.min(recommended, 25), options);
  }

  if (quest.subject === "Mathe" && quest.taskType === "abi_training" && quest.difficulty === "hard") {
    recommended = closestAllowed(60, options);
  }

  if (quest.subject === "PB" && quest.outputType === "Urteil" && quest.difficulty === "hard") {
    recommended = closestAllowed(45, options);
  }

  return recommended;
}

export function normalizeQuestDuration<T extends Partial<Quest>>(quest: T): T & {
  durationMinutes: number;
  recommendedDurationMinutes: number;
  durationOptions: number[];
  timeCategory: TimeCategory;
} {
  if (quest.isCustom) {
    const selected = clampCustomDuration(Number(quest.durationMinutes) || 30);
    const recommended = recommendedDurationForQuest(quest);
    const options = [...new Set([recommended, ...customQuestQuickDurations, selected])].sort((a, b) => a - b);

    return {
      ...quest,
      durationMinutes: selected,
      recommendedDurationMinutes: recommended,
      durationOptions: options,
      timeCategory: categoryForDuration(selected),
    } as T & {
      durationMinutes: number;
      recommendedDurationMinutes: number;
      durationOptions: number[];
      timeCategory: TimeCategory;
    };
  }

  const options = durationOptionsForQuest(quest);
  const recommended = recommendedDurationForQuest(quest);
  const selected = options.includes(Number(quest.durationMinutes)) ? Number(quest.durationMinutes) : recommended;

  return {
    ...quest,
    durationMinutes: selected,
    recommendedDurationMinutes: recommended,
    durationOptions: options,
    timeCategory: categoryForDuration(selected),
  } as T & {
    durationMinutes: number;
    recommendedDurationMinutes: number;
    durationOptions: number[];
    timeCategory: TimeCategory;
  };
}
