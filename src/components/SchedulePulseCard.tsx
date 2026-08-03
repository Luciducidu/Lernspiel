import type { AppPage, WeeklySchedule } from "../types";
import { getBlocksForDay, getScheduleSummary, getTodayWeekday } from "../utils/weeklySchedule";
import { ProgressBar } from "./ProgressBar";

interface SchedulePulseCardProps {
  schedule?: WeeklySchedule;
  onNavigate: (page: AppPage) => void;
}

export function SchedulePulseCard({ schedule, onNavigate }: SchedulePulseCardProps) {
  const summary = getScheduleSummary(schedule);
  const todayBlocks = schedule ? getBlocksForDay(schedule, getTodayWeekday()).filter((block) => block.kind === "learning") : [];
  const nextBlock = todayBlocks.find((block) => block.status === "planned") ?? schedule?.blocks.find((block) => block.kind === "learning" && block.status === "planned");
  const scheduleLabel = schedule?.appMode === "brainworkout" ? "Produktivitaetsstundenplan" : "Abi-Stundenplan";

  return (
    <section className="schedule-pulse-card">
      <div>
        <span className="eyebrow">{schedule ? scheduleLabel : "Wochenstundenplan"}</span>
        {nextBlock ? <span className="schedule-pulse-card__time">Geplanter Zeitblock: {nextBlock.startTime} Uhr, {nextBlock.durationMinutes} Min.</span> : null}
        <h2>{schedule ? (nextBlock ? `Als Nächstes: ${nextBlock.title}` : "Diese Woche ist eingeordnet.") : "Plane deine Woche statt nur deinen Tag."}</h2>
        <p>
          {schedule
            ? `${summary.completed} erledigt, ${summary.pending} geplant und ${summary.feedbackDue} Feedbacks offen.`
            : "Lege Aufstehzeit, Termine und realistische Lernfenster fest. Danach reserviert die App passende Themenbloecke auf deiner Zeitachse."}
        </p>
      </div>
      <div className="schedule-pulse-card__side">
        {schedule ? <ProgressBar value={summary.completed} max={Math.max(summary.total, 1)} label={`${summary.completionRate}% erledigt`} /> : null}
        <button className="button button--primary" type="button" onClick={() => onNavigate("planning")}>
          {schedule ? "Stundenplan oeffnen" : "Woche planen"}
        </button>
      </div>
    </section>
  );
}
