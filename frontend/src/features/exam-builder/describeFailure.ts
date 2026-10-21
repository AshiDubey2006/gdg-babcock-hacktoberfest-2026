import type { ApiError } from "../../api";
import { QuestionCreationError } from "./createExam";

export interface FailureDescription {
  title: string;
  detail: string;
}

function asSentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function savedQuestionsText(saved: number): string {
  if (saved === 0) return "no questions were saved";
  if (saved === 1) return "question 1 was saved";
  return `questions 1 to ${saved} were saved`;
}

export function describeFailure(err: unknown, questionCount: number): FailureDescription {
  if (err instanceof QuestionCreationError) {
    return {
      title: `Question ${err.questionNumber} of ${questionCount} could not be saved`,
      detail:
        `The exam was created as a draft (ID ${err.examId}) and ` +
        `${savedQuestionsText(err.questionNumber - 1)}. ${asSentence(err.message)} ` +
        "Submitting again will create a second exam.",
    };
  }

  const apiError = err as ApiError;
  return {
    title: "The exam could not be created",
    detail: apiError.message || "An unexpected error occurred. Please try again.",
  };
}
