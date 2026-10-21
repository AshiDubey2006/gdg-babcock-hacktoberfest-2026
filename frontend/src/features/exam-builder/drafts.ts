import type {
  ExamDraft,
  OptionDraft,
  QuestionDraft,
  QuestionType,
  QuestionTypeFields,
  RubricPointDraft,
} from "./types";

export const QUESTION_TYPES: readonly QuestionType[] = ["objective", "short", "theory"];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  objective: "Objective",
  short: "Short answer",
  theory: "Theory",
};

export function isQuestionType(value: string): value is QuestionType {
  return (QUESTION_TYPES as readonly string[]).includes(value);
}

export function createOptionDraft(): OptionDraft {
  return { id: crypto.randomUUID(), text: "" };
}

export function createRubricPointDraft(): RubricPointDraft {
  return { id: crypto.randomUUID(), description: "", marks: "", keywords: "" };
}

export function createTypeFields(type: QuestionType): QuestionTypeFields {
  switch (type) {
    case "objective":
      return {
        type,
        options: [createOptionDraft(), createOptionDraft()],
        correctOptionId: null,
      };
    case "short":
      return { type, modelAnswer: "" };
    case "theory":
      return { type, rubricPoints: [createRubricPointDraft()] };
  }
}

export function createQuestionDraft(type: QuestionType): QuestionDraft {
  return { id: crypto.randomUUID(), text: "", maxMarks: "", ...createTypeFields(type) };
}

export function createExamDraft(): ExamDraft {
  return { title: "", description: "", durationMin: "", questions: [] };
}
