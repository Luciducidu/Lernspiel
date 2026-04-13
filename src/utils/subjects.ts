import type { SubjectPriority, SubjectPrioritySetting } from "../types";

export const priorityLabels: Record<SubjectPriority, string> = {
  high: "hoch",
  medium: "mittel",
  low: "niedrig",
  paused: "zurückgestellt",
};

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
