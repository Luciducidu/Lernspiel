import type { AppState, Quest, UserProgress } from "../types";
import { appDataVersion } from "./storage";

export interface AppExportData {
  schema: "lernquest-export";
  appDataVersion: number;
  exportedAt: string;
  quests: Quest[];
  progress: UserProgress;
  appState: AppState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function createAppExportData(quests: Quest[], progress: UserProgress, appState: AppState): AppExportData {
  return {
    schema: "lernquest-export",
    appDataVersion,
    exportedAt: new Date().toISOString(),
    quests,
    progress,
    appState,
  };
}

export function downloadExportFile(data: AppExportData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `lernquest-export-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function parseAppExportFile(file: File): Promise<AppExportData> {
  const raw = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Die Datei ist keine gültige JSON-Datei.");
  }

  if (!isRecord(parsed) || parsed.schema !== "lernquest-export") {
    throw new Error("Diese Datei ist kein LernQuest-Export.");
  }

  if (!Array.isArray(parsed.quests) || !isRecord(parsed.progress) || !isRecord(parsed.appState)) {
    throw new Error("Der Export ist unvollständig.");
  }

  const appState = parsed.appState as Partial<AppState>;
  if (appState.activeMode !== "abi" && appState.activeMode !== "brainworkout") {
    throw new Error("Der Export enthält keinen gültigen App-Modus.");
  }

  return parsed as unknown as AppExportData;
}
