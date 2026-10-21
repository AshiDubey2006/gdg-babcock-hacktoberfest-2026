import type { ExamBuilderPayload, ExamDraft, QuestionDraft, QuestionPayload } from "./types";

export function splitKeywords(value: string): string[] {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function toQuestionPayload(question: QuestionDraft): QuestionPayload {
  const base = {
    type: question.type,
    text: question.text.trim(),
    max_marks: Number(question.maxMarks.trim()),
    options: null,
    correct_option: null,
    model_answer: null,
    rubric_points: [],
  };

  switch (question.type) {
    case "objective": {
      const correct = question.options.find((option) => option.id === question.correctOptionId);
      return {
        ...base,
        options: question.options.map((option) => option.text.trim()),
        correct_option: correct ? correct.text.trim() : null,
      };
    }
    case "short":
      return { ...base, model_answer: question.modelAnswer.trim() };
    case "theory":
      return {
        ...base,
        rubric_points: question.rubricPoints.map((point) => ({
          description: point.description.trim(),
          marks: Number(point.marks.trim()),
          keywords: splitKeywords(point.keywords),
        })),
      };
  }
}

export function toPayload(draft: ExamDraft): ExamBuilderPayload {
  return {
    exam: {
      title: draft.title.trim(),
      description: draft.description.trim(),
      duration_min: Number(draft.durationMin.trim()),
    },
    questions: draft.questions.map(toQuestionPayload),
  };
}
