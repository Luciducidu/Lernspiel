import type { ChangeEvent } from "react";
import type { AccountState } from "../types";
import { isSyncBackendConfigured } from "../utils/sync";

interface DataManagementPanelProps {
  account: AccountState;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function DataManagementPanel({ account, onExport, onImport }: DataManagementPanelProps) {
  const backendConfigured = isSyncBackendConfigured();
  const isAccountMode = account.mode === "account" && Boolean(account.username);
  const storageLabel = backendConfigured && isAccountMode ? "Sync aktiv" : isAccountMode ? "Lokales Konto" : "Gastmodus";

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    event.target.value = "";
  }

  return (
    <section className="settings-panel data-panel">
      <div className="section-heading">
        <span className="eyebrow">Daten</span>
        <h2>Export, Import und Sync</h2>
      </div>
      <p className="section-copy">
        Deine Daten bleiben lokal nutzbar. Wenn kein echtes Sync-Backend verbunden ist, kannst du Export und Import als sichere Alternative nutzen.
      </p>

      <div className="data-status-card">
        <span className={backendConfigured && isAccountMode ? "goal-status goal-status--available" : "goal-status goal-status--locked"}>
          {storageLabel}
        </span>
        <strong>{isAccountMode ? account.username : "Lokaler Fortschritt"}</strong>
        <p>
          {backendConfigured
            ? "Ein Sync-Backend ist konfiguriert. Export und Import bleiben als Backup verfügbar."
            : "Echte Geräte-Synchronisation braucht ein konfiguriertes Backend. Exportiere deinen Fortschritt als JSON und importiere ihn auf einem anderen Gerät."}
        </p>
      </div>

      <div className="data-actions">
        <button className="button button--primary" type="button" onClick={onExport}>
          Fortschritt exportieren
        </button>
        <label className="button button--ghost data-import-button">
          Fortschritt importieren
          <input type="file" accept="application/json,.json" onChange={handleFileChange} />
        </label>
      </div>
      <small className="data-hint">Beim Import wird vorher gefragt. Es wird nichts heimlich ersetzt.</small>
    </section>
  );
}
