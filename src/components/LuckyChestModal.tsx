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
      <section className={`modal chest-modal chest-modal--${reward.tier}`} role="dialog" aria-modal="true" aria-labelledby="chest-title">
        <span className={`modal-rune modal-rune--${reward.tier}`}>{reward.tier} Chest</span>
        <h2 id="chest-title">{reward.title}</h2>
        <p>{reward.description}</p>
        <div className="chest-reward-grid">
          {reward.coins ? <strong><span>Coins</span>+{reward.coins}</strong> : null}
          {reward.gems ? <strong><span>Gems</span>+{reward.gems}</strong> : null}
          {reward.activity ? <strong><span>Aktivität</span>{reward.activity}</strong> : null}
          {reward.discountTokens ? <strong><span>Token</span>+{reward.discountTokens} Rabatt</strong> : null}
          {reward.streakProtectionTokens ? <strong><span>Schutz</span>+{reward.streakProtectionTokens} Streak</strong> : null}
          {reward.specialVouchers ? <strong><span>Voucher</span>+{reward.specialVouchers}</strong> : null}
        </div>
        <button ref={closeButtonRef} className="button button--primary" type="button" onClick={onClose}>
          Weiter
        </button>
      </section>
    </div>
  );
}
