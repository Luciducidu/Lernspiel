import type { AppPage } from "../types";

const navItems: Array<{ page: AppPage; label: string; hint: string }> = [
  { page: "dashboard", label: "Dashboard", hint: "Heute" },
  { page: "quests", label: "Quests", hint: "Planen" },
  { page: "focus", label: "Fokusmodus", hint: "Lernen" },
  { page: "shop", label: "Shop", hint: "Belohnungen" },
  { page: "progress", label: "Fortschritt", hint: "Auswertung" },
  { page: "settings", label: "Einstellungen", hint: "Fächer" },
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
            <span>{item.label}</span>
            <small>{item.hint}</small>
          </button>
        ))}
      </nav>
    </aside>
  );
}
