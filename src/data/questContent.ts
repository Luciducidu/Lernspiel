import type {
  Difficulty,
  MultipleChoiceQuestion,
  Quest,
  QuestMode,
  QuestOutputType,
  QuestTaskType,
  Subject,
} from "../types";

export interface StudyQuestTemplate {
  type: "study";
  title: string;
  category: string;
  subject: Subject;
  topic: string;
  taskType: QuestTaskType;
  mode: QuestMode;
  outputType: QuestOutputType;
  durationMinutes: number;
  difficulty: Difficulty;
  note: string;
}

export const subjectTopics: Record<Subject, string[]> = {
  PB: [
    "Demokratie",
    "politische Ordnung der BRD",
    "politische Partizipation",
    "politische Systeme",
    "EU",
    "Wirtschaft",
    "Gesellschaft",
    "internationale Beziehungen",
    "Methodik / Statistikanalyse",
  ],
  Deutsch: [
    "Sprache und Kommunikation",
    "Literatur um 1800",
    "Literatur im 19. Jahrhundert",
    "Literatur im 20./21. Jahrhundert",
    "Analyse und Interpretation",
    "materialgestütztes Schreiben",
    "Medien / Film / Theater",
    "Stilmittel / rhetorische Mittel / Erzähltechnik",
  ],
  Mathe: ["Analysis", "Stochastik", "analytische Geometrie", "Abiturtraining"],
};

export const subjectOptions = Object.keys(subjectTopics) as Subject[];

export const taskTypeLabels: Record<QuestTaskType, string> = {
  recall: "Recall",
  struktur: "Struktur",
  analyse: "Analyse",
  anwendung: "Anwendung",
  chatgpt_training: "Mit ChatGPT lernen",
  abi_training: "Abi-Training",
};

export const modeLabels: Record<QuestMode, string> = {
  solo: "Solo",
  mit_chatgpt: "mit ChatGPT",
  unter_zeitdruck: "unter Zeitdruck",
  schreibplan: "Schreibplan",
  abfrage: "Abfrage",
  klausurnah: "klausurnah",
};

export const taskTypeOptions = Object.keys(taskTypeLabels) as QuestTaskType[];
export const modeOptions = Object.keys(modeLabels) as QuestMode[];
export const outputTypeOptions: QuestOutputType[] = [
  "Stichpunkte",
  "Schreibplan",
  "kurze Erklärung",
  "Vergleich",
  "Rechnung",
  "Analyse",
  "Urteil",
  "Gliederung",
  "mündliche Erklärung",
  "ChatGPT-Dialog",
];

function t(
  subject: Subject,
  topic: string,
  taskType: QuestTaskType,
  mode: QuestMode,
  outputType: QuestOutputType,
  difficulty: Difficulty,
  durationMinutes: number,
  title: string,
  note: string,
): StudyQuestTemplate {
  return {
    type: "study",
    title,
    category: subject,
    subject,
    topic,
    taskType,
    mode,
    outputType,
    durationMinutes,
    difficulty,
    note,
  };
}

