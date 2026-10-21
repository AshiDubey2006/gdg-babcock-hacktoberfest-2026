export type QuestionType = "objective" | "short" | "theory";

export interface OptionDraft {
  id: string;
  text: string;
}

export interface RubricPointDraft {
  id: string;
  description: string;
  marks: string;
  keywords: string;
}

export type QuestionTypeFields =
  | { type: "objective"; options: OptionDraft[]; correctOptionId: string | null }
  | { type: "short"; modelAnswer: string }
  | { type: "theory"; rubricPoints: RubricPointDraft[] };

export type QuestionDraft = {
  id: string;
  text: string;
  maxMarks: string;
} & QuestionTypeFields;

export type ObjectiveQuestionDraft = Extract<QuestionDraft, { type: "objective" }>;
export type TheoryQuestionDraft = Extract<QuestionDraft, { type: "theory" }>;

export interface ExamDraft {
  title: string;
  description: string;
  durationMin: string;
  questions: QuestionDraft[];
}

export interface ExamCreatePayload {
  title: string;
  description: string;
  duration_min: number;
}

export interface RubricPointPayload {
  description: string;
  marks: number;
  keywords: string[];
}

export interface QuestionPayload {
  type: QuestionType;
  text: string;
  max_marks: number;
  options: string[] | null;
  correct_option: string | null;
  model_answer: string | null;
  rubric_points: RubricPointPayload[];
}

export interface ExamBuilderPayload {
  exam: ExamCreatePayload;
  questions: QuestionPayload[];
}

export interface CreatedExam {
  id: number;
  title: string;
  description: string;
  duration_min: number;
  status: string;
}
