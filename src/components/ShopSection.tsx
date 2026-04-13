import type { ShopItem } from "../types";
import { ShopItemCard } from "./ShopItemCard";

interface ShopSectionProps {
  title: string;
  eyebrow: string;
  variant: "standard" | "premium";
  items: ShopItem[];
  coins: number;
  level: number;
  onBuy: (item: ShopItem) => void;
}

export function ShopSection({ title, eyebrow, variant, items, coins, level, onBuy }: ShopSectionProps) {
  return (
    <section className={`panel shop-section shop-section--${variant}`}>
      <div className="section-heading">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {items.length > 0 ? (
        <div className="shop-grid">
          {items.map((item) => (
            <ShopItemCard key={item.id} item={item} coins={coins} level={level} onBuy={onBuy} />
          ))}
        </div>
      ) : (
        <p className="empty-state">Hier erscheinen später weitere Belohnungen.</p>
      )}
    </section>
  );
}
