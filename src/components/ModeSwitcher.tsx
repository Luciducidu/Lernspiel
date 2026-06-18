import type { AppMode } from "../types";

interface ModeSwitcherProps {
  activeMode: AppMode;
  onChange: (mode: AppMode) => void;
}

const modeLabels: Record<AppMode, { title: string; hint: string }> = {
  abi: { title: "Abi", hint: "Pruefung" },
  brainworkout: { title: "Brainworkout", hint: "Langfristig" },
};

export function ModeSwitcher({ activeMode, onChange }: ModeSwitcherProps) {
  return (
    <div className="mode-switcher" aria-label="App-Modus wechseln">
      {(Object.keys(modeLabels) as AppMode[]).map((mode) => (
        <button
          className={`mode-switcher__option ${activeMode === mode ? "mode-switcher__option--active" : ""}`}
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
        >
          <strong>{modeLabels[mode].title}</strong>
          <span>{modeLabels[mode].hint}</span>
        </button>
      ))}
    </div>
  );
}