export const studyQuestTemplates: StudyQuestTemplate[] = [
  t("PB", "Demokratie", "recall", "abfrage", "kurze Erklärung", "easy", 10, "Erkläre 3 Demokratiebegriffe präzise", "Wähle drei Begriffe wie Volkssouveränität, Rechtsstaat, Gewaltenteilung oder Pluralismus und formuliere je eine klare Definition plus Beispiel."),
  t("PB", "Demokratie", "struktur", "solo", "Stichpunkte", "medium", 20, "Erstelle eine Ursache-Folge-Kette zur Demokratieentwicklung", "Ordne historische Ursachen, institutionelle Folgen und heutige Schutzmechanismen in einer nachvollziehbaren Kette."),
  t("PB", "Demokratie", "analyse", "solo", "Analyse", "medium", 25, "Analysiere Artikel 20 GG als Demokratie-Gerüst", "Zerlege die Prinzipien Demokratie, Rechtsstaat, Bundesstaat und Sozialstaat in Funktion, Beispiel und mögliche Konfliktstelle."),
  t("PB", "Demokratie", "abi_training", "klausurnah", "Urteil", "hard", 40, "Formuliere ein AFB-III-Urteil zur wehrhaften Demokratie", "Baue Kriterium, Pro-Argument, Contra-Argument, Abwägung und begründetes Schlussurteil auf."),
  t("PB", "politische Ordnung der BRD", "recall", "abfrage", "Stichpunkte", "easy", 15, "Ordne die Verfassungsorgane aus dem Kopf", "Notiere Aufgaben und Kontrollfunktion von Bundestag, Bundesrat, Bundesregierung, Bundespräsident und Bundesverfassungsgericht."),
  t("PB", "politische Ordnung der BRD", "struktur", "schreibplan", "Gliederung", "medium", 25, "Erstelle einen Schreibplan zur politischen Ordnung der BRD", "Gliedere Einleitung, Analyse der Organe, Zusammenspiel, Problemstelle und Fazit."),
  t("PB", "politische Ordnung der BRD", "analyse", "solo", "Vergleich", "medium", 30, "Vergleiche Föderalismus und Zentralismus", "Arbeite Entscheidungswege, Bürgernähe, Effizienz und Krisenfähigkeit heraus."),
  t("PB", "politische Ordnung der BRD", "chatgpt_training", "mit_chatgpt", "ChatGPT-Dialog", "easy", 15, "Bitte ChatGPT um 5 Prüfungsfragen zu Artikel 20 GG", "Lass dir Fragen stellen, antworte zuerst selbst und korrigiere danach mit einer Musterlösung."),
  t("PB", "politische Partizipation", "recall", "abfrage", "kurze Erklärung", "easy", 15, "Erkläre Parteien, Verbände und Bürgerinitiativen", "Definiere die Akteure und nenne je einen Beitrag zur politischen Willensbildung."),
  t("PB", "politische Partizipation", "analyse", "solo", "Analyse", "medium", 25, "Analysiere Beteiligungsformen im politischen Prozess", "Unterscheide Wahlen, Petitionen, Demonstrationen, digitale Beteiligung und Parteiarbeit nach Wirkung und Grenzen."),
  t("PB", "politische Partizipation", "anwendung", "solo", "Urteil", "medium", 30, "Bewerte eine Maßnahme gegen Politikverdrossenheit", "Nutze Kriterien wie Teilhabe, Repräsentation, Umsetzbarkeit und demokratische Legitimation."),
  t("PB", "politische Systeme", "struktur", "solo", "Vergleich", "medium", 25, "Vergleiche Demokratie und Diktaturformen", "Ordne Merkmale zu Herrschaftslegitimation, Kontrolle, Grundrechten und Opposition."),
  t("PB", "politische Systeme", "analyse", "solo", "Stichpunkte", "hard", 30, "Unterscheide Demokratietheorien an einem Streitfall", "Nutze repräsentative, direkte und identitäre Demokratie als Vergleichsfolie."),
  t("PB", "EU", "recall", "abfrage", "Stichpunkte", "easy", 15, "Erkläre die wichtigsten EU-Institutionen", "Kommission, Parlament, Rat der EU und Europäischer Rat: Aufgabe, Legitimation, Beispiel."),
  t("PB", "EU", "struktur", "schreibplan", "Schreibplan", "medium", 25, "Erstelle einen Schreibplan zu einem EU-Konflikt", "Problemaufriss, beteiligte Institutionen, Interessen, Lösungsoptionen, Urteil."),
  t("PB", "EU", "abi_training", "unter_zeitdruck", "Urteil", "hard", 30, "Bearbeite eine EU-Urteilsaufgabe unter Zeitdruck", "Formuliere in 30 Minuten ein strukturiertes Urteil zu Handlungsfähigkeit oder Demokratiedefizit der EU."),
  t("PB", "Wirtschaft", "recall", "abfrage", "kurze Erklärung", "easy", 15, "Erkläre 3 wirtschaftspolitische Begriffe", "Wähle Fiskalpolitik, Geldpolitik, Konjunktur, Inflation, Markt oder Wettbewerb und definiere präzise."),
  t("PB", "Wirtschaft", "struktur", "solo", "Vergleich", "medium", 25, "Vergleiche Freihandel und Protektionismus", "Strukturiere Chancen, Risiken, Gewinner, Verlierer und ein begründetes Urteil."),
  t("PB", "Wirtschaft", "analyse", "solo", "Analyse", "medium", 30, "Analysiere den Wirtschaftskreislauf an einem Beispiel", "Ordne Haushalte, Unternehmen, Staat, Banken und Ausland mit Geld- und Güterströmen."),
  t("PB", "Wirtschaft", "abi_training", "klausurnah", "Urteil", "hard", 40, "Bewerte KI-Regulierung oder Lieferkettengesetze", "Nutze Zielkonflikte zwischen Freiheit, Schutz, Innovation, Verantwortung und Wettbewerbsfähigkeit."),
  t("PB", "Gesellschaft", "recall", "abfrage", "Stichpunkte", "easy", 15, "Wiederhole Sozialstaat und Gerechtigkeit", "Erkläre Sozialstaat, Chancengerechtigkeit, Leistungsgerechtigkeit und Bedarfsgerechtigkeit."),
  t("PB", "Gesellschaft", "struktur", "schreibplan", "Schreibplan", "medium", 25, "Erstelle einen PB-Schreibplan zu sozialer Ungleichheit", "Einleitung, Indikatoren, Ursachen, Folgen, politische Maßnahmen, Urteil."),
  t("PB", "internationale Beziehungen", "analyse", "solo", "Vergleich", "medium", 30, "Vergleiche UN, NATO und Völkerrecht", "Ordne Ziele, Mittel, Grenzen und Bedeutung an einem Konfliktbeispiel."),
  t("PB", "internationale Beziehungen", "abi_training", "klausurnah", "Urteil", "hard", 40, "Skizziere ein Urteil zum Ukrainekrieg im Völkerrecht", "Formuliere keine echte Rechtsberatung, sondern prüfe Prinzipien wie Souveränität, Gewaltverbot und Bündnissicherheit."),
  t("PB", "Methodik / Statistikanalyse", "analyse", "solo", "Analyse", "medium", 25, "Werte eine fiktive Statistik methodisch aus", "Beschreibe auffällige Daten, deute mögliche Ursachen, prüfe Aussagekraft und formuliere eine These."),
  t("PB", "Methodik / Statistikanalyse", "struktur", "schreibplan", "Gliederung", "medium", 20, "Erstelle das Gerüst für eine materialgestützte PB-Aufgabe", "Plane Problemaufriss, Materialauswertung, eigene Argumente, Abwägung und Schlussurteil."),
  t("PB", "Methodik / Statistikanalyse", "chatgpt_training", "mit_chatgpt", "ChatGPT-Dialog", "easy", 15, "Lass dich mit ChatGPT zu PB-Fachbegriffen prüfen", "Bitte um eine mündliche Abfrage mit kurzen Rückfragen und korrigiere unklare Definitionen."),
  t("Deutsch", "Sprache und Kommunikation", "recall", "abfrage", "kurze Erklärung", "easy", 15, "Erkläre 3 Begriffe zu Sprache und Macht", "Definiere Framing, persuasive Sprache und manipulative Sprache mit je einem Mini-Beispiel."),
  t("Deutsch", "Sprache und Kommunikation", "analyse", "solo", "Analyse", "medium", 25, "Analysiere Sprache, Wirkung und Intention", "Erstelle Stichpunkte zu Wortwahl, Wertung, Adressatenbezug und möglicher Wirkung."),
  t("Deutsch", "Sprache und Kommunikation", "chatgpt_training", "mit_chatgpt", "ChatGPT-Dialog", "easy", 15, "Gehe mit ChatGPT Q3 Sprache durch", "Lass dich zu Kommunikationsmodellen, Framing und Sprachkritik abfragen."),
  t("Deutsch", "Literatur um 1800", "recall", "abfrage", "Vergleich", "easy", 15, "Vergleiche Aufklärung, Sturm und Drang, Klassik und Romantik", "Notiere je Epoche Menschenbild, typische Motive und ein sprachliches Merkmal."),
  t("Deutsch", "Literatur um 1800", "struktur", "solo", "Gliederung", "medium", 20, "Ordne eine fiktive Aufgabe einer Epoche zu", "Begründe mit Thema, Figurenbild, Sprache und Weltbild."),
  t("Deutsch", "Literatur um 1800", "abi_training", "klausurnah", "Analyse", "hard", 40, "Plane eine klausurnahe Interpretation um 1800", "Einleitung, Deutungshypothese, Analyseaspekte, Epochenbezug und Schluss."),
  t("Deutsch", "Literatur im 19. Jahrhundert", "recall", "abfrage", "Stichpunkte", "easy", 15, "Wiederhole Realismus und Vormärz", "Nenne zentrale Merkmale, Themen, Gesellschaftsbezug und typische Darstellungsweisen."),
  t("Deutsch", "Literatur im 19. Jahrhundert", "analyse", "solo", "Vergleich", "medium", 25, "Vergleiche zwei Epochenmerkmale des 19. Jahrhunderts", "Stelle Realismus und Vormärz nach Politikbezug, Sprache und Wirklichkeitsdarstellung gegenüber."),
  t("Deutsch", "Literatur im 19. Jahrhundert", "chatgpt_training", "mit_chatgpt", "ChatGPT-Dialog", "easy", 15, "Gehe mit ChatGPT Realismus und Vormärz durch", "Bitte um 5 Prüfungsfragen und beantworte sie ohne Spicken."),
  t("Deutsch", "Literatur im 20./21. Jahrhundert", "recall", "abfrage", "kurze Erklärung", "easy", 15, "Wiederhole Moderne und Gegenwartsliteratur", "Notiere Krisenerfahrung, Erzählweise, Themen und mögliche Deutungsansätze."),
  t("Deutsch", "Literatur im 20./21. Jahrhundert", "analyse", "solo", "Analyse", "medium", 30, "Erstelle eine Deutungshypothese zu einem modernen Textauszug", "Formuliere eine These und drei Belegstellen, die du analysieren würdest."),
  t("Deutsch", "Analyse und Interpretation", "struktur", "schreibplan", "Schreibplan", "medium", 25, "Erstelle einen Schreibplan für eine Interpretationsaufgabe", "Einleitung, Deutungshypothese, Inhaltskern, Analyseaspekte, Synthese, Schluss."),
  t("Deutsch", "Analyse und Interpretation", "analyse", "solo", "Analyse", "medium", 30, "Analysiere einen fiktiven Textauszug in Stichpunkten", "Nutze Inhalt, Figuren, Erzählweise, Sprache und Wirkung als Raster."),
  t("Deutsch", "Analyse und Interpretation", "abi_training", "unter_zeitdruck", "Analyse", "hard", 40, "Schreibe eine klausurnahe Analysegliederung unter Zeitdruck", "Plane in 40 Minuten eine vollständige Struktur mit priorisierten Analyseaspekten."),
  t("Deutsch", "materialgestütztes Schreiben", "struktur", "schreibplan", "Schreibplan", "medium", 30, "Plane eine materialgestützte Schreibaufgabe", "Zieltext, Adressat, These, Materialauswahl, eigene Argumente und Schlussabsicht festlegen."),
  t("Deutsch", "materialgestütztes Schreiben", "anwendung", "solo", "Gliederung", "medium", 25, "Strukturiere Material in Einleitung, Hauptteil, Schluss", "Ordne Materialfunktionen und eigene Argumente in eine klare Schreibstrategie."),
  t("Deutsch", "materialgestütztes Schreiben", "chatgpt_training", "mit_chatgpt", "ChatGPT-Dialog", "medium", 20, "Erstelle mit ChatGPT einen Schreibplan für Material", "Lass dir eine fiktive Aufgabenstellung geben und prüfe die vorgeschlagene Gliederung kritisch."),
  t("Deutsch", "Medien / Film / Theater", "analyse", "solo", "Vergleich", "medium", 25, "Vergleiche Text und Film auf Darstellungsweise", "Nutze Erzählperspektive, Kamera, Montage, Figurenwirkung und Zeitgestaltung."),
  t("Deutsch", "Medien / Film / Theater", "recall", "abfrage", "Stichpunkte", "easy", 10, "Wiederhole filmische und dramatische Mittel", "Definiere Kameraeinstellung, Montage, Regieanweisung, Dialog und Szene."),
  t("Deutsch", "Stilmittel / rhetorische Mittel / Erzähltechnik", "recall", "abfrage", "kurze Erklärung", "easy", 15, "Wiederhole Stilmittel und Wirkung", "Erkläre 8 Mittel mit je einer typischen Wirkung, nicht nur mit Definition."),
  t("Deutsch", "Stilmittel / rhetorische Mittel / Erzähltechnik", "analyse", "solo", "Analyse", "medium", 25, "Analysiere rhetorische Mittel in ihrer Funktion", "Ordne Mittel nach Verstärkung, Emotionalisierung, Strukturierung und Wertung."),
  t("Deutsch", "Stilmittel / rhetorische Mittel / Erzähltechnik", "chatgpt_training", "mit_chatgpt", "ChatGPT-Dialog", "easy", 15, "Trainiere Fachsprache mit ChatGPT", "Lass dir Begriffe abfragen und jeweils eine Wirkung formulieren."),
  t("Deutsch", "Analyse und Interpretation", "abi_training", "klausurnah", "Schreibplan", "hard", 40, "Erstelle eine vollständige Interpretationsplanung", "Plane eine abi-nahe Aufgabe mit Schwerpunkt Sprache, Epoche und Deutung."),
  t("Deutsch", "Sprache und Kommunikation", "abi_training", "klausurnah", "Urteil", "hard", 35, "Erörtere eine Streitfrage zu Sprache und Macht", "Baue These, Gegenposition, Beispiele, Abwägung und Fazit auf."),
  t("Deutsch", "Literatur im 20./21. Jahrhundert", "chatgpt_training", "mit_chatgpt", "ChatGPT-Dialog", "medium", 20, "Lass dich zu Q4 Moderne/Gegenwart abfragen", "Bitte ChatGPT um Rückfragen zu Erzähltechnik, Krisenerfahrung und Deutungshypothesen."),
  t("Mathe", "Analysis", "recall", "abfrage", "kurze Erklärung", "easy", 10, "Erkläre Ableitung, Integral und Nullstelle", "Formuliere Bedeutung, typischen Rechenschritt und eine Kontrollfrage."),
  t("Mathe", "Analysis", "anwendung", "solo", "Rechnung", "medium", 25, "Löse einen kurzen Analysis-Aufgabenblock", "Bearbeite Ableitung, Extremstelle, Wendestelle und Funktionsverhalten an selbstgewählten Beispielen."),
  t("Mathe", "Analysis", "struktur", "schreibplan", "Gliederung", "medium", 20, "Plane den Lösungsweg einer Analysis-Aufgabe", "Notiere gegeben, gesucht, Ansatz, Rechenweg, Kontrolle und Interpretation."),
  t("Mathe", "Analysis", "abi_training", "unter_zeitdruck", "Rechnung", "hard", 30, "Bearbeite einen 30-Minuten-Analysis-Block", "Rechne klausurnah und markiere danach Fehlerquellen."),
  t("Mathe", "Analysis", "chatgpt_training", "mit_chatgpt", "ChatGPT-Dialog", "easy", 15, "Bitte ChatGPT um Kontrollfragen zu Analysis", "Lass dich zu Ableitungen, Integralen und Funktionsverhalten abfragen."),
  t("Mathe", "Stochastik", "recall", "abfrage", "kurze Erklärung", "easy", 10, "Erkläre Binomialverteilung und Erwartungswert", "Nenne Bedingungen, Formelidee und typische Interpretationsfrage."),
  t("Mathe", "Stochastik", "anwendung", "solo", "Rechnung", "medium", 25, "Löse einen kurzen Stochastik-Aufgabenblock", "Bearbeite Baumdiagramm, Gegenereignis, Binomialverteilung und Erwartungswert."),
  t("Mathe", "Stochastik", "struktur", "schreibplan", "Gliederung", "medium", 20, "Plane eine Stochastik-Aufgabe systematisch", "Entscheide Modell, Zufallsvariable, Formel, Rechnung und Antwortsatz."),
  t("Mathe", "Stochastik", "abi_training", "unter_zeitdruck", "Rechnung", "hard", 30, "Mache ein 30-Minuten-Stochastiktraining", "Arbeite zügig, schreibe Antwortsätze und prüfe die Modellannahmen."),
  t("Mathe", "Stochastik", "chatgpt_training", "mit_chatgpt", "ChatGPT-Dialog", "medium", 15, "Mache mit ChatGPT ein Stochastik-Abitraining", "Bitte um kurze Aufgaben mit direkter Korrektur und Rückfrage zum Ansatz."),
  t("Mathe", "analytische Geometrie", "recall", "abfrage", "kurze Erklärung", "easy", 10, "Erkläre Vektor, Gerade, Ebene und Skalarprodukt", "Nenne Bedeutung, Formelidee und typische Anwendung."),
  t("Mathe", "analytische Geometrie", "anwendung", "solo", "Rechnung", "medium", 25, "Löse einen kurzen Geometrie-Aufgabenblock", "Bearbeite Lagebeziehung, Schnittpunkt, Winkel oder Abstand."),
  t("Mathe", "analytische Geometrie", "struktur", "schreibplan", "Gliederung", "medium", 20, "Plane den Lösungsweg einer Geometrie-Aufgabe", "Gegeben, gesucht, Koordinatenansatz, Gleichungssystem, Interpretation, Kontrolle."),
  t("Mathe", "analytische Geometrie", "abi_training", "unter_zeitdruck", "Rechnung", "hard", 30, "Bearbeite einen 30-Minuten-Block analytische Geometrie", "Rechne klausurnah und kontrolliere Einheiten, Parameter und Lagebeziehungen."),
  t("Mathe", "analytische Geometrie", "chatgpt_training", "mit_chatgpt", "ChatGPT-Dialog", "medium", 15, "Bitte ChatGPT um Kontrollfragen zur Geometrie", "Lass dir Lagebeziehungen, Skalarprodukt und Ebenenformen abfragen."),
  t("Mathe", "Abiturtraining", "abi_training", "klausurnah", "Rechnung", "hard", 40, "Löse einen gemischten Mathe-Abi-Block", "Wähle Analysis, Stochastik und Geometrie gemischt; arbeite mit Zeitlimit und Fehlerliste."),
  t("Mathe", "Abiturtraining", "struktur", "schreibplan", "Gliederung", "medium", 20, "Plane eine Mathe-Abituraufgabe vor dem Rechnen", "Notiere gegeben, gesucht, Ansatz, Rechenweg, Kontrolle und Antwortsatz."),
  t("Mathe", "Abiturtraining", "analyse", "solo", "Stichpunkte", "medium", 20, "Mache Fehleranalyse zu einem typischen Rechenweg", "Finde Fehlerursache, korrektes Verfahren und einen Merksatz gegen Wiederholung."),
  t("Mathe", "Abiturtraining", "chatgpt_training", "mit_chatgpt", "ChatGPT-Dialog", "medium", 20, "Simuliere mit ChatGPT ein Mathe-Abitraining", "Bitte um eine Aufgabe, löse selbst, lasse nur Hinweise statt Komplettlösung geben."),
  t("Mathe", "Abiturtraining", "recall", "abfrage", "mündliche Erklärung", "easy", 15, "Erkläre drei typische Abiturverfahren laut", "Wähle je eins aus Analysis, Stochastik und Geometrie und erkläre Ablauf plus Kontrolle."),
  t("Mathe", "Analysis", "analyse", "solo", "Stichpunkte", "medium", 20, "Analysiere das Verhalten einer Funktion ohne volle Rechnung", "Beschreibe Monotonie, Krümmung, Grenzverhalten und Bedeutung möglicher Parameter."),
  t("Mathe", "Stochastik", "analyse", "solo", "Stichpunkte", "medium", 20, "Prüfe, ob ein Zufallsexperiment binomial modellierbar ist", "Entscheide anhand von n, p, Unabhängigkeit und zwei Ausgängen."),
  t("Mathe", "analytische Geometrie", "analyse", "solo", "Stichpunkte", "medium", 20, "Analysiere eine Lagebeziehung ohne Taschenrechner-Fokus", "Entscheide methodisch, welche Gleichungen und Prüfungen nötig sind."),
  t("Mathe", "Abiturtraining", "abi_training", "unter_zeitdruck", "Rechnung", "hard", 30, "Bearbeite einen 30-Minuten-Abi-Trainingsblock", "Wähle einen Schwerpunkt, rechne sauber und schreibe eine kurze Fehlerbilanz."),
];

