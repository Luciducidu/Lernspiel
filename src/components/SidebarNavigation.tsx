import type { AppPage } from "../types";

const navItems: Array<{ page: AppPage; label: string; mobileLabel: string; hint: string }> = [
  { page: "dashboard", label: "Dashboard", mobileLabel: "Start", hint: "Heute" },
  { page: "quests", label: "Quests", mobileLabel: "Quests", hint: "Planen" },
  { page: "focus", label: "Fokusmodus", mobileLabel: "Fokus", hint: "Lernen" },
  { page: "shop", label: "Shop", mobileLabel: "Shop", hint: "Belohnungen" },
  { page: "progress", label: "Fortschritt", mobileLabel: "Rewards", hint: "Auswertung" },
  { page: "settings", label: "Einstellungen", mobileLabel: "Mehr", hint: "Faecher" },
];

interface SidebarNavigationProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function SidebarNavigation({ activePage, onNavigate }: SidebarNavigationProps) {
  return (
    <aside className="sidebar-navigation" aria-label="Hauptnavigation">
      <div className="brand-block">
        <strong>LernQuest</strong>
        <span>Abi-Vorbereitung</span>
      </div>
      <nav className="nav-list">
        {navItems.map((item) => (
          <button
            key={item.page}
            className={`nav-item ${activePage === item.page ? "nav-item--active" : ""}`}
            type="button"
            onClick={() => onNavigate(item.page)}
          >
            <span className="nav-label nav-label--desktop">{item.label}</span>
            <span className="nav-label nav-label--mobile">{item.mobileLabel}</span>
            <small>{item.hint}</small>
          </button>
        ))}
      </nav>
    </aside>
  );
}
