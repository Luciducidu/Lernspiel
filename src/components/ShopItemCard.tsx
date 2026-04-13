import type { ShopItem } from "../types";

interface ShopItemCardProps {
  item: ShopItem;
  coins: number;
  level: number;
  onBuy: (item: ShopItem) => void;
}

export function ShopItemCard({ item, coins, level, onBuy }: ShopItemCardProps) {
  const isLocked = level < item.unlockLevel;
  const canBuy = coins >= item.price;
  const canUse = canBuy && !isLocked;

  return (
    <article className={`shop-card ${isLocked ? "shop-card--locked" : "shop-card--unlocked"}`}>
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
      </div>
      <div className="shop-card__footer">
        <strong>
          {item.price} {item.currency === "coins" ? "Coins" : "Gems"}
        </strong>
        <button className="button button--primary" type="button" disabled={!canUse} onClick={() => onBuy(item)}>
          {isLocked ? "Gesperrt" : "Kaufen"}
        </button>
      </div>
    </article>
  );
}
