import { API_BASE_URL, getStoredToken, parseApiError, type ApiError } from "../../api";
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

function authHeaders(): Record<string, string> {
  try {
    return { Authorization: `Bearer ${getStoredToken()}` };
  } catch {
    return {};
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    });
  } catch {
    throw {
      message: "Please check your connection",
    } as ApiError;
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as T;
}

export async function createExam(payload: ExamBuilderPayload): Promise<CreatedExam> {
  const exam = await postJson<CreatedExam>("/exams", payload.exam);

  for (const [index, question] of payload.questions.entries()) {
    try {
      await postJson<unknown>(`/exams/${exam.id}/questions`, question);
    } catch (err: unknown) {
      throw new QuestionCreationError(exam.id, index + 1, err as ApiError);
    }
  }

  return exam;
}
