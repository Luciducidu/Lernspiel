import type { ChestReward } from "../types";
import { useModalA11y } from "../hooks/useModalA11y";

interface LuckyChestModalProps {
  reward: ChestReward | null;
  onClose: () => void;
}

export function LuckyChestModal({ reward, onClose }: LuckyChestModalProps) {
  const closeButtonRef = useModalA11y<HTMLButtonElement>(onClose);

  if (!reward) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal chest-modal" role="dialog" aria-modal="true" aria-labelledby="chest-title">
        <span className={`modal-rune modal-rune--${reward.tier}`}>{reward.tier} Chest</span>
        <h2 id="chest-title">{reward.title}</h2>
        <p>{reward.description}</p>
        {reward.coins ? <strong>+{reward.coins} Coins</strong> : null}
        {reward.gems ? <strong>+{reward.gems} {reward.gems === 1 ? "Gem" : "Gems"}</strong> : null}
        {reward.activity ? <strong>{reward.activity}</strong> : null}
        {reward.discountTokens ? <strong>+{reward.discountTokens} Rabatt-Token</strong> : null}
        {reward.streakProtectionTokens ? <strong>+{reward.streakProtectionTokens} Streak-Schutz</strong> : null}
        {reward.specialVouchers ? <strong>+{reward.specialVouchers} Spezialgutschein</strong> : null}
        <button ref={closeButtonRef} className="button button--primary" type="button" onClick={onClose}>
          Weiter
        </button>
      </section>
    </div>
  );
}
