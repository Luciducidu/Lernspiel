import type { SubjectPrioritySetting } from "../types";
import { getSubjectFocusText, priorityLabels } from "../utils/subjects";

export function SubjectPriorityCard({ subjects }: { subjects: SubjectPrioritySetting[] }) {
  const focus = getSubjectFocusText(subjects);

  return (
    <article className="subject-card">
      <span className="eyebrow">Fachfokus</span>
      <h3>Prioritäten</h3>
      <div className="subject-summary">
        <p><strong>Fokus:</strong> {focus.focus}</p>
        <p><strong>Sekundär:</strong> {focus.secondary}</p>
        <p><strong>Niedriger:</strong> {focus.lower}</p>
      </div>
      <div className="subject-chip-list">
        {subjects.map((subject) => (
          <span className={`subject-chip subject-chip--${subject.priority}`} key={subject.id}>
            {subject.label} · {priorityLabels[subject.priority]}
          </span>
        ))}
      </div>
    </article>
  );
}
