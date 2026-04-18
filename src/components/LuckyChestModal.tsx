import type { ChestReward } from "../types";
import { useModalA11y } from "../hooks/useModalA11y";
import { getRewardIcon, getRewardValueText, rewardCategoryLabels, rewardRarityLabels } from "../utils/rewards";

interface LuckyChestModalProps {
  reward: ChestReward | null;
  rewardPool: ChestReward[];
  onClose: () => void;
}

export function LuckyChestModal({ reward, rewardPool, onClose }: LuckyChestModalProps) {
  const closeButtonRef = useModalA11y<HTMLButtonElement>(onClose);

  if (!reward) {
    return null;
  }

  const reelItems = [...rewardPool.slice(0, 8), reward, ...rewardPool.slice(0, 5), reward];

  return (
    <div className="modal-backdrop" role="presentation">
      <section className={`modal chest-modal chest-modal--${reward.tier}`} role="dialog" aria-modal="true" aria-labelledby="chest-title">
        <span className={`modal-rune modal-rune--${reward.tier}`}>{reward.tier} Chest</span>
        <h2 id="chest-title">Chest geöffnet</h2>

        <div className="chest-reel" aria-hidden="true">
          <div className="chest-reel__track">
            {reelItems.map((item, index) => (
              <span className={`chest-reel__item chest-reel__item--${item.rarity}`} key={`${item.title}-${index}`}>
                <span>{getRewardIcon(item)}</span>
                <small>{item.title}</small>
              </span>
            ))}
          </div>
          <div className="chest-reel__marker" />
        </div>

        <div className={`chest-result chest-result--${reward.rarity}`}>
          <span className="reward-icon reward-icon--large" aria-hidden="true">
            {getRewardIcon(reward)}
          </span>
          <div>
            <span className="reward-rarity">
              {rewardRarityLabels[reward.rarity]} · {rewardCategoryLabels[reward.category]}
            </span>
            <h3>{reward.title}</h3>
            <p>{reward.description}</p>
          </div>
        </div>

        <div className="chest-reward-grid">
          {reward.coins ? <strong><span>Coins</span>+{reward.coins}</strong> : null}
          {reward.gems ? <strong><span>Gems</span>+{reward.gems}</strong> : null}
          {reward.activity ? <strong><span>Aktivität</span>{reward.activity}</strong> : null}
          {reward.discountTokens ? <strong><span>Token</span>+{reward.discountTokens} Rabatt</strong> : null}
          {reward.streakProtectionTokens ? <strong><span>Schutz</span>+{reward.streakProtectionTokens} Streak</strong> : null}
          {reward.specialVouchers ? <strong><span>Voucher</span>+{reward.specialVouchers}</strong> : null}
        </div>

        <p className="chest-result-summary">{getRewardValueText(reward)} wurde deinem Fortschritt gutgeschrieben.</p>

        <button ref={closeButtonRef} className="button button--primary" type="button" onClick={onClose}>
          Weiter
        </button>
      </section>
    </div>
  );
}
