import { brainworkoutAreaLabels } from "../data/brainworkoutQuestPool";
import { subjectTopics } from "../data/questContent";
import type {
  AppMode,
  BrainworkoutAreaId,
  ScheduleBlockKind,
  Subject,
  SubjectPrioritySetting,
  WeekdayId,
  WeeklySchedule,
  WeeklyScheduleBlock,
  WeeklySchedulePreferences,
} from "../types";

export const weekdayOrder: WeekdayId[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const weekdayLabels: Record<WeekdayId, string> = {
  monday: "Montag",
  tuesday: "Dienstag",
  wednesday: "Mittwoch",
  thursday: "Donnerstag",
  friday: "Freitag",
  saturday: "Samstag",
  sunday: "Sonntag",
};

export const scheduleKindLabels: Record<ScheduleBlockKind, string> = {
  learning: "Lernblock",
  appointment: "Termin",
  obligation: "Pflicht",
  personal: "Privat",
  break: "Pause",
};

export interface ScheduleTopicBlock {
  title: string;
  description: string;
}

type AbiSubjectPriority = SubjectPrioritySetting & { label: Subject };

const defaultPreferences: WeeklySchedulePreferences = {
  wakeUpTime: "07:00",
  learningStartTime: "16:00",
  learningEndTime: "20:30",
  learningDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  plannedLearningBlocks: 5,
};

const durationSteps = [20, 25, 30, 35, 45, 60, 75, 90];

const brainworkoutAreas: BrainworkoutAreaId[] = [
  "math_first_semester",
  "physics_first_semester",
  "language_poetry_slam",
  "logic_puzzles",
  "chess_external",
  "driving_license",
  "housework_life",
];

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWeekRange(date = new Date()): { weekId: string; startDate: string; endDate: string } {
  const day = date.getDay() === 0 ? 7 : date.getDay();
  const start = new Date(date);
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const firstThursday = new Date(start);
  firstThursday.setDate(start.getDate() + 3);
  const firstDayOfYear = new Date(firstThursday.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((firstThursday.getTime() - firstDayOfYear.getTime()) / 86400000) + firstDayOfYear.getDay() + 1) / 7);

  return {
    weekId: `${firstThursday.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`,
    startDate: localDateKey(start),
    endDate: localDateKey(end),
  };
}

export function timeToMinutes(value: string): number {
  const [hour = "0", minute = "0"] = value.split(":");
  const total = Number(hour) * 60 + Number(minute);
  return Number.isFinite(total) ? Math.max(0, Math.min(total, 24 * 60 - 1)) : 0;
}

export function minutesToTime(minutes: number): string {
  const safeMinutes = Math.max(0, Math.min(Math.round(minutes / 5) * 5, 24 * 60 - 1));
  return `${String(Math.floor(safeMinutes / 60)).padStart(2, "0")}:${String(safeMinutes % 60).padStart(2, "0")}`;
}

function normalizeTime(value: unknown, fallback: string): string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : fallback;
}

function normalizeDay(value: unknown): WeekdayId {
  return weekdayOrder.includes(value as WeekdayId) ? (value as WeekdayId) : "monday";
}

function normalizeDuration(value: unknown, fallback = 30): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(5, Math.min(180, Math.round(parsed / 5) * 5));
}

