import { dailyQuickQuestConfig } from "../data/balancing";
import type { DailyQuickQuestState, MultipleChoiceQuestion } from "../types";

interface DailyQuickQuestCardProps {
  question: MultipleChoiceQuestion;
  state?: DailyQuickQuestState;
  compact?: boolean;
  onAnswer: (question: MultipleChoiceQuestion, optionId: string) => void;
}

export function DailyQuickQuestCard({ question, state, compact = false, onAnswer }: DailyQuickQuestCardProps) {
  const answered = Boolean(state?.answeredAt);
  const isCorrect = state?.status === "correct";
  const correctAnswer = question.options.find((option) => option.id === question.correctOptionId)?.text;

  return (
    <article className={`daily-quick-card ${answered ? "daily-quick-card--answered" : ""} ${compact ? "daily-quick-card--compact" : ""}`}>
      <div className="daily-quick-card__header">
        <span className="subject-badge">{question.subject}</span>
        <span className="topic-badge">{question.topic}</span>
        {answered ? (
          <span className={`quick-result quick-result--${isCorrect ? "correct" : "incorrect"}`}>
            {isCorrect ? "Richtig" : "Nicht richtig"}
          </span>
        ) : (
          <span className="quick-result">Daily</span>
        )}
      </div>

      <h3>{question.question}</h3>
      <div className="answer-grid" aria-label="Antwortmoeglichkeiten">
        {question.options.map((option) => {
          const selected = state?.selectedOptionId === option.id;
          const correctOption = question.correctOptionId === option.id;
          const className = [
            "answer-button",
            answered && selected ? "answer-button--selected" : "",
            answered && correctOption ? "answer-button--correct" : "",
            answered && selected && !correctOption ? "answer-button--incorrect" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              className={className}
              key={option.id}
              type="button"
              disabled={answered}
              onClick={() => onAnswer(question, option.id)}
            >
              <strong>{option.id.toUpperCase()}</strong>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>

      {answered ? (
        <div className={`daily-quick-feedback ${isCorrect ? "daily-quick-feedback--correct" : "daily-quick-feedback--incorrect"}`}>
          <strong>{isCorrect ? `+${dailyQuickQuestConfig.correctCoins} Coins, +${dailyQuickQuestConfig.correctXp} XP` : "0 Coins"}</strong>
          {!isCorrect && correctAnswer ? <span>Richtig wäre: {correctAnswer}</span> : null}
          <p>{question.explanation}</p>
        </div>
      ) : (
        <p className="daily-quick-hint">Kurz beantworten. Genau eine Antwort ist richtig.</p>
      )}
    </article>
  );
}
