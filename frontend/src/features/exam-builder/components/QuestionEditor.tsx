import type { Dispatch } from "react";
import { QUESTION_TYPES, QUESTION_TYPE_LABELS, createTypeFields, isQuestionType } from "../drafts";
import type { ExamBuilderAction } from "../examBuilderReducer";
import { fieldId } from "../fieldIds";
import type { QuestionDraft } from "../types";
import type { QuestionErrors } from "../validation";
import { ObjectiveOptionsEditor } from "./ObjectiveOptionsEditor";
import { RubricPointsEditor } from "./RubricPointsEditor";
import { TextField } from "./TextField";

interface QuestionEditorProps {
  question: QuestionDraft;
  questionNumber: number;
  errors?: QuestionErrors;
  dispatch: Dispatch<ExamBuilderAction>;
}

export function QuestionEditor({ question, questionNumber, errors, dispatch }: QuestionEditorProps) {
  const questionId = question.id;
  const headingId = fieldId(questionId, "heading");
  const typeId = fieldId(questionId, "type");

  function changeType(value: string) {
    if (!isQuestionType(value)) return;
    dispatch({ type: "question/changeType", questionId, fields: createTypeFields(value) });
  }

  return (
    <section className="question-card" aria-labelledby={headingId}>
      <div className="question-card-header">
        <h3 id={headingId}>
          Question {questionNumber}
          <span className="question-type-tag">{QUESTION_TYPE_LABELS[question.type]}</span>
        </h3>
        <button
          type="button"
          className="builder-ghost-button"
          onClick={() => dispatch({ type: "question/remove", questionId })}
          aria-label={`Remove question ${questionNumber}`}
        >
          Remove
        </button>
      </div>

      <div className="question-meta">
        <div className="form-group">
          <label htmlFor={typeId}>Question type</label>
          <select
            id={typeId}
            value={question.type}
            onChange={(e) => changeType(e.target.value)}
            aria-describedby={`${typeId}-hint`}
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {QUESTION_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <span id={`${typeId}-hint`} className="field-hint">
            Changing the type clears its options, answer or rubric.
          </span>
        </div>
        <TextField
          id={fieldId(questionId, "max-marks")}
          label="Marks"
          value={question.maxMarks}
          onChange={(e) => dispatch({ type: "question/update", questionId, field: "maxMarks", value: e.target.value })}
          error={errors?.maxMarks}
          type="number"
          min={0}
          step="any"
          required
        />
      </div>

      <TextField
        id={fieldId(questionId, "text")}
        label="Question text"
        value={question.text}
        onChange={(e) => dispatch({ type: "question/update", questionId, field: "text", value: e.target.value })}
        error={errors?.text}
        multiline
        required
      />

      {question.type === "objective" && (
        <ObjectiveOptionsEditor question={question} errors={errors} dispatch={dispatch} />
      )}
      {question.type === "short" && (
        <TextField
          id={fieldId(questionId, "model-answer")}
          label="Model answer"
          value={question.modelAnswer}
          onChange={(e) => dispatch({ type: "question/updateModelAnswer", questionId, value: e.target.value })}
          error={errors?.modelAnswer}
          hint="Used as the reference when grading."
          multiline
          required
        />
      )}
      {question.type === "theory" && (
        <RubricPointsEditor question={question} errors={errors} dispatch={dispatch} />
      )}
    </section>
  );
}