export function createWeeklySchedule(
  range = getWeekRange(),
  appMode: AppMode = "abi",
  existing?: Partial<WeeklySchedule>,
): WeeklySchedule {
  const now = new Date().toISOString();
  return {
    id: existing?.id || crypto.randomUUID(),
    weekId: range.weekId,
    appMode,
    startDate: range.startDate,
    endDate: range.endDate,
    preferences: { ...defaultPreferences, ...existing?.preferences },
    blocks: Array.isArray(existing?.blocks) ? existing.blocks : [],
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
}

export function normalizeWeeklySchedule(value: unknown): WeeklySchedule | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Partial<WeeklySchedule>;
  if (!candidate.weekId || !candidate.startDate || !candidate.endDate) return null;
  const preferences = candidate.preferences && typeof candidate.preferences === "object" ? candidate.preferences : defaultPreferences;
  const learningDays = Array.isArray(preferences.learningDays)
    ? preferences.learningDays.filter((day): day is WeekdayId => weekdayOrder.includes(day))
    : defaultPreferences.learningDays;
  const now = new Date().toISOString();

  return {
    id: candidate.id || crypto.randomUUID(),
    weekId: candidate.weekId,
    appMode: candidate.appMode === "brainworkout" ? "brainworkout" : "abi",
    startDate: candidate.startDate,
    endDate: candidate.endDate,
    preferences: {
      wakeUpTime: normalizeTime(preferences.wakeUpTime, defaultPreferences.wakeUpTime),
      learningStartTime: normalizeTime(preferences.learningStartTime, defaultPreferences.learningStartTime),
      learningEndTime: normalizeTime(preferences.learningEndTime, defaultPreferences.learningEndTime),
      learningDays: learningDays.length > 0 ? learningDays : defaultPreferences.learningDays,
      plannedLearningBlocks: preferences.plannedLearningBlocks === 3 || preferences.plannedLearningBlocks === 7 ? preferences.plannedLearningBlocks : 5,
    },
    blocks: Array.isArray(candidate.blocks)
      ? (candidate.blocks as unknown[])
          .filter((block): block is Record<string, unknown> => typeof block === "object" && block !== null)
          .map((block) => {
            const raw = block as Partial<WeeklyScheduleBlock>;
            return {
              id: raw.id || crypto.randomUUID(),
              title: typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : "Unbenannter Block",
              day: normalizeDay(raw.day),
              startTime: normalizeTime(raw.startTime, "16:00"),
              durationMinutes: normalizeDuration(raw.durationMinutes),
              kind: ["learning", "appointment", "obligation", "personal", "break"].includes(raw.kind ?? "")
                ? (raw.kind as ScheduleBlockKind)
                : "personal",
              status: raw.status === "completed" || raw.status === "missed" ? raw.status : "planned",
              questId: typeof raw.questId === "string" ? raw.questId : undefined,
              description: typeof raw.description === "string" ? raw.description : undefined,
              feedback:
                raw.feedback && (raw.feedback.result === "completed" || raw.feedback.result === "missed") &&
                ["easy", "okay", "hard"].includes(raw.feedback.mood)
                  ? {
                      result: raw.feedback.result,
                      mood: raw.feedback.mood,
                      note: typeof raw.feedback.note === "string" ? raw.feedback.note : undefined,
                      submittedAt: raw.feedback.submittedAt || now,
                    }
                  : undefined,
              createdAt: raw.createdAt || now,
              updatedAt: raw.updatedAt || raw.createdAt || now,
            };
          })
      : [],
    createdAt: candidate.createdAt || now,
    updatedAt: candidate.updatedAt || candidate.createdAt || now,
  };
}

export function sortScheduleBlocks(blocks: WeeklyScheduleBlock[]): WeeklyScheduleBlock[] {
  return [...blocks].sort((left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime));
}

function overlaps(start: number, duration: number, blocks: WeeklyScheduleBlock[]): boolean {
  const end = start + duration;
  return blocks.some((block) => {
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = blockStart + block.durationMinutes;
    return start < blockEnd && end > blockStart;
  });
}

function firstFreeTime(
  blocks: WeeklyScheduleBlock[],
  start: number,
  end: number,
  duration: number,
): string | null {
  for (let cursor = start; cursor + duration <= end; cursor += 5) {
    if (!overlaps(cursor, duration, blocks)) return minutesToTime(cursor);
  }
  return null;
}

function priorityWeight(priority: SubjectPrioritySetting["priority"]): number {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return priority === "low" ? 1 : 0;
}

function weekOffset(weekId: string): number {
  return [...weekId].reduce((sum, character) => sum + character.charCodeAt(0), 0);
}

