import { useEffect, useState } from "react";

interface RewardCountUpProps {
  label: string;
  value: number;
  suffix?: string;
}

export function RewardCountUp({ label, value, suffix = "" }: RewardCountUpProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const durationMs = 650;
    const startedAt = performance.now();
    let frameId = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <strong className="reward-count-up">
      <span>{label}</span>+{displayValue}
      {suffix}
    </strong>
  );
}