function q(
  id: string,
  subject: Subject,
  topic: string,
  question: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string,
): MultipleChoiceQuestion {
  const optionIds = ["a", "b", "c", "d"] as const;
  const mapped = options.map((text, index) => ({ id: optionIds[index], text })) as MultipleChoiceQuestion["options"];

  return {
    id,
    type: "daily_quick",
    subject,
    topic,
    question,
    options: mapped,
    correctOptionId: optionIds[correctIndex],
    explanation,
  };
}

export const dailyQuickQuestions: MultipleChoiceQuestion[] = [
  q("pb-01", "PB", "Demokratie", "Was bedeutet Volkssouveränität?", ["Das Volk ist Quelle staatlicher Macht", "Gerichte schreiben Wahlprogramme", "Parteien ersetzen Wahlen", "Nur Expertengremien entscheiden"], 0, "Volkssouveränität bedeutet, dass staatliche Gewalt vom Volk ausgeht."),
  q("pb-02", "PB", "politische Ordnung der BRD", "Welche Funktion hat der Bundesrat?", ["Vertretung der Länder im Gesetzgebungsprozess", "Leitung der Bundesregierung", "Wahl aller Richter", "Festlegung des Leitzinses"], 0, "Der Bundesrat beteiligt die Länder an der Bundesgesetzgebung."),
  q("pb-03", "PB", "Demokratie", "Was schützt die wehrhafte Demokratie?", ["Die freiheitliche demokratische Grundordnung", "Nur wirtschaftliche Freiheit", "Eine Einparteienregierung", "Die Abschaffung von Grundrechten"], 0, "Wehrhafte Demokratie soll ihre eigene Abschaffung verhindern."),
  q("pb-04", "PB", "Wirtschaft", "Was ist Fiskalpolitik?", ["Steuern und Staatsausgaben als Steuerungsinstrumente", "Zinspolitik der Zentralbank", "Urteilsfindung der Gerichte", "Parteienwerbung"], 0, "Fiskalpolitik arbeitet mit Haushalt, Steuern und Ausgaben."),
  q("pb-05", "PB", "EU", "Welche EU-Institution hat häufig das Initiativrecht?", ["Europäische Kommission", "Europäischer Gerichtshof", "NATO", "Bundesverfassungsgericht"], 0, "Die Kommission schlägt viele EU-Rechtsakte vor."),
  q("pb-06", "PB", "Gesellschaft", "Was meint Chancengerechtigkeit?", ["Faire Start- und Beteiligungschancen", "Immer exakt gleiche Ergebnisse", "Nur Belohnung nach Einkommen", "Keine staatliche Verantwortung"], 0, "Chancengerechtigkeit fragt nach fairen Voraussetzungen."),
  q("pb-07", "PB", "internationale Beziehungen", "Was ist das Gewaltverbot im Völkerrecht?", ["Grundsatz gegen militärische Gewalt zwischen Staaten", "Pflicht zur Aufrüstung", "Verbot von Wahlen", "EU-Haushaltsregel"], 0, "Das Gewaltverbot ist ein zentraler Grundsatz der UN-Charta."),
  q("pb-08", "PB", "Methodik / Statistikanalyse", "Was kommt bei einer Statistikanalyse zuerst?", ["Daten sachlich beschreiben", "Sofort ein Urteil formulieren", "Quelle ignorieren", "Nur Meinung notieren"], 0, "Beschreibung kommt vor Deutung und Bewertung."),
  q("pb-09", "PB", "Wirtschaft", "Was beschreibt Protektionismus?", ["Schutz heimischer Wirtschaft durch Handelsschranken", "Freier Handel ohne Grenzen", "Abschaffung von Zöllen", "Private Sozialpolitik"], 0, "Protektionismus nutzt zum Beispiel Zölle oder Quoten."),
  q("pb-10", "PB", "politische Systeme", "Was ist ein Merkmal einer Diktatur?", ["Machtkonzentration und eingeschränkte Opposition", "Freie Konkurrenz um Macht", "Unabhängige Medien ohne Druck", "Regelmäßiger Machtwechsel"], 0, "Diktaturen schränken Opposition und Kontrolle ein."),
  q("de-01", "Deutsch", "Sprache und Kommunikation", "Was bedeutet Framing?", ["Sprachliche Rahmung von Deutung", "Reine Grammatikprüfung", "Metrum eines Gedichts", "Schnitttechnik im Film"], 0, "Framing lenkt Wahrnehmung durch bestimmte Begriffe und Deutungsrahmen."),
  q("de-02", "Deutsch", "Analyse und Interpretation", "Was gehört in eine Deutungshypothese?", ["Eine begründbare Lesart des Textes", "Nur Autorbiografie", "Nur Inhaltsangabe", "Eine unbelegte Meinung"], 0, "Die Deutungshypothese ist eine vorläufige, belegbare Interpretation."),
  q("de-03", "Deutsch", "Stilmittel / rhetorische Mittel / Erzähltechnik", "Was ist eine Anapher?", ["Wiederholung am Satz- oder Versanfang", "Gegensatz in einem Wort", "Klangnachahmung", "Auslassung aller Verben"], 0, "Anaphern wiederholen Anfangsstrukturen."),
  q("de-04", "Deutsch", "Literatur um 1800", "Welche Epoche betont Humanität und Harmonie besonders?", ["Weimarer Klassik", "Naturalismus", "Expressionismus", "Neue Sachlichkeit"], 0, "Die Klassik verbindet Humanität, Maß und Harmonie."),
  q("de-05", "Deutsch", "Literatur im 19. Jahrhundert", "Womit ist der Vormärz stark verbunden?", ["Politischer Kritik und Freiheitsforderung", "Nur Naturmystik", "Regelpoetik der Antike", "Abkehr von Gesellschaft"], 0, "Der Vormärz ist politisch und reformorientiert."),
  q("de-06", "Deutsch", "materialgestütztes Schreiben", "Was ist zentral beim materialgestützten Schreiben?", ["Material funktional nutzen und eigene Struktur bilden", "Material nur abschreiben", "Quellen ignorieren", "Keine eigene These bilden"], 0, "Material wird ausgewertet und in eine eigene Schreibabsicht eingebunden."),
  q("de-07", "Deutsch", "Medien / Film / Theater", "Was kann eine Nahaufnahme im Film leisten?", ["Emotionen und Details hervorheben", "Immer einen Ortswechsel zeigen", "Ton ersetzen", "Alle Figuren gleichzeitig zeigen"], 0, "Nahaufnahmen lenken Aufmerksamkeit auf Mimik und Details."),
  q("de-08", "Deutsch", "Sprache und Kommunikation", "Was meint persuasive Sprache?", ["Sprache, die überzeugen oder beeinflussen soll", "Sprache ohne Wirkung", "Nur Lautschrift", "Nur Rechtschreibung"], 0, "Persuasive Sprache zielt auf Zustimmung oder Handlung."),
  q("de-09", "Deutsch", "Literatur im 20./21. Jahrhundert", "Was passt häufig zur Moderne?", ["Krisenerfahrung und formale Experimente", "Nur höfische Ordnung", "Keine Perspektivwechsel", "Strenge Regelpoetik"], 0, "Moderne Texte reagieren oft auf Umbrüche und experimentieren mit Form."),
  q("de-10", "Deutsch", "Analyse und Interpretation", "Was macht einen guten Textbeleg aus?", ["Textstelle plus Deutung", "Nur Seitenzahl", "Nur Inhaltsangabe", "Nur persönliche Meinung"], 0, "Ein Beleg verbindet Textsignal und interpretierende Aussage."),
  q("ma-01", "Mathe", "Analysis", "Was beschreibt die erste Ableitung?", ["Momentane Änderungsrate", "Fläche unter der Kurve", "Wahrscheinlichkeit", "Länge eines Vektors"], 0, "Die erste Ableitung beschreibt lokale Steigung."),
  q("ma-02", "Mathe", "Analysis", "Was ist eine Nullstelle?", ["Ein x-Wert mit f(x)=0", "Ein y-Wert mit x=0", "Ein Maximum", "Ein Wendepunkt"], 0, "Nullstellen sind Schnittpunkte mit der x-Achse."),
  q("ma-03", "Mathe", "Stochastik", "Wann passt die Binomialverteilung?", ["Feste Anzahl unabhängiger Bernoulli-Versuche", "Unendlich viele Ausgänge ohne Struktur", "Immer bei drei Ergebnissen", "Wenn p unbekannt sein muss"], 0, "Binomialverteilung braucht n, p, zwei Ausgänge und Unabhängigkeit."),
  q("ma-04", "Mathe", "Stochastik", "Was ist der Erwartungswert?", ["Langfristiger Durchschnittswert", "Immer häufigstes Ergebnis", "Immer ganze Zahl", "Die größte Wahrscheinlichkeit"], 0, "Der Erwartungswert ist ein theoretischer Mittelwert."),
  q("ma-05", "Mathe", "analytische Geometrie", "Wann sind Vektoren orthogonal?", ["Wenn ihr Skalarprodukt 0 ist", "Wenn sie gleich lang sind", "Wenn alle Einträge positiv sind", "Wenn sie identisch sind"], 0, "Skalarprodukt 0 zeigt einen rechten Winkel."),
  q("ma-06", "Mathe", "analytische Geometrie", "Was beschreibt ein Richtungsvektor?", ["Die Richtung einer Geraden", "Eine Wahrscheinlichkeit", "Den Flächeninhalt", "Den y-Achsenabschnitt"], 0, "Der Richtungsvektor legt die Richtung der Geraden fest."),
  q("ma-07", "Mathe", "Abiturtraining", "Was gehört zu einer Modellierungsaufgabe?", ["Annahmen, Rechnung und Interpretation im Kontext", "Nur Endergebnis ohne Einheit", "Keine Begründung", "Nur Zeichnung"], 0, "Modellierung verbindet Mathematik mit Kontextdeutung."),
  q("ma-08", "Mathe", "Analysis", "Was zeigt ein Wendepunkt grob?", ["Wechsel des Krümmungsverhaltens", "Immer Maximum", "Immer Nullstelle", "Ende des Definitionsbereichs"], 0, "Am Wendepunkt ändert sich die Krümmung."),
  q("ma-09", "Mathe", "Stochastik", "Welche Formel passt zum Gegenereignis?", ["P(nicht A)=1-P(A)", "P(nicht A)=P(A)+1", "P(nicht A)=0", "P(nicht A)=P(A)^2"], 0, "Ereignis und Gegenereignis ergänzen sich zu 1."),
  q("ma-10", "Mathe", "analytische Geometrie", "Was sind windschiefe Geraden?", ["Nicht parallel und ohne Schnittpunkt im Raum", "Immer identisch", "Immer senkrecht schneidend", "Geraden in einer Ebene"], 0, "Windschiefe Geraden gibt es nur im Raum."),
];

export function createQuestFromTemplate(template: StudyQuestTemplate, index: number): Quest {
  return {
    ...template,
    id: `abi-quest-seed-${index + 1}`,
    status: "open",
    createdAt: new Date().toISOString(),
  };
}
