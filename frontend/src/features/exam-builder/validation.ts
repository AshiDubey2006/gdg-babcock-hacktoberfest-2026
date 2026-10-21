import { formatMarks, marksEqual, parseNumber, sumRubricMarks } from "./numbers";
import type { ExamDraft, ObjectiveQuestionDraft, QuestionDraft, TheoryQuestionDraft } from "./types";

export const TITLE_MAX_LENGTH = 200;
export const MIN_OPTIONS = 2;

export interface RubricPointErrors {
  description?: string;
  marks?: string;
}

export interface QuestionErrors {
  text?: string;
  maxMarks?: string;
  options?: string;
  optionItems?: Record<string, string>;
  correctOption?: string;
  modelAnswer?: string;
  rubric?: string;
  rubricPoints?: Record<string, RubricPointErrors>;
}

export interface ExamDraftErrors {
  title?: string;
  durationMin?: string;
  questions?: string;
  byQuestion: Record<string, QuestionErrors>;
}

export interface ExamDraftValidation {
  errors: ExamDraftErrors;
  isValid: boolean;
}

function hasEntries(record: object): boolean {
  return Object.keys(record).length > 0;
}

function validateObjective(question: ObjectiveQuestionDraft, errors: QuestionErrors): void {
  const optionItems: Record<string, string> = {};
  const seen = new Set<string>();

  for (const option of question.options) {
    const normalised = option.text.trim().toLowerCase();
    if (!normalised) {
      optionItems[option.id] = "Option text is required.";
    } else if (seen.has(normalised)) {
      optionItems[option.id] = "Each option must be different.";
    }
    seen.add(normalised);
  }

  if (question.options.length < MIN_OPTIONS) {
    errors.options = `Add at least ${MIN_OPTIONS} options.`;
  }
  if (hasEntries(optionItems)) {
    errors.optionItems = optionItems;
  }
  if (!question.options.some((option) => option.id === question.correctOptionId)) {
    errors.correctOption = "Select the correct option.";
  }
}

function validateTheory(
  question: TheoryQuestionDraft,
  maxMarks: number | null,
  errors: QuestionErrors,
): void {
  const rubricPoints: Record<string, RubricPointErrors> = {};

  for (const point of question.rubricPoints) {
    const pointErrors: RubricPointErrors = {};
    if (!point.description.trim()) {
      pointErrors.description = "Describe what earns these marks.";
    }
    const marks = parseNumber(point.marks);
    if (marks === null || marks <= 0) {
      pointErrors.marks = "Enter marks greater than 0.";
    }
    if (hasEntries(pointErrors)) {
      rubricPoints[point.id] = pointErrors;
    }
  }

  if (hasEntries(rubricPoints)) {
    errors.rubricPoints = rubricPoints;
  }

  if (question.rubricPoints.length === 0) {
    errors.rubric = "Add at least one rubric point.";
  } else if (maxMarks !== null && maxMarks > 0) {
    const total = sumRubricMarks(question.rubricPoints);
    if (!marksEqual(total, maxMarks)) {
      errors.rubric = `Rubric points total ${formatMarks(total)} of ${formatMarks(maxMarks)} marks.`;
    }
  }
}

function validateQuestion(question: QuestionDraft): QuestionErrors {
  const errors: QuestionErrors = {};

  if (!question.text.trim()) {
    errors.text = "Question text is required.";
  }
  const maxMarks = parseNumber(question.maxMarks);
  if (maxMarks === null || maxMarks <= 0) {
    errors.maxMarks = "Enter marks greater than 0.";
  }

  switch (question.type) {
    case "objective":
      validateObjective(question, errors);
      break;
    case "short":
      if (!question.modelAnswer.trim()) {
        errors.modelAnswer = "A model answer is required.";
      }
      break;
    case "theory":
      validateTheory(question, maxMarks, errors);
      break;
  }

  return errors;
}

export function validateExamDraft(draft: ExamDraft): ExamDraftValidation {
  const errors: ExamDraftErrors = { byQuestion: {} };

  const title = draft.title.trim();
  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`;
  }

  const duration = parseNumber(draft.durationMin);
  if (duration === null || !Number.isInteger(duration) || duration <= 0) {
    errors.durationMin = "Enter a whole number of minutes greater than 0.";
  }

  if (draft.questions.length === 0) {
    errors.questions = "Add at least one question.";
  }

  for (const question of draft.questions) {
    const questionErrors = validateQuestion(question);
    if (hasEntries(questionErrors)) {
      errors.byQuestion[question.id] = questionErrors;
    }
  }

  const isValid =
    !errors.title && !errors.durationMin && !errors.questions && !hasEntries(errors.byQuestion);

  return { errors, isValid };
}
