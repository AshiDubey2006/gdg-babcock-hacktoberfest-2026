import type { Dispatch } from "react";
import { flushSync } from "react-dom";
import { createRubricPointDraft } from "../drafts";
import type { ExamBuilderAction } from "../examBuilderReducer";
import { describedBy, errorId, fieldId, focusField } from "../fieldIds";
import { formatMarks, marksEqual, parseNumber, sumRubricMarks } from "../numbers";
import type { TheoryQuestionDraft } from "../types";
import type { QuestionErrors } from "../validation";
import { TextField, type FieldChangeEvent } from "./TextField";

interface RubricPointsEditorProps {
  question: TheoryQuestionDraft;
  errors?: QuestionErrors;
  dispatch: Dispatch<ExamBuilderAction>;
}

export function RubricPointsEditor({ question, errors, dispatch }: RubricPointsEditorProps) {
  const questionId = question.id;
  const rubricErrorId = errorId(fieldId(questionId, "rubric"));
  const allocationId = fieldId(questionId, "rubric-allocation");
  const allocated = sumRubricMarks(question.rubricPoints);
  const maxMarks = parseNumber(question.maxMarks);
  const balanced = maxMarks !== null && maxMarks > 0 && marksEqual(allocated, maxMarks);

  function addPoint() {
    const point = createRubricPointDraft();
    flushSync(() => dispatch({ type: "rubric/add", questionId, point }));
    focusField(fieldId(questionId, "rubric", point.id, "description"));
  }

  return (
    <fieldset
      className="builder-fieldset"
      aria-describedby={describedBy(allocationId, errors?.rubric && rubricErrorId)}
    >
      <legend>Rubric points</legend>
      <p id={allocationId} className={`rubric-allocation ${balanced ? "is-balanced" : ""}`}>
        {formatMarks(allocated)} / {maxMarks !== null ? formatMarks(maxMarks) : "?"} marks allocated
      </p>
      <ol className="rubric-list">
        {question.rubricPoints.map((point, index) => {
          const pointNumber = index + 1;
          const pointId = (field: string) => fieldId(questionId, "rubric", point.id, field);
          const pointErrors = errors?.rubricPoints?.[point.id];
          const update = (field: "description" | "marks" | "keywords") => (e: FieldChangeEvent) =>
            dispatch({ type: "rubric/update", questionId, pointId: point.id, field, value: e.target.value });

          return (
            <li key={point.id} className="rubric-row">
              <TextField
                id={pointId("description")}
                label={`Point ${pointNumber} description`}
                value={point.description}
                onChange={update("description")}
                error={pointErrors?.description}
                placeholder="Explains normalisation with an example"
                required
              />
              <TextField
                id={pointId("marks")}
                label={`Point ${pointNumber} marks`}
                value={point.marks}
                onChange={update("marks")}
                error={pointErrors?.marks}
                extraDescribedBy={errors?.rubric ? rubricErrorId : undefined}
                type="number"
                min={0}
                step="any"
                required
              />
              <TextField
                id={pointId("keywords")}
                label={`Point ${pointNumber} keywords`}
                value={point.keywords}
                onChange={update("keywords")}
                hint="Optional. Separate with commas."
                placeholder="1NF, redundancy"
              />
              <button
                type="button"
                className="builder-ghost-button"
                onClick={() => dispatch({ type: "rubric/remove", questionId, pointId: point.id })}
                aria-label={`Remove rubric point ${pointNumber}`}
              >
                Remove
              </button>
            </li>
          );
        })}
      </ol>
      {errors?.rubric && (
        <p id={rubricErrorId} className="field-error">
          {errors.rubric}
        </p>
      )}
      <button
        type="button"
        id={fieldId(questionId, "add-rubric-point")}
        className="builder-secondary-button"
        onClick={addPoint}
      >
        Add rubric point
      </button>
    </fieldset>
  );
}
