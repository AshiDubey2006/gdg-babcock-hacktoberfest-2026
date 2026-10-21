import type {
  ExamDraft,
  ObjectiveQuestionDraft,
  OptionDraft,
  QuestionDraft,
  QuestionTypeFields,
  RubricPointDraft,
  TheoryQuestionDraft,
} from "./types";

type ExamField = "title" | "description" | "durationMin";
type QuestionField = "text" | "maxMarks";
type RubricPointField = "description" | "marks" | "keywords";

export type ExamBuilderAction =
  | { type: "exam/update"; field: ExamField; value: string }
  | { type: "exam/reset"; draft: ExamDraft }
  | { type: "question/add"; question: QuestionDraft }
  | { type: "question/remove"; questionId: string }
  | { type: "question/update"; questionId: string; field: QuestionField; value: string }
  | { type: "question/changeType"; questionId: string; fields: QuestionTypeFields }
  | { type: "question/updateModelAnswer"; questionId: string; value: string }
  | { type: "option/add"; questionId: string; option: OptionDraft }
  | { type: "option/remove"; questionId: string; optionId: string }
  | { type: "option/update"; questionId: string; optionId: string; value: string }
  | { type: "option/setCorrect"; questionId: string; optionId: string }
  | { type: "rubric/add"; questionId: string; point: RubricPointDraft }
  | { type: "rubric/remove"; questionId: string; pointId: string }
  | {
      type: "rubric/update";
      questionId: string;
      pointId: string;
      field: RubricPointField;
      value: string;
    };

function findQuestion(state: ExamDraft, questionId: string): QuestionDraft | undefined {
  return state.questions.find((question) => question.id === questionId);
}

function findObjective(state: ExamDraft, questionId: string): ObjectiveQuestionDraft | undefined {
  const question = findQuestion(state, questionId);
  return question?.type === "objective" ? question : undefined;
}

function findTheory(state: ExamDraft, questionId: string): TheoryQuestionDraft | undefined {
  const question = findQuestion(state, questionId);
  return question?.type === "theory" ? question : undefined;
}

function replaceQuestion(state: ExamDraft, next: QuestionDraft | undefined): ExamDraft {
  if (!next) return state;
  return {
    ...state,
    questions: state.questions.map((question) => (question.id === next.id ? next : question)),
  };
}

export function examBuilderReducer(state: ExamDraft, action: ExamBuilderAction): ExamDraft {
  switch (action.type) {
    case "exam/update":
      return { ...state, [action.field]: action.value };
    case "exam/reset":
      return action.draft;
    case "question/add":
      return { ...state, questions: [...state.questions, action.question] };
    case "question/remove":
      return {
        ...state,
        questions: state.questions.filter((question) => question.id !== action.questionId),
      };
    case "question/update": {
      const question = findQuestion(state, action.questionId);
      return replaceQuestion(state, question && { ...question, [action.field]: action.value });
    }
    case "question/changeType": {
      const question = findQuestion(state, action.questionId);
      if (!question || question.type === action.fields.type) return state;
      return replaceQuestion(state, {
        id: question.id,
        text: question.text,
        maxMarks: question.maxMarks,
        ...action.fields,
      });
    }
    case "question/updateModelAnswer": {
      const question = findQuestion(state, action.questionId);
      if (question?.type !== "short") return state;
      return replaceQuestion(state, { ...question, modelAnswer: action.value });
    }
    case "option/add": {
      const question = findObjective(state, action.questionId);
      return replaceQuestion(
        state,
        question && { ...question, options: [...question.options, action.option] },
      );
    }
    case "option/remove": {
      const question = findObjective(state, action.questionId);
      return replaceQuestion(
        state,
        question && {
          ...question,
          options: question.options.filter((option) => option.id !== action.optionId),
          correctOptionId:
            question.correctOptionId === action.optionId ? null : question.correctOptionId,
        },
      );
    }
    case "option/update": {
      const question = findObjective(state, action.questionId);
      return replaceQuestion(
        state,
        question && {
          ...question,
          options: question.options.map((option) =>
            option.id === action.optionId ? { ...option, text: action.value } : option,
          ),
        },
      );
    }
    case "option/setCorrect": {
      const question = findObjective(state, action.questionId);
      return replaceQuestion(state, question && { ...question, correctOptionId: action.optionId });
    }
    case "rubric/add": {
      const question = findTheory(state, action.questionId);
      return replaceQuestion(
        state,
        question && { ...question, rubricPoints: [...question.rubricPoints, action.point] },
      );
    }
    case "rubric/remove": {
      const question = findTheory(state, action.questionId);
      return replaceQuestion(
        state,
        question && {
          ...question,
          rubricPoints: question.rubricPoints.filter((point) => point.id !== action.pointId),
        },
      );
    }
    case "rubric/update": {
      const question = findTheory(state, action.questionId);
      return replaceQuestion(
        state,
        question && {
          ...question,
          rubricPoints: question.rubricPoints.map((point) =>
            point.id === action.pointId ? { ...point, [action.field]: action.value } : point,
          ),
        },
      );
    }
  }
}
