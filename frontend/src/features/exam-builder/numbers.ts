import type { QuestionDraft, RubricPointDraft } from "./types";

const MARKS_EPSILON = 1e-6;

export function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function marksEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < MARKS_EPSILON;
}

export function formatMarks(value: number): string {
  return String(Math.round(value * 100) / 100);
}

export function sumRubricMarks(points: RubricPointDraft[]): number {
  return points.reduce((total, point) => total + (parseNumber(point.marks) ?? 0), 0);
}

export function sumQuestionMarks(questions: QuestionDraft[]): number {
  return questions.reduce((total, question) => total + (parseNumber(question.maxMarks) ?? 0), 0);
}