function buildAbiTopicBlocks(count: number, priorities: SubjectPrioritySetting[], weekId: string): ScheduleTopicBlock[] {
  const fallback: AbiSubjectPriority[] = [
    { id: "deutsch", label: "Deutsch", priority: "high" },
    { id: "pb", label: "PB", priority: "high" },
    { id: "mathe", label: "Mathe", priority: "high" },
  ];
  const configured: AbiSubjectPriority[] = priorities.filter((entry): entry is AbiSubjectPriority =>
    (entry.label === "PB" || entry.label === "Deutsch" || entry.label === "Mathe") && priorityWeight(entry.priority) > 0,
  );
  const sources: AbiSubjectPriority[] = configured.length > 0 ? configured : fallback;
  const allocated = new Map<Subject, number>();
  const blocks: ScheduleTopicBlock[] = [];
  let lastSubject: Subject | undefined;
  const offset = weekOffset(weekId);

  for (let index = 0; index < count; index += 1) {
    const ranked = [...sources].sort((left, right) => {
      const leftScore = (allocated.get(left.label) ?? 0) / priorityWeight(left.priority) + (lastSubject === left.label ? 10 : 0);
      const rightScore = (allocated.get(right.label) ?? 0) / priorityWeight(right.priority) + (lastSubject === right.label ? 10 : 0);
      return leftScore - rightScore || left.label.localeCompare(right.label);
    });
    const subject = ranked[0].label;
    const used = allocated.get(subject) ?? 0;
    const topics = subjectTopics[subject];
    const topic = topics[(offset + used) % topics.length];
    blocks.push({
      title: `${subject}: ${topic}`,
      description: `Fokusblock fuer ${topic}. Waehle im Block selbst eine passende Lernform.`,
    });
    allocated.set(subject, used + 1);
    lastSubject = subject;
  }

  return blocks;
}

function buildBrainworkoutTopicBlocks(count: number, weekId: string): ScheduleTopicBlock[] {
  const offset = weekOffset(weekId);
  return Array.from({ length: count }, (_, index) => {
    const area = brainworkoutAreas[(offset + index) % brainworkoutAreas.length];
    const label = brainworkoutAreaLabels[area];
    return {
      title: `Produktivitaet: ${label}`,
      description: `Ruhiger Fokusblock fuer ${label}. Kein Abi-Thema wird hier eingeplant.`,
    };
  });
}

function targetDuration(windowMinutes: number, blockCount: number, dayCount: number): number {
  const blocksPerDay = Math.max(1, Math.ceil(blockCount / Math.max(dayCount, 1)));
  const raw = Math.min(90, Math.max(20, Math.round((windowMinutes / (blocksPerDay + 0.5)) / 5) * 5));
  return durationSteps.reduce((best, value) => Math.abs(value - raw) < Math.abs(best - raw) ? value : best, durationSteps[0]);
}

function availableDuration(
  blocks: WeeklyScheduleBlock[],
  start: number,
  end: number,
  preferredDuration: number,
): { startTime: string; durationMinutes: number } | null {
  const candidates = durationSteps.filter((duration) => duration <= preferredDuration).sort((left, right) => right - left);
  for (const duration of candidates) {
    const startTime = firstFreeTime(blocks, start, end, duration);
    if (startTime) return { startTime, durationMinutes: duration };
  }
  return null;
}

