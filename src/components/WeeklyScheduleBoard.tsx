import { type DragEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import type {
  AppMode,
  ScheduleBlockKind,
  ScheduleFeedbackMood,
  SubjectPrioritySetting,
  WeekdayId,
  WeeklySchedule,
  WeeklyScheduleBlock,
} from "../types";
import {
  createWeeklySchedule,
  generateLearningBlocks,
  getBlocksForDay,
  getCurrentTimeMinutes,
  getScheduleSummary,
  getScheduleTimeRange,
  getTodayWeekday,
  minutesToTime,
  scheduleKindLabels,
  timeToMinutes,
  weekdayLabels,
  weekdayOrder,
} from "../utils/weeklySchedule";
import { ProgressBar } from "./ProgressBar";

interface WeeklyScheduleBoardProps {
  activeMode: AppMode;
  subjects: SubjectPrioritySetting[];
  schedule?: WeeklySchedule;
  onSave: (schedule: WeeklySchedule) => void;
}

interface BlockDraft {
  title: string;
  day: WeekdayId;
  startTime: string;
  durationMinutes: number;
  kind: ScheduleBlockKind;
  description: string;
}

const emptyBlockDraft: BlockDraft = {
  title: "",
  day: "monday",
  startTime: "16:00",
  durationMinutes: 30,
  kind: "appointment",
  description: "",
};

const feedbackMoodLabels: Record<ScheduleFeedbackMood, string> = {
  easy: "Leicht",
  okay: "Okay",
  hard: "Schwierig",
};

const calendarHourHeight = 88;

function getBlockDraft(block: WeeklyScheduleBlock): BlockDraft {
  return {
    title: block.title,
    day: block.day,
    startTime: block.startTime,
    durationMinutes: block.durationMinutes,
    kind: block.kind,
    description: block.description ?? "",
  };
}

function statusLabel(block: WeeklyScheduleBlock): string {
  if (block.status === "completed") return "Erledigt";
  if (block.status === "missed") return "Nicht erledigt";
  return "Geplant";
}

function modeHeading(mode: AppMode): string {
  return mode === "abi" ? "Abi-Woche" : "Produktivitaetswoche";
}

export function WeeklyScheduleBoard({ activeMode, subjects, schedule, onSave }: WeeklyScheduleBoardProps) {
  const [draft, setDraft] = useState<WeeklySchedule>(() => schedule ?? createWeeklySchedule(undefined, activeMode));
  const [newBlock, setNewBlock] = useState<BlockDraft>(emptyBlockDraft);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<BlockDraft>(emptyBlockDraft);
  const [feedbackBlockId, setFeedbackBlockId] = useState<string | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<"completed" | "missed" | null>(null);
  const [feedbackMood, setFeedbackMood] = useState<ScheduleFeedbackMood | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    setDraft(schedule ?? createWeeklySchedule(undefined, activeMode));
  }, [activeMode, schedule?.id, schedule?.updatedAt]);

  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const summary = useMemo(() => getScheduleSummary(draft), [draft]);
  const editingBlock = draft.blocks.find((block) => block.id === editingBlockId) ?? null;
  const feedbackBlock = draft.blocks.find((block) => block.id === feedbackBlockId) ?? null;
  const timeRange = getScheduleTimeRange(draft);
  const hourCount = Math.max(1, (timeRange.endMinutes - timeRange.startMinutes) / 60);
  const calendarHeight = hourCount * calendarHourHeight;
  const hours = Array.from({ length: hourCount + 1 }, (_, index) => timeRange.startMinutes + index * 60);
  const currentMinute = useMemo(() => {
    void clock;
    return getCurrentTimeMinutes(draft);
  }, [clock, draft]);

  function save(next: WeeklySchedule) {
    const persisted = { ...next, appMode: activeMode, updatedAt: new Date().toISOString() };
    setDraft(persisted);
    onSave(persisted);
  }

  function updatePreferences<K extends keyof WeeklySchedule["preferences"]>(key: K, value: WeeklySchedule["preferences"][K]) {
    setDraft((current) => ({
      ...current,
      preferences: { ...current.preferences, [key]: value },
    }));
  }

  function toggleLearningDay(day: WeekdayId) {
    setDraft((current) => {
      const learningDays = current.preferences.learningDays.includes(day)
        ? current.preferences.learningDays.filter((entry) => entry !== day)
        : [...current.preferences.learningDays, day].sort((left, right) => weekdayOrder.indexOf(left) - weekdayOrder.indexOf(right));
      return {
        ...current,
        preferences: {
          ...current.preferences,
          learningDays: learningDays.length > 0 ? learningDays : current.preferences.learningDays,
        },
      };
    });
  }

  function regenerateLearningBlocks() {
    if (timeToMinutes(draft.preferences.learningEndTime) <= timeToMinutes(draft.preferences.learningStartTime)) {
      setNotice("Die Lernzeit muss nach dem Lernstart liegen.");
      return;
    }
    setNotice("Der Plan wurde aus deinem Zeitfenster, den Terminen und den aktuellen Prioritaeten erstellt.");
    save(generateLearningBlocks(draft, activeMode, subjects));
  }

  function handleAddBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newBlock.title.trim()) return;
    const now = new Date().toISOString();
    save({
      ...draft,
      blocks: [
        ...draft.blocks,
        {
          id: crypto.randomUUID(),
          title: newBlock.title.trim(),
          day: newBlock.day,
          startTime: newBlock.startTime,
          durationMinutes: Math.max(5, Math.min(180, Math.round(newBlock.durationMinutes / 5) * 5)),
          kind: newBlock.kind,
          status: "planned",
          description: newBlock.description.trim() || undefined,
          createdAt: now,
          updatedAt: now,
        },
      ],
    });
    setNotice("Zeitblock gespeichert. Beim naechsten Generieren wird er beruecksichtigt.");
    setNewBlock({ ...emptyBlockDraft, day: newBlock.day, startTime: newBlock.startTime });
  }

  function openEdit(block: WeeklyScheduleBlock) {
    setEditingBlockId(block.id);
    setEditingDraft(getBlockDraft(block));
  }

  function saveBlockEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingBlock || !editingDraft.title.trim()) return;
    const now = new Date().toISOString();
    save({
      ...draft,
      blocks: draft.blocks.map((block) =>
        block.id === editingBlock.id
          ? {
              ...block,
              ...editingDraft,
              title: editingDraft.title.trim(),
              description: editingDraft.description.trim() || undefined,
              durationMinutes: Math.max(5, Math.min(180, Math.round(editingDraft.durationMinutes / 5) * 5)),
              updatedAt: now,
            }
          : block,
      ),
    });
    setEditingBlockId(null);
  }

  function removeBlock(blockId: string) {
    const block = draft.blocks.find((entry) => entry.id === blockId);
    if (!block || !window.confirm(`"${block.title}" wirklich aus dem Stundenplan entfernen?`)) return;
    save({ ...draft, blocks: draft.blocks.filter((entry) => entry.id !== blockId) });
    setEditingBlockId(null);
  }

  function openFeedback(block: WeeklyScheduleBlock) {
    setFeedbackBlockId(block.id);
    setFeedbackResult(block.feedback?.result ?? null);
    setFeedbackMood(block.feedback?.mood ?? null);
    setFeedbackNote(block.feedback?.note ?? "");
  }

  function saveFeedback() {
    if (!feedbackBlock || !feedbackResult || !feedbackMood) return;
    const now = new Date().toISOString();
    save({
      ...draft,
      blocks: draft.blocks.map((block) =>
        block.id === feedbackBlock.id
          ? {
              ...block,
              status: feedbackResult,
              feedback: {
                result: feedbackResult,
                mood: feedbackMood,
                note: feedbackNote.trim() || undefined,
                submittedAt: now,
              },
              updatedAt: now,
            }
          : block,
      ),
    });
    setFeedbackBlockId(null);
  }

  function moveBlock(blockId: string, day: WeekdayId, startTime?: string) {
    save({
      ...draft,
      blocks: draft.blocks.map((entry) =>
        entry.id === blockId
          ? { ...entry, day, startTime: startTime ?? entry.startTime, updatedAt: new Date().toISOString() }
          : entry,
      ),
    });
  }

  function handleDrop(event: DragEvent<HTMLElement>, day: WeekdayId) {
    event.preventDefault();
    const block = draft.blocks.find((entry) => entry.id === draggedBlockId);
    if (!block) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeMinutes = ((event.clientY - rect.top) / calendarHourHeight) * 60 + timeRange.startMinutes;
    const latestStart = timeRange.endMinutes - block.durationMinutes;
    const nextMinutes = Math.max(timeRange.startMinutes, Math.min(latestStart, Math.round(relativeMinutes / 5) * 5));
    moveBlock(block.id, day, minutesToTime(nextMinutes));
    setDraggedBlockId(null);
  }

  const today = getTodayWeekday();

  return (
    <div className="weekly-schedule-stack">
      <section className="content-card schedule-hero-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{modeHeading(activeMode)}</span>
            <h2>Deine Woche auf einer echten Zeitachse.</h2>
          </div>
          <span className="schedule-week-label">{draft.startDate} bis {draft.endDate}</span>
        </div>
        <p>
          Termine blockieren Zeit. Der Generator plant danach thematische Fokusfenster aus deinem angegebenen Lernrahmen und trennt Abi klar von Produktivitaet.
        </p>
        <div className="schedule-summary-grid">
          <div className="schedule-stat schedule-stat--planned"><span>Geplant</span><strong>{summary.pending}</strong></div>
          <div className="schedule-stat schedule-stat--done"><span>Erledigt</span><strong>{summary.completed}</strong></div>
          <div className="schedule-stat schedule-stat--missed"><span>Nicht erledigt</span><strong>{summary.missed}</strong></div>
          <div className="schedule-stat schedule-stat--feedback"><span>Feedback offen</span><strong>{summary.feedbackDue}</strong></div>
        </div>
        <ProgressBar value={summary.completed} max={Math.max(summary.total, 1)} label={`Wochenfortschritt: ${summary.completionRate}%`} />
      </section>

      <section className="content-card schedule-setup-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Dein Wochenrahmen</span>
            <h2>Wann ist realistisch Zeit?</h2>
          </div>
          <button className="button button--primary" type="button" onClick={regenerateLearningBlocks}>Plan aus Zeiten erstellen</button>
        </div>
        <div className="schedule-settings-grid">
          <label>
            Aufstehzeit
            <input type="time" value={draft.preferences.wakeUpTime} onChange={(event) => updatePreferences("wakeUpTime", event.target.value)} />
          </label>
          <label>
            Lernzeit ab
            <input type="time" value={draft.preferences.learningStartTime} onChange={(event) => updatePreferences("learningStartTime", event.target.value)} />
          </label>
          <label>
            Lernzeit bis
            <input type="time" value={draft.preferences.learningEndTime} onChange={(event) => updatePreferences("learningEndTime", event.target.value)} />
          </label>
          <label>
            Themenbloecke diese Woche
            <select
              value={draft.preferences.plannedLearningBlocks}
              onChange={(event) => updatePreferences("plannedLearningBlocks", Number(event.target.value) as 3 | 5 | 7)}
            >
              <option value={3}>3 ruhige Bloecke</option>
              <option value={5}>5 normale Bloecke</option>
              <option value={7}>7 intensive Bloecke</option>
            </select>
          </label>
        </div>
        <div className="schedule-day-picker" aria-label="Lerntage auswaehlen">
          {weekdayOrder.map((day) => (
            <button
              className={draft.preferences.learningDays.includes(day) ? "schedule-day-toggle schedule-day-toggle--active" : "schedule-day-toggle"}
              key={day}
              type="button"
              onClick={() => toggleLearningDay(day)}
              aria-pressed={draft.preferences.learningDays.includes(day)}
            >
              {weekdayLabels[day].slice(0, 2)}
            </button>
          ))}
        </div>
        <p className="schedule-hint">Abi nutzt PB, Deutsch und Mathe nach deinen Prioritaeten. Produktivitaet erzeugt ausschliesslich Produktivitaetsbereiche.</p>
        {notice ? <p className="schedule-notice" role="status">{notice}</p> : null}
      </section>

      <section className="content-card schedule-add-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Zeit reservieren</span>
            <h2>Termin, Pflicht oder Freiraum</h2>
          </div>
        </div>
        <form className="schedule-add-form" onSubmit={handleAddBlock}>
          <label className="schedule-add-form__wide">
            Titel
            <input value={newBlock.title} onChange={(event) => setNewBlock({ ...newBlock, title: event.target.value })} placeholder="z. B. Sport, Arzttermin oder Familie" />
          </label>
          <label>
            Art
            <select value={newBlock.kind} onChange={(event) => setNewBlock({ ...newBlock, kind: event.target.value as ScheduleBlockKind })}>
              <option value="appointment">Termin</option>
              <option value="obligation">Pflicht</option>
              <option value="personal">Privat</option>
              <option value="break">Pause</option>
              <option value="learning">Eigener Fokusblock</option>
            </select>
          </label>
          <label>
            Tag
            <select value={newBlock.day} onChange={(event) => setNewBlock({ ...newBlock, day: event.target.value as WeekdayId })}>
              {weekdayOrder.map((day) => <option key={day} value={day}>{weekdayLabels[day]}</option>)}
            </select>
          </label>
          <label>
            Beginn
            <input type="time" value={newBlock.startTime} onChange={(event) => setNewBlock({ ...newBlock, startTime: event.target.value })} />
          </label>
          <label>
            Dauer
            <select value={newBlock.durationMinutes} onChange={(event) => setNewBlock({ ...newBlock, durationMinutes: Number(event.target.value) })}>
              {[15, 30, 45, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{minutes} Minuten</option>)}
            </select>
          </label>
          <label className="schedule-add-form__wide">
            Hinweis (optional)
            <input value={newBlock.description} onChange={(event) => setNewBlock({ ...newBlock, description: event.target.value })} placeholder="Was muss bei diesem Block beachtet werden?" />
          </label>
          <button className="button button--ghost schedule-add-form__wide" type="submit">Zeitblock hinzufuegen</button>
        </form>
      </section>

      <section className="content-card schedule-board-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Kalenderansicht</span>
            <h2>Verschieben direkt auf der Zeitachse</h2>
          </div>
          <span className="schedule-drag-hint">Die helle Linie zeigt die aktuelle Uhrzeit.</span>
        </div>
        <div className="schedule-calendar-scroll">
          <div className="schedule-calendar">
            <aside className="schedule-time-axis">
              <div className="schedule-lane-header">Zeit</div>
              <div className="schedule-time-axis__body" style={{ height: `${calendarHeight}px` }}>
                {hours.map((minute) => <span key={minute} style={{ top: `${((minute - timeRange.startMinutes) / 60) * calendarHourHeight}px` }}>{minutesToTime(minute)}</span>)}
              </div>
            </aside>
            {weekdayOrder.map((day) => {
              const blocks = getBlocksForDay(draft, day);
              return (
                <section className={`schedule-calendar-lane ${day === today ? "schedule-calendar-lane--today" : ""}`} key={day}>
                  <header className="schedule-lane-header"><strong>{weekdayLabels[day]}</strong>{day === today ? <span>Heute</span> : null}</header>
                  <div
                    className="schedule-lane-body"
                    style={{ height: `${calendarHeight}px` }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(event, day)}
                  >
                    {hours.slice(0, -1).map((minute) => <span className="schedule-hour-line" key={minute} style={{ top: `${((minute - timeRange.startMinutes) / 60) * calendarHourHeight}px` }} />)}
                    {currentMinute !== null && day === today && currentMinute >= timeRange.startMinutes && currentMinute <= timeRange.endMinutes ? (
                      <span className="schedule-now-line" style={{ top: `${((currentMinute - timeRange.startMinutes) / 60) * calendarHourHeight}px` }}><i /></span>
                    ) : null}
                    {blocks.map((block) => {
                      const top = ((timeToMinutes(block.startTime) - timeRange.startMinutes) / 60) * calendarHourHeight;
                      const height = Math.max(42, (block.durationMinutes / 60) * calendarHourHeight);
                      return (
                        <article
                          className={`schedule-calendar-event schedule-calendar-event--${block.kind} schedule-calendar-event--${block.status}`}
                          draggable
                          key={block.id}
                          style={{ top: `${top}px`, height: `${height}px` }}
                          onDragStart={() => setDraggedBlockId(block.id)}
                          onDragEnd={() => setDraggedBlockId(null)}
                        >
                          <div className="schedule-calendar-event__meta"><span>{block.startTime}</span><span>{block.durationMinutes} Min</span></div>
                          <strong>{block.title}</strong>
                          <small>{scheduleKindLabels[block.kind]}</small>
                          <div className="schedule-calendar-event__actions">
                            {block.kind === "learning" ? <button className="button button--small button--primary" type="button" onClick={() => openFeedback(block)}>{block.status === "planned" ? "Auswerten" : "Feedback"}</button> : null}
                            <button className="button button--small button--ghost" type="button" onClick={() => openEdit(block)}>Bearbeiten</button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="content-card schedule-review-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Wochenrueckblick</span>
            <h2>Was ist aufgegangen?</h2>
          </div>
          <span className="schedule-drag-hint">Gruen = erledigt, Rot = nicht erledigt</span>
        </div>
        <div className="schedule-week-review-grid">
          {weekdayOrder.map((day) => {
            const learningBlocks = getBlocksForDay(draft, day).filter((block) => block.kind === "learning");
            const completed = learningBlocks.filter((block) => block.status === "completed").length;
            const missed = learningBlocks.filter((block) => block.status === "missed").length;
            const planned = learningBlocks.filter((block) => block.status === "planned").length;
            const tone = missed > 0 ? "missed" : completed > 0 ? "done" : "planned";
            return <article className={`schedule-review-day schedule-review-day--${tone}`} key={day}><strong>{weekdayLabels[day]}</strong>{learningBlocks.length === 0 ? <span>Kein Fokusblock</span> : null}{completed > 0 ? <span className="schedule-review-day__done">{completed} erledigt</span> : null}{missed > 0 ? <span className="schedule-review-day__missed">{missed} nicht erledigt</span> : null}{planned > 0 ? <span className="schedule-review-day__planned">{planned} offen</span> : null}</article>;
          })}
        </div>
      </section>

      {editingBlock ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal schedule-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-edit-heading">
            <span className="eyebrow">Zeitblock anpassen</span>
            <h2 id="schedule-edit-heading">{editingBlock.title}</h2>
            <form className="quest-form" onSubmit={saveBlockEdit}>
              <label className="quest-form__wide">Titel<input value={editingDraft.title} onChange={(event) => setEditingDraft({ ...editingDraft, title: event.target.value })} /></label>
              <label>Art<select value={editingDraft.kind} onChange={(event) => setEditingDraft({ ...editingDraft, kind: event.target.value as ScheduleBlockKind })}>{Object.entries(scheduleKindLabels).map(([kind, label]) => <option key={kind} value={kind}>{label}</option>)}</select></label>
              <label>Tag<select value={editingDraft.day} onChange={(event) => setEditingDraft({ ...editingDraft, day: event.target.value as WeekdayId })}>{weekdayOrder.map((day) => <option key={day} value={day}>{weekdayLabels[day]}</option>)}</select></label>
              <label>Beginn<input type="time" value={editingDraft.startTime} onChange={(event) => setEditingDraft({ ...editingDraft, startTime: event.target.value })} /></label>
              <label>Dauer<select value={editingDraft.durationMinutes} onChange={(event) => setEditingDraft({ ...editingDraft, durationMinutes: Number(event.target.value) })}>{[15, 30, 45, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{minutes} Minuten</option>)}</select></label>
              <label className="quest-form__wide">Hinweis<input value={editingDraft.description} onChange={(event) => setEditingDraft({ ...editingDraft, description: event.target.value })} /></label>
              <div className="modal-actions quest-form__wide"><button className="button button--ghost" type="button" onClick={() => removeBlock(editingBlock.id)}>Entfernen</button><button className="button button--ghost" type="button" onClick={() => setEditingBlockId(null)}>Abbrechen</button><button className="button button--primary" type="submit">Aenderungen speichern</button></div>
            </form>
          </section>
        </div>
      ) : null}

      {feedbackBlock ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal schedule-feedback-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-feedback-heading">
            <span className="eyebrow">Pflicht-Feedback</span>
            <h2 id="schedule-feedback-heading">Wie lief "{feedbackBlock.title}"?</h2>
            <p>Damit der Wochenrueckblick ehrlich bleibt, braucht jeder Fokusblock einen Ergebnis- und Stimmungswert.</p>
            <div className="feedback-choice-grid" aria-label="Ergebnis waehlen"><button className={feedbackResult === "completed" ? "feedback-choice feedback-choice--done feedback-choice--active" : "feedback-choice feedback-choice--done"} type="button" onClick={() => setFeedbackResult("completed")}>Erledigt</button><button className={feedbackResult === "missed" ? "feedback-choice feedback-choice--missed feedback-choice--active" : "feedback-choice feedback-choice--missed"} type="button" onClick={() => setFeedbackResult("missed")}>Nicht erledigt</button></div>
            <div className="feedback-choice-grid feedback-choice-grid--mood" aria-label="Gefuehl waehlen">{(Object.keys(feedbackMoodLabels) as ScheduleFeedbackMood[]).map((mood) => <button className={feedbackMood === mood ? "feedback-choice feedback-choice--mood feedback-choice--active" : "feedback-choice feedback-choice--mood"} key={mood} type="button" onClick={() => setFeedbackMood(mood)}>{feedbackMoodLabels[mood]}</button>)}</div>
            <label className="schedule-feedback-note">Kurze Notiz (optional)<textarea value={feedbackNote} onChange={(event) => setFeedbackNote(event.target.value)} placeholder="Was hat geholfen oder gestoert?" /></label>
            <div className="modal-actions"><button className="button button--ghost" type="button" onClick={() => setFeedbackBlockId(null)}>Noch nicht</button><button className="button button--primary" type="button" disabled={!feedbackResult || !feedbackMood} onClick={saveFeedback}>Feedback speichern</button></div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
