import type { SubjectPriority, SubjectPrioritySetting } from "../types";
import { priorityLabels } from "../utils/subjects";

interface SettingsPanelProps {
  subjects: SubjectPrioritySetting[];
  onChangePriority: (id: SubjectPrioritySetting["id"], priority: SubjectPriority) => void;
}

export function SettingsPanel({ subjects, onChangePriority }: SettingsPanelProps) {
  return (
    <section className="settings-panel">
      <div className="section-heading">
        <span className="eyebrow">Einstellungen</span>
        <h2>Fach-Priorisierung</h2>
      </div>
      <p className="section-copy">
        Lege fest, welche Fächer aktuell im Vordergrund stehen. Die Einstellung wird gespeichert und im Dashboard sichtbar,
        ohne Quest-Inhalte zu verändern.
      </p>
      <div className="settings-list">
        {subjects.map((subject) => (
          <label className="settings-row" key={subject.id}>
            <span>
              <strong>{subject.label}</strong>
              {subject.id === "pb" ? <small>bereit für große Oberbereiche wie Demokratie, EU, Wirtschaft und Methodik</small> : null}
              {subject.id === "deutsch" ? <small>erste Klausur: aktuell hoch priorisieren</small> : null}
              {subject.id === "physik" ? <small>aktuell sehr niedrig priorisiert oder zurückgestellt</small> : null}
            </span>
            <select value={subject.priority} onChange={(event) => onChangePriority(subject.id, event.target.value as SubjectPriority)}>
              {(Object.keys(priorityLabels) as SubjectPriority[]).map((priority) => (
                <option value={priority} key={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
