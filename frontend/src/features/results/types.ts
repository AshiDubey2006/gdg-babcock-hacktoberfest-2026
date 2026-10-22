export interface GradeResult {
  id: number;
  answer_id: number;
  score: number;
  feedback: string;
  evidence: string[];
  graded_by: string;
  needs_review: boolean;
}

export interface AnswerResult {
  question_id: number;
  question: string;
  response: string;
  max_marks: number;
  grade: GradeResult | null;
}

export interface SubmissionResult {
  submission_id: number;
  exam_id: number;
  exam_title: string;
  submitted_at: string;
  answers: AnswerResult[];
}
