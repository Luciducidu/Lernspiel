import type { BrainworkoutAreaId, BrainworkoutQuestType, DailyPlanTier, Difficulty, QuestMode, QuestOutputType, QuestTaskType } from "../types";

export interface BrainworkoutQuestTemplate {
  title: string;
  category: string;
  area: BrainworkoutAreaId;
  brainworkoutQuestType: BrainworkoutQuestType;
  topic: string;
  taskType: QuestTaskType;
  mode: QuestMode;
  outputType: QuestOutputType;
  durationMinutes: number;
  difficulty: Difficulty;
  dailyPlanTier: DailyPlanTier;
  note: string;
}

export const brainworkoutAreaLabels: Record<BrainworkoutAreaId, string> = {
  math_first_semester: "Mathe-Erstsemester",
  physics_first_semester: "Physik-Erstsemester",
  language_poetry_slam: "Sprache / Poetry Slam",
  logic_puzzles: "Logik / Denkaufgaben",
  chess_external: "Schach-App",
  driving_license: "Führerschein-App",
  housework_life: "Hausarbeit / Alltag",
};

export const brainworkoutQuestTypeLabels: Record<BrainworkoutQuestType, string> = {
  math_foundations: "Mathe-Grundlagen",
  physics_understanding: "Physik-Verständnis",
  poetry_language: "Sprache / Poetry",
  logic_puzzle: "Logik",
  chess_app: "Schach-App",
  driving_app: "Führerschein-App",
  weekly_reflection: "Wochenreflexion",
  housework: "Hausarbeit",
};

export const dailyPlanTierLabels: Record<DailyPlanTier, string> = {
  minimum: "Pflichtminimum",
  normal: "Normaler Tag",
  strong: "Guter Tag",
};

function b(
  area: BrainworkoutAreaId,
  brainworkoutQuestType: BrainworkoutQuestType,
  topic: string,
  dailyPlanTier: DailyPlanTier,
  difficulty: Difficulty,
  durationMinutes: number,
  title: string,
  note: string,
  outputType: QuestOutputType = "Stichpunkte",
): BrainworkoutQuestTemplate {
  return {
    title,
    category: brainworkoutAreaLabels[area],
    area,
    brainworkoutQuestType,
    topic,
    dailyPlanTier,
    difficulty,
    durationMinutes,
    taskType: brainworkoutQuestType === "housework" ? "anwendung" : brainworkoutQuestType === "weekly_reflection" ? "struktur" : "recall",
    mode: brainworkoutQuestType === "chess_app" || brainworkoutQuestType === "driving_app" ? "abfrage" : "solo",
    outputType,
    note,
  };
}

