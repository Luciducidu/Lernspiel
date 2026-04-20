import type { RewardInventoryItem } from "../types";

interface RewardInventoryPanelProps {
  items: RewardInventoryItem[];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(value));
}

export function RewardInventoryPanel({ items }: RewardInventoryPanelProps) {
  return (
    <section className="panel inventory-panel">
      <div className="section-heading">
        <span className="eyebrow">Meine Belohnungen</span>
        <h2>Gekauft und verfügbar</h2>
      </div>
      {items.length === 0 ? (
        <p className="empty-state">Noch keine Belohnung gekauft. Nach dem Kauf erscheint sie hier sichtbar als Inventar-Eintrag.</p>
      ) : (
        <div className="inventory-grid">
          {items.map((item) => (
            <article className={`inventory-card inventory-card--${item.status}`} key={item.id}>
              <div>
                <span className="eyebrow">{item.durationLabel ? "Zeit-Belohnung" : "Gutschein"}</span>
                <h3>{item.durationLabel ? `${item.durationLabel} ${item.name}` : item.name}</h3>
                <p>{item.description}</p>
              </div>
              <div className="inventory-card__meta">
                <span>Gekauft am {formatDate(item.purchasedAt)}</span>
                <span>{item.status === "available" ? "Verfügbar" : item.status === "active" ? "Aktiv" : "Verwendet"}</span>
              </div>
              <button className="button button--ghost" type="button" disabled>
                Verwenden vorbereitet
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
