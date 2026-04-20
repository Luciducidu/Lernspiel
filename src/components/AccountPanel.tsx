import { FormEvent, useState } from "react";
import type { AccountState } from "../types";
import { isSyncBackendConfigured } from "../utils/sync";

interface AccountPanelProps {
  account: AccountState;
  onLogin: (username: string, syncKey: string) => void;
  onLogout: () => void;
  onSync: () => void;
}

export function AccountPanel({ account, onLogin, onLogout, onSync }: AccountPanelProps) {
  const [username, setUsername] = useState(account.username ?? "");
  const [syncKey, setSyncKey] = useState("");
  const configured = isSyncBackendConfigured();
  const loggedIn = account.mode === "account" && Boolean(account.username);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onLogin(username, syncKey);
  }

  return (
    <section className="settings-panel account-panel">
      <div className="section-heading">
        <span className="eyebrow">Konto</span>
        <h2>Optional anmelden</h2>
      </div>
      <p className="section-copy">
        Du kannst LernQuest weiter lokal nutzen. Mit Konto werden Quests und Fortschritt über ein Sync-Backend auf andere Geräte übertragen.
      </p>

      {!configured ? (
        <div className="sync-notice sync-notice--offline">
          <strong>Sync-Backend nicht konfiguriert</strong>
          <span>Gastmodus bleibt aktiv. Für echte Geräte-Synchronisation muss `VITE_SYNC_API_URL` gesetzt sein.</span>
        </div>
      ) : null}

      {loggedIn ? (
        <div className="account-state-card">
          <span className="goal-status goal-status--available">Eingeloggt</span>
          <strong>{account.username}</strong>
          <small>Status: {account.syncStatus}</small>
          {account.lastSyncedAt ? <small>Letzter Sync: {new Date(account.lastSyncedAt).toLocaleString("de-DE")}</small> : null}
          {account.syncMessage ? <p>{account.syncMessage}</p> : null}
          <div className="account-actions">
            <button className="button button--primary" type="button" onClick={onSync} disabled={!configured || account.syncStatus === "syncing"}>
              Daten synchronisieren
            </button>
            <button className="button button--ghost" type="button" onClick={onLogout}>
              Abmelden
            </button>
          </div>
        </div>
      ) : (
        <form className="account-form" onSubmit={handleSubmit}>
          <label>
            Benutzername
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="z. B. abi2026" />
          </label>
          <label>
            Sync-Schlüssel
            <input
              value={syncKey}
              onChange={(event) => setSyncKey(event.target.value)}
              placeholder="Privater Schlüssel zum Wiederanmelden"
              type="password"
            />
          </label>
          <button className="button button--primary" type="submit" disabled={!configured || account.syncStatus === "syncing"}>
            Konto erstellen / anmelden
          </button>
          <small>Der Sync-Schlüssel wird lokal nur als Hash gespeichert. Der Benutzername allein reicht nicht zum Laden fremder Daten.</small>
          {account.syncMessage ? <p>{account.syncMessage}</p> : null}
        </form>
      )}
    </section>
  );
}
