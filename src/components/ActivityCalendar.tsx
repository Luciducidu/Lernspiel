import { useState } from "react";
import type { CalendarActivityDay, UserProgress } from "../types";
import { buildActivitySummary, buildCalendarActivity } from "../utils/activity";

interface ActivityCalendarProps {
  progress: UserProgress;
}

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function ActivityCalendar({ progress }: ActivityCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<CalendarActivityDay | undefined>();
  const days = buildCalendarActivity(progress);
  const summary = buildActivitySummary(progress, selectedDay);
  const monthLabel = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(new Date());

  return (
    <section className="content-card activity-calendar-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Kalender</span>
          <h2>Lernaktivität im {monthLabel}</h2>
        </div>
      </div>

      <div className="calendar-summary-grid">
        <span>{summary.activeDaysLast30} aktive Tage in 30 Tagen</span>
        <span>{summary.currentMonthFocusMinutes} Min diesen Monat</span>
        <span>Beste Woche: {summary.bestWeekFocusMinutes} Min</span>
      </div>

      <div className="activity-calendar" role="grid" aria-label="Lernkalender">
        {weekdayLabels.map((label) => (
          <span className="calendar-weekday" key={label}>
            {label}
          </span>
        ))}
        {days.map((day) => (
          <button
            className={[
              "calendar-day",
              `calendar-day--level-${day.intensity}`,
              day.isToday ? "calendar-day--today" : "",
              !day.isCurrentMonth ? "calendar-day--muted" : "",
              selectedDay?.dateKey === day.dateKey ? "calendar-day--selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={day.dateKey}
            type="button"
            onClick={() => setSelectedDay(day)}
            aria-label={`${day.dateKey}: ${day.questCount} Quests, ${day.focusMinutes} Minuten Fokus`}
          >
            {day.dayOfMonth}
          </button>
        ))}
      </div>

      <div className="calendar-detail">
        {selectedDay ? (
          <>
            <strong>{selectedDay.dateKey}</strong>
            <span>{selectedDay.questCount} Quests</span>
            <span>{selectedDay.focusMinutes} Min Fokus</span>
            <span>{selectedDay.coinsEarned} Coins verdient</span>
          </>
        ) : (
          <span>Wähle einen Tag aus, um Details zu sehen.</span>
        )}
      </div>
    </section>
  );
}
