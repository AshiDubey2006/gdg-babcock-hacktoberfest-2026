import { toApiError, type ApiError } from "../../lib/apiError";
import { http, unwrap } from "../../lib/http";
import type { CreatedExam, ExamBuilderPayload } from "./types";

export class QuestionCreationError extends Error {
  readonly examId: number;
  readonly questionNumber: number;
  readonly apiError: ApiError;

  constructor(examId: number, questionNumber: number, apiError: ApiError) {
    super(apiError.message);
    this.name = "QuestionCreationError";
    this.examId = examId;
    this.questionNumber = questionNumber;
    this.apiError = apiError;
  }
}

export async function createExam(payload: ExamBuilderPayload): Promise<CreatedExam> {
  const exam = await unwrap(http.post<CreatedExam>("/exams", payload.exam));

  for (const [index, question] of payload.questions.entries()) {
    try {
      await http.post(`/exams/${exam.id}/questions`, question);
    } catch (err: unknown) {
      throw new QuestionCreationError(exam.id, index + 1, toApiError(err));
    }
  }

  return exam;
}
