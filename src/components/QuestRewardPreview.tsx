import type { RewardResult } from "../types";

interface QuestRewardPreviewProps {
  reward: RewardResult;
  compact?: boolean;
}

export function QuestRewardPreview({ reward, compact = false }: QuestRewardPreviewProps) {
  return (
    <div className={`reward-preview ${compact ? "reward-preview--compact" : ""}`}>
      <span>+{reward.coins + reward.bonusCoins} Coins</span>
      <span>+{reward.xp} XP</span>
    </div>
  );
}