export function generateLearningBlocks(
  schedule: WeeklySchedule,
  mode: AppMode,
  priorities: SubjectPrioritySetting[],
): WeeklySchedule {
  const now = new Date().toISOString();
  const preservedBlocks = schedule.blocks.filter((block) => block.kind !== "learning" || block.status !== "planned");
  const days = schedule.preferences.learningDays;
  const learningStart = Math.max(
    timeToMinutes(schedule.preferences.learningStartTime),
    timeToMinutes(schedule.preferences.wakeUpTime) + 45,
  );
  const learningEnd = timeToMinutes(schedule.preferences.learningEndTime);
  const windowMinutes = learningEnd - learningStart;
  if (days.length === 0 || windowMinutes < 20) {
    return { ...schedule, blocks: preservedBlocks, updatedAt: now };
  }

  const topics = mode === "abi"
    ? buildAbiTopicBlocks(schedule.preferences.plannedLearningBlocks, priorities, schedule.weekId)
    : buildBrainworkoutTopicBlocks(schedule.preferences.plannedLearningBlocks, schedule.weekId);
  const preferredDuration = targetDuration(windowMinutes, topics.length, days.length);
  const blocks = [...preservedBlocks];

  for (let index = 0; index < topics.length; index += 1) {
    const topic = topics[index];
    let placed = false;
    for (let offset = 0; offset < days.length; offset += 1) {
      const day = days[(index + offset) % days.length];
      const dayBlocks = blocks.filter((block) => block.day === day);
      const slot = availableDuration(dayBlocks, learningStart, learningEnd, preferredDuration);
      if (!slot) continue;
      blocks.push({
        id: crypto.randomUUID(),
        title: topic.title,
        day,
        startTime: slot.startTime,
        durationMinutes: slot.durationMinutes,
        kind: "learning",
        status: "planned",
        description: topic.description,
        createdAt: now,
        updatedAt: now,
      });
      placed = true;
      break;
    }
    if (!placed) break;
  }

  return { ...schedule, appMode: mode, blocks, updatedAt: now };
}

function dateKeyForWeekday(schedule: WeeklySchedule, day: WeekdayId): string {
  const date = new Date(`${schedule.startDate}T12:00:00`);
  date.setDate(date.getDate() + weekdayOrder.indexOf(day));
  return localDateKey(date);
}

export function getScheduleSummary(schedule?: WeeklySchedule) {
  const learningBlocks = schedule?.blocks.filter((block) => block.kind === "learning") ?? [];
  const completed = learningBlocks.filter((block) => block.status === "completed").length;
  const missed = learningBlocks.filter((block) => block.status === "missed").length;
  const pending = learningBlocks.filter((block) => block.status === "planned").length;
  const now = new Date();
  const feedbackDue = schedule
    ? learningBlocks.filter((block) => {
        if (block.status !== "planned") return false;
        const dateKey = dateKeyForWeekday(schedule, block.day);
        return new Date(`${dateKey}T${block.startTime}:00`).getTime() <= now.getTime();
      }).length
    : 0;

  return {
    total: learningBlocks.length,
    completed,
    missed,
    pending,
    feedbackDue,
    completionRate: learningBlocks.length > 0 ? Math.round((completed / learningBlocks.length) * 100) : 0,
  };
}

export function getBlocksForDay(schedule: WeeklySchedule, day: WeekdayId): WeeklyScheduleBlock[] {
  return sortScheduleBlocks(schedule.blocks.filter((block) => block.day === day));
}

export function getTodayWeekday(): WeekdayId {
  const index = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  return weekdayOrder[index];
}

export function getScheduleTimeRange(schedule: WeeklySchedule): { startMinutes: number; endMinutes: number } {
  const blockStarts = schedule.blocks.map((block) => timeToMinutes(block.startTime));
  const blockEnds = schedule.blocks.map((block) => timeToMinutes(block.startTime) + block.durationMinutes);
  const currentMinute = getCurrentTimeMinutes(schedule);
  const visibleMoments = currentMinute === null ? [] : [currentMinute];
  const earliest = Math.min(
    timeToMinutes(schedule.preferences.wakeUpTime),
    ...blockStarts,
    timeToMinutes(schedule.preferences.learningStartTime),
    ...visibleMoments,
  );
  const latest = Math.max(timeToMinutes(schedule.preferences.learningEndTime), ...blockEnds, ...visibleMoments);
  const startMinutes = Math.max(5 * 60, Math.floor(earliest / 60) * 60);
  const endMinutes = Math.min(23 * 60, Math.max(startMinutes + 60, Math.ceil((latest + 30) / 60) * 60));
  return { startMinutes, endMinutes };
}

export function getCurrentTimeMinutes(schedule: WeeklySchedule): number | null {
  const now = new Date();
  const currentDate = localDateKey(now);
  if (currentDate < schedule.startDate || currentDate > schedule.endDate) return null;
  return now.getHours() * 60 + now.getMinutes();
}
