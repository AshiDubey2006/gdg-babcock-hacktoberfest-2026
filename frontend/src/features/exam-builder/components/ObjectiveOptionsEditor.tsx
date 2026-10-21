import type { Dispatch } from "react";
import { flushSync } from "react-dom";
import { createOptionDraft } from "../drafts";
import type { ExamBuilderAction } from "../examBuilderReducer";
import { describedBy, errorId, fieldId, focusField } from "../fieldIds";
import type { ObjectiveQuestionDraft } from "../types";
import type { QuestionErrors } from "../validation";
import { TextField } from "./TextField";

interface ObjectiveOptionsEditorProps {
  question: ObjectiveQuestionDraft;
  errors?: QuestionErrors;
  dispatch: Dispatch<ExamBuilderAction>;
}

export function ObjectiveOptionsEditor({ question, errors, dispatch }: ObjectiveOptionsEditorProps) {
  const questionId = question.id;
  const optionsErrorId = errorId(fieldId(questionId, "options"));
  const correctErrorId = errorId(fieldId(questionId, "correct"));

  function addOption() {
    const option = createOptionDraft();
    flushSync(() => dispatch({ type: "option/add", questionId, option }));
    focusField(fieldId(questionId, "option", option.id));
  }

  return (
    <fieldset
      className="builder-fieldset"
      aria-describedby={describedBy(errors?.options && optionsErrorId)}
    >
      <legend>Options</legend>
      <p className="field-hint">Select the radio button beside the correct answer.</p>
      <ul className="option-list">
        {question.options.map((option, index) => {
          const optionNumber = index + 1;
          return (
            <li key={option.id} className="option-row">
              <input
                type="radio"
                id={fieldId(questionId, "correct", option.id)}
                name={fieldId(questionId, "correct")}
                checked={question.correctOptionId === option.id}
                onChange={() => dispatch({ type: "option/setCorrect", questionId, optionId: option.id })}
                aria-label={`Option ${optionNumber} is the correct answer`}
                aria-invalid={Boolean(errors?.correctOption)}
                aria-describedby={describedBy(errors?.correctOption && correctErrorId)}
              />
              <TextField
                id={fieldId(questionId, "option", option.id)}
                label={`Option ${optionNumber}`}
                value={option.text}
                onChange={(e) =>
                  dispatch({ type: "option/update", questionId, optionId: option.id, value: e.target.value })
                }
                error={errors?.optionItems?.[option.id]}
                required
              />
              <button
                type="button"
                className="builder-ghost-button"
                onClick={() => dispatch({ type: "option/remove", questionId, optionId: option.id })}
                aria-label={`Remove option ${optionNumber}`}
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
      {errors?.options && (
        <p id={optionsErrorId} className="field-error">
          {errors.options}
        </p>
      )}
      {errors?.correctOption && (
        <p id={correctErrorId} className="field-error">
          {errors.correctOption}
        </p>
      )}
      <button
        type="button"
        id={fieldId(questionId, "add-option")}
        className="builder-secondary-button"
        onClick={addOption}
      >
        Add option
      </button>
    </fieldset>
  );
}
