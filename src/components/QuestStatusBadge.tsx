import type { QuestStatus } from "../types";

const statusLabels: Record<QuestStatus, string> = {
  open: "Offen",
  accepted: "Angenommen",
  in_progress: "Läuft",
  completed: "Abgeschlossen",
  cancelled: "Abgebrochen",
};

export function QuestStatusBadge({ status }: { status: QuestStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{statusLabels[status]}</span>;
}
