import type { ExamDraft } from "./types";
import type { ExamDraftErrors } from "./validation";

export function fieldId(...parts: string[]): string {
  return ["exam-builder", ...parts].join("-");
}

export function errorId(id: string): string {
  return `${id}-error`;
}

export function describedBy(...ids: (string | false | undefined)[]): string | undefined {
  const present = ids.filter(Boolean);
  return present.length > 0 ? present.join(" ") : undefined;
}

export function focusField(id: string): void {
  document.getElementById(id)?.focus();
}

export const ADD_QUESTION_ID = fieldId("add-question");

export function firstInvalidFieldId(draft: ExamDraft, errors: ExamDraftErrors): string | null {
  if (errors.title) return fieldId("title");
  if (errors.durationMin) return fieldId("duration");
  if (errors.questions) return ADD_QUESTION_ID;

  for (const question of draft.questions) {
    const questionErrors = errors.byQuestion[question.id];
    if (!questionErrors) continue;
    const qid = question.id;

    if (questionErrors.text) return fieldId(qid, "text");
    if (questionErrors.maxMarks) return fieldId(qid, "max-marks");

    switch (question.type) {
      case "objective": {
        const invalidOption = question.options.find((option) => questionErrors.optionItems?.[option.id]);
        if (invalidOption) return fieldId(qid, "option", invalidOption.id);
        if (questionErrors.options) return fieldId(qid, "add-option");
        if (questionErrors.correctOption && question.options.length > 0) {
          return fieldId(qid, "correct", question.options[0].id);
        }
        break;
      }
      case "short":
        if (questionErrors.modelAnswer) return fieldId(qid, "model-answer");
        break;
      case "theory": {
        for (const point of question.rubricPoints) {
          const pointErrors = questionErrors.rubricPoints?.[point.id];
          if (pointErrors?.description) return fieldId(qid, "rubric", point.id, "description");
          if (pointErrors?.marks) return fieldId(qid, "rubric", point.id, "marks");
        }
        if (questionErrors.rubric) {
          const [firstPoint] = question.rubricPoints;
          return firstPoint
            ? fieldId(qid, "rubric", firstPoint.id, "marks")
            : fieldId(qid, "add-rubric-point");
        }
        break;
      }
    }
  }

  return null;
}
