import type { PurchaseResult } from "../types";

interface PurchaseFeedbackModalProps {
  purchase: PurchaseResult | null;
  onClose: () => void;
}

export function PurchaseFeedbackModal({ purchase, onClose }: PurchaseFeedbackModalProps) {
  if (!purchase) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal purchase-modal" role="dialog" aria-modal="true" aria-labelledby="purchase-title">
        <span className="modal-rune">Reward</span>
        <span className="eyebrow">Belohnung gekauft</span>
        <h2 id="purchase-title">{purchase.itemName}</h2>
        <p>
          {purchase.durationLabel
            ? `${purchase.durationLabel} ${purchase.itemName} freigeschaltet.`
            : `${purchase.itemName} wurde deinem Inventar hinzugefügt.`}
        </p>
        <div className="purchase-summary">
          {purchase.durationLabel ? (
            <strong>
              <span>Dauer</span>
              {purchase.durationLabel}
            </strong>
          ) : null}
          <strong>
            <span>Bezahlt</span>
            -{purchase.price} {purchase.currency === "coins" ? "Coins" : "Gems"}
          </strong>
          <strong>
            <span>Status</span>
            Verfügbar
          </strong>
        </div>
        <div className="modal-actions">
          <button className="button button--primary" type="button" onClick={onClose}>
            In meinen Belohnungen ansehen
          </button>
        </div>
      </section>
    </div>
  );
}
