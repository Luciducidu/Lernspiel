import type { ShopItem } from "../types";

interface ShopItemCardProps {
  item: ShopItem;
  coins: number;
  level: number;
  onBuy: (item: ShopItem) => void;
  onPreviewChest?: (item: ShopItem) => void;
}

export function ShopItemCard({ item, coins, level, onBuy, onPreviewChest }: ShopItemCardProps) {
  const isLocked = level < item.unlockLevel;
  const canBuy = coins >= item.price;
  const canUse = canBuy && !isLocked;

  return (
    <article className={`shop-card ${item.isLuckyChest ? "shop-card--chest" : ""} ${isLocked ? "shop-card--locked" : "shop-card--unlocked"}`}>
      <div>
        <div className="shop-card__labels">
          <span className="eyebrow">{item.isLuckyChest ? "Lucky Chest" : "Belohnung"}</span>
          <span className={`unlock-label ${isLocked ? "unlock-label--locked" : "unlock-label--open"}`}>
            {isLocked ? `Level ${item.unlockLevel} nötig` : "Freigeschaltet"}
          </span>
        </div>
        <h3>{item.name}</h3>
        {item.durationLabel ? <strong className="duration-pill">{item.durationLabel}</strong> : null}
        <p>{item.description}</p>
        {item.isLuckyChest ? (
          <div className="chest-category-row" aria-label="Mögliche Reward-Kategorien">
            <span>Coins</span>
            <span>Gems</span>
            <span>Gutscheine</span>
            <span>Rare</span>
          </div>
        ) : null}
      </div>
      <div className="shop-card__footer">
        <strong>
          {item.price} {item.currency === "coins" ? "Coins" : "Gems"}
        </strong>
        <div className="shop-card__actions">
          {item.isLuckyChest ? (
            <button className="button button--ghost" type="button" onClick={() => onPreviewChest?.(item)}>
              Mögliche Inhalte ansehen
            </button>
          ) : null}
          <button className="button button--primary" type="button" disabled={!canUse} onClick={() => onBuy(item)}>
            {isLocked ? "Gesperrt" : item.isLuckyChest ? "Öffnen" : "Kaufen"}
          </button>
        </div>
      </div>
    </article>
  );
}