export const brainworkoutQuestTemplates: BrainworkoutQuestTemplate[] = [
  b("math_first_semester", "math_foundations", "Funktionen und Graphen", "normal", "easy", 20, "Wiederhole Grundlagen zu Funktionen und Graphen", "Skizziere zwei Funktionen und notiere, was Achsenschnittpunkte, Steigung und Verlauf bedeuten."),
  b("math_first_semester", "math_foundations", "Ableitungen", "normal", "medium", 30, "Bearbeite 3 Aufgaben zu Ableitungen", "Nutze einfache Funktionen und kontrolliere jeweils Bedeutung, Rechenweg und Ergebnis.", "Rechnung"),
  b("math_first_semester", "math_foundations", "Grenzwerte", "minimum", "easy", 10, "Erkläre dir den Begriff Grenzwert", "Formuliere in eigenen Worten, was ein Grenzwert beschreibt und wo du noch unsicher bist.", "kurze Erklärung"),
  b("math_first_semester", "math_foundations", "Umformungen", "normal", "medium", 25, "Übe Gleichungen und Umformungen 25 Minuten", "Arbeite ruhig an Umformungen, Klammern, Brüchen und Potenzen.", "Rechnung"),
  b("math_first_semester", "math_foundations", "Vektoren", "strong", "medium", 45, "Wiederhole Vektoren als Brücke zur linearen Algebra", "Notiere Grundbegriffe, rechne kleine Beispiele und markiere offene Fragen."),
  b("math_first_semester", "math_foundations", "Integrale", "strong", "hard", 60, "Löse einen kleinen Aufgabenblock zu Integralen", "Rechne wenige Aufgaben sauber statt viele oberflächlich.", "Rechnung"),
  b("math_first_semester", "math_foundations", "Begriffe", "minimum", "easy", 10, "Notiere 3 mathematische Unsicherheiten", "Schreibe drei Begriffe auf, die du später gezielt klären willst."),

  b("physics_first_semester", "physics_understanding", "Grundkonzepte", "minimum", "easy", 10, "Erkläre ein Physik-Grundkonzept laut", "Sprich 5 Minuten frei und notiere danach eine offene Frage.", "mündliche Erklärung"),
  b("physics_first_semester", "physics_understanding", "Einheiten", "normal", "easy", 20, "Wiederhole Einheiten und Größen", "Ordne Einheiten, Formelzeichen und Bedeutung in einer kleinen Tabelle."),
  b("physics_first_semester", "physics_understanding", "Formeln", "normal", "medium", 25, "Erkläre eine Formel Größe für Größe", "Wähle eine Formel und beschreibe, was jede Größe physikalisch bedeutet."),
  b("physics_first_semester", "physics_understanding", "Skizzen", "normal", "medium", 30, "Zeichne eine Skizze zu einem Zusammenhang", "Erkläre mit Pfeilen, Achsen oder Kräften, was in der Situation passiert."),
  b("physics_first_semester", "physics_understanding", "Mechanik", "strong", "medium", 45, "Bearbeite 3 Verständnisfragen zu Mechanik", "Konzentriere dich auf Begründung statt nur Formel einsetzen."),
  b("physics_first_semester", "physics_understanding", "Vorzeichen und Einheiten", "normal", "medium", 25, "Wiederhole Vorzeichen und Einheiten an einem Beispiel", "Prüfe, wo Vorzeichen und Einheit die Interpretation verändern."),

  b("language_poetry_slam", "poetry_language", "Einstiege", "minimum", "easy", 10, "Schreibe 5 starke Einstiegszeilen", "Wähle ein Thema und schreibe ohne lange Bewertung fünf mögliche erste Sätze.", "Stichpunkte"),
  b("language_poetry_slam", "poetry_language", "Rhythmus", "normal", "medium", 25, "Überarbeite einen alten Text rhythmisch", "Lies laut, kürze Stolperstellen und markiere starke Zeilen.", "Analyse"),
  b("language_poetry_slam", "poetry_language", "Reime", "minimum", "easy", 10, "Finde 10 Reime zu einem Wortfeld", "Sammle Reime, Halbreime und überraschende Wortverbindungen."),
  b("language_poetry_slam", "poetry_language", "Metaphern", "normal", "medium", 20, "Schreibe eine Metaphernsammlung", "Sammle Bilder zu einem Thema und wähle am Ende drei starke aus."),
  b("language_poetry_slam", "poetry_language", "Verdichtung", "normal", "medium", 30, "Kürze einen Absatz auf die stärksten Sätze", "Streiche Füllsätze und behalte nur die Zeilen mit Wirkung."),
  b("language_poetry_slam", "poetry_language", "Stimme", "strong", "medium", 45, "Formuliere einen Gedanken in drei Stimmen", "Schreibe denselben Gedanken humorvoll, poetisch und provokant."),
  b("language_poetry_slam", "poetry_language", "Rohtext", "minimum", "easy", 10, "Schreibe 10 Minuten Rohtext", "Kein Perfektionsdruck. Nur schreiben und danach einen Satz markieren."),

  b("logic_puzzles", "logic_puzzle", "Logikrätsel", "minimum", "easy", 10, "Löse ein kompaktes Logikrätsel", "Bearbeite eine kleine Aufgabe und notiere den Lösungsweg."),
  b("logic_puzzles", "logic_puzzle", "Zahlenfolgen", "normal", "medium", 20, "Bearbeite eine mittelschwere Zahlenfolge", "Suche Muster, prüfe Alternativen und schreibe die Regel auf."),
  b("logic_puzzles", "logic_puzzle", "Schlussfolgern", "normal", "medium", 25, "Trainiere eine Wenn-dann-Schlussfolgerung", "Formuliere Voraussetzung, Folge und Gegenbeispiel."),
  b("logic_puzzles", "logic_puzzle", "Kombinatorik", "strong", "medium", 35, "Löse eine kleine Kombinatorikfrage", "Zähle systematisch statt zu raten."),
  b("logic_puzzles", "logic_puzzle", "Denkfallen", "normal", "easy", 15, "Wiederhole eine Denkfalle", "Erkläre, warum die Falle funktioniert und wie du sie erkennst."),

  b("chess_external", "chess_app", "Taktik", "minimum", "easy", 10, "Löse 5 Taktikaufgaben in der Schach-App", "Arbeite extern in der App und bestätige danach manuell den Abschluss."),
  b("chess_external", "chess_app", "Partien", "normal", "medium", 30, "Spiele 2 Partien und notiere einen Fehler", "Die Website prüft die App nicht. Du bestätigst selbst ehrlich den Abschluss."),
  b("chess_external", "chess_app", "Analyse", "normal", "medium", 20, "Analysiere eine Partie kurz", "Notiere Eröffnung, Wendepunkt und einen vermeidbaren Fehler."),
  b("chess_external", "chess_app", "Eröffnung", "minimum", "easy", 10, "Trainiere Eröffnungsgrundideen", "Nutze die Schach-App und achte auf Entwicklung, Zentrum und Königssicherheit."),

  b("driving_license", "driving_app", "Fragen", "minimum", "easy", 10, "Bearbeite 15 Fragen in der Führerschein-App", "Arbeite extern in der App und bestätige den Abschluss danach manuell."),
  b("driving_license", "driving_app", "Fehler", "normal", "medium", 20, "Wiederhole 10 falsche Fragen", "Konzentriere dich auf die Fehlergründe, nicht nur auf die richtige Antwort."),
  b("driving_license", "driving_app", "Simulation", "strong", "medium", 45, "Mache eine kurze Prüfungssimulation", "Die Auswertung bleibt in der externen App; trage danach ehrlich den Abschluss ein."),
  b("driving_license", "driving_app", "Regeln", "minimum", "easy", 10, "Notiere eine Verkehrsregel", "Schreibe eine Regel auf, die du dir aktiv merken willst."),

  b("housework_life", "housework", "Ordnung", "minimum", "easy", 10, "Schreibtisch ordnen", "Mache die Arbeitsfläche frei, damit die nächste Einheit leichter startet."),
  b("housework_life", "housework", "Zimmer", "normal", "medium", 20, "Zimmer 20 Minuten aufräumen", "Setze einen klaren Bereich und räume nur diesen Bereich auf."),
  b("housework_life", "housework", "Haushalt", "normal", "medium", 25, "Staubsaugen oder Staubwischen", "Erledige eine sichtbare Haushaltsaufgabe und bestätige danach den Abschluss."),
  b("housework_life", "housework", "Aussortieren", "strong", "hard", 40, "Aussortieren ohne Perfektionsdruck", "Wähle eine kleine Zone und sortiere konsequent, aber zeitbegrenzt."),

  b("logic_puzzles", "weekly_reflection", "Wochenreflexion", "minimum", "easy", 15, "Schließe deine Wochenreflexion ab", "Öffne die Planung, beantworte die kurzen Reflexionsfragen und speichere deine Auswertung.", "kurze Erklärung"),
];
