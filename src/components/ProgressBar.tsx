interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="progress">
      <div className="progress__meta">
        <span>{label}</span>
        <strong>
          {value} / {max}
        </strong>
      </div>
      <div className="progress__track" aria-label={label}>
        <div className="progress__fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
