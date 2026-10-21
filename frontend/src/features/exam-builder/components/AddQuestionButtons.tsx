import type { Dispatch } from "react";
import { flushSync } from "react-dom";
import { QUESTION_TYPES, QUESTION_TYPE_LABELS, createQuestionDraft } from "../drafts";
import type { ExamBuilderAction } from "../examBuilderReducer";
import { ADD_QUESTION_ID, describedBy, errorId, fieldId, focusField } from "../fieldIds";
import type { QuestionType } from "../types";

interface AddQuestionButtonsProps {
  error?: string;
  dispatch: Dispatch<ExamBuilderAction>;
}

export function AddQuestionButtons({ error, dispatch }: AddQuestionButtonsProps) {
  function addQuestion(type: QuestionType) {
    const question = createQuestionDraft(type);
    flushSync(() => dispatch({ type: "question/add", question }));
    focusField(fieldId(question.id, "text"));
  }

  return (
    <div className="add-question">
      <div className="add-question-buttons" role="group" aria-label="Add a question">
        {QUESTION_TYPES.map((type, index) => (
          <button
            key={type}
            type="button"
            id={index === 0 ? ADD_QUESTION_ID : undefined}
            className="builder-secondary-button"
            onClick={() => addQuestion(type)}
            aria-describedby={describedBy(error && errorId(ADD_QUESTION_ID))}
          >
            Add {QUESTION_TYPE_LABELS[type].toLowerCase()} question
          </button>
        ))}
      </div>
      {error && (
        <p id={errorId(ADD_QUESTION_ID)} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
