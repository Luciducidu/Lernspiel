const extraTimeOptions = [5, 10, 15, 20];

interface ExtraTimePickerProps {
  extraTimeMinutes: number;
  onAddExtraTime: (minutes: number) => void;
}

export function ExtraTimePicker({ extraTimeMinutes, onAddExtraTime }: ExtraTimePickerProps) {
  return (
    <div className="extra-time-picker" aria-label="Extra-Zeit hinzufügen">
      <div>
        <strong>Extra-Zeit</strong>
        <span>{extraTimeMinutes > 0 ? `+${extraTimeMinutes} Minuten genutzt` : "Bei Bedarf verlängern"}</span>
      </div>
      <div className="extra-time-actions">
        {extraTimeOptions.map((minutes) => (
          <button className="extra-time-chip" type="button" key={minutes} onClick={() => onAddExtraTime(minutes)}>
            +{minutes}
          </button>
        ))}
      </div>
    </div>
  );
}
