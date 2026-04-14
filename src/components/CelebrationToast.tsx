export interface CelebrationToastData {
  id: string;
  tone: "success" | "level" | "reward" | "info";
  title: string;
  message: string;
  rewards?: string[];
}

interface CelebrationToastProps {
  celebration: CelebrationToastData | null;
  onClose: () => void;
}

export function CelebrationToast({ celebration, onClose }: CelebrationToastProps) {
  if (!celebration) {
    return null;
  }

  return (
    <aside className={`celebration-toast celebration-toast--${celebration.tone}`} aria-live="polite">
      <div>
        <span className="celebration-toast__label">
          {celebration.tone === "level" ? "Level-Up" : celebration.tone === "reward" ? "Reward" : "Erfolg"}
        </span>
        <h3>{celebration.title}</h3>
        <p>{celebration.message}</p>
        {celebration.rewards && celebration.rewards.length > 0 ? (
          <div className="celebration-toast__rewards">
            {celebration.rewards.map((reward) => (
              <strong key={reward}>{reward}</strong>
            ))}
          </div>
        ) : null}
      </div>
      <button className="celebration-toast__close" type="button" onClick={onClose} aria-label="Feedback schließen">
        Schließen
      </button>
    </aside>
  );
}
