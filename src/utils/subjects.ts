import type { Quest, Subject, SubjectId, SubjectPriority, SubjectPrioritySetting } from "../types";

export const priorityLabels: Record<SubjectPriority, string> = {
  high: "hoch",
  medium: "mittel",
  low: "niedrig",
  paused: "zurückgestellt",
};

export const subjectIdToName: Record<SubjectId, Subject> = {
  pb: "PB",
  deutsch: "Deutsch",
  mathe: "Mathe",
  physik: "Physik",
};

export const subjectNameToId: Record<Subject, SubjectId> = {
  PB: "pb",
  Deutsch: "deutsch",
  Mathe: "mathe",
  Physik: "physik",
};

export function inferQuestSubject(quest: Pick<Quest, "subject" | "category">): Subject | undefined {
  if (quest.subject) {
    return quest.subject;
  }

  const category = quest.category.toLowerCase();
  if (category.includes("pb") || category.includes("politik")) return "PB";
  if (category.includes("deutsch")) return "Deutsch";
  if (category.includes("mathe")) return "Mathe";
  if (category.includes("physik")) return "Physik";
  return undefined;
}

export function getSubjectFocusText(subjects: SubjectPrioritySetting[]) {
  const high = subjects.filter((subject) => subject.priority === "high").map((subject) => subject.label);
  const medium = subjects.filter((subject) => subject.priority === "medium").map((subject) => subject.label);
  const low = subjects
    .filter((subject) => subject.priority === "low" || subject.priority === "paused")
    .map((subject) => subject.label);

  return {
    focus: high.length > 0 ? high.join(", ") : "Noch kein Hauptfokus",
    secondary: medium.length > 0 ? medium.join(", ") : "Kein Sekundärfach",
    lower: low.length > 0 ? low.join(", ") : "Nichts zurückgestellt",
  };
}
