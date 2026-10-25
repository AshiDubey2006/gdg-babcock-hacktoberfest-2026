interface SingleChoiceQuestionProps {
  questionId: string;
  question: string;
  options: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SingleChoiceQuestion({
  questionId,
  question,
  options,
  value,
  onChange,
  disabled = false,
}: SingleChoiceQuestionProps) {
  return (
    <fieldset className="single-choice-question" disabled={disabled}>
      <legend className="single-choice-prompt">{question}</legend>
      <div className="single-choice-options">
        {options.map((option, index) => {
          const optionId = `${questionId}-option-${index + 1}`;
          const selected = value === option;

          return (
            <label
              className={`single-choice-option${selected ? " is-selected" : ""}`}
              htmlFor={optionId}
              key={optionId}
            >
              <input
                id={optionId}
                type="radio"
                name={questionId}
                value={option}
                checked={selected}
                onChange={() => onChange(option)}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
