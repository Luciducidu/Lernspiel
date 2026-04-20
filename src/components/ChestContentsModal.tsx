import type { ChestReward, ChestTier } from "../types";
import { useModalA11y } from "../hooks/useModalA11y";
import { getRewardIcon, getRewardValueText, rewardCategoryLabels, rewardRarityLabels } from "../utils/rewards";

interface ChestContentsModalProps {
  tier: ChestTier | null;
  rewards: ChestReward[];
  onClose: () => void;
}

export function ChestContentsModal({ tier, rewards, onClose }: ChestContentsModalProps) {
  const closeButtonRef = useModalA11y<HTMLButtonElement>(onClose);

  if (!tier) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className={`modal chest-preview-modal chest-modal--${tier}`} role="dialog" aria-modal="true" aria-labelledby="chest-preview-title">
        <span className={`modal-rune modal-rune--${tier}`}>{tier} Chest</span>
        <h2 id="chest-preview-title">Mögliche Inhalte</h2>
        <p>Diese Rewards können in der Chest erscheinen. Exakte Wahrscheinlichkeiten bleiben spielerisch verborgen, aber die möglichen Inhalte sind transparent.</p>

        <div className="chest-preview-list">
          {rewards.map((reward) => (
            <article className={`chest-preview-item chest-preview-item--${reward.rarity}`} key={reward.id}>
              <span className="reward-icon" aria-hidden="true">{getRewardIcon(reward)}</span>
              <div>
                <strong>{reward.title}</strong>
                <small>
                  {rewardCategoryLabels[reward.category]} · {rewardRarityLabels[reward.rarity]} · {getRewardValueText(reward)} · Wert ca.{" "}
                  {reward.internalCoinValue} Coins
                </small>
              </div>
            </article>
          ))}
        </div>

        <button ref={closeButtonRef} className="button button--primary" type="button" onClick={onClose}>
          Verstanden
        </button>
      </section>
    </div>
  );
}
