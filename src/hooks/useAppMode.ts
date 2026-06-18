import type { AppMode, AppState } from "../types";

export function getModeLabel(mode: AppMode): string {
  return mode === "abi" ? "Abi-Modus" : "Brainworkout-Modus";
}

export function useAppMode(appState: AppState) {
  const activeMode = appState.activeMode;
  const scopedProgress = activeMode === "abi" ? appState.abi : appState.brainworkout;

  return {
    activeMode,
    modeLabel: getModeLabel(activeMode),
    scopedProgress,
    global: appState.global,
  };
}
