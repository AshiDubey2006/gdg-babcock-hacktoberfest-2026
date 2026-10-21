import { useReducer, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { AddQuestionButtons } from "../features/exam-builder/components/AddQuestionButtons";
import {
  EXAM_CREATED_HEADING_ID,
  ExamCreatedNotice,
} from "../features/exam-builder/components/ExamCreatedNotice";
import { ExamDetailsEditor } from "../features/exam-builder/components/ExamDetailsEditor";
import { ExamSummary } from "../features/exam-builder/components/ExamSummary";
import { QuestionEditor } from "../features/exam-builder/components/QuestionEditor";
import { createExam } from "../features/exam-builder/createExam";
import { describeFailure, type FailureDescription } from "../features/exam-builder/describeFailure";
import { createExamDraft } from "../features/exam-builder/drafts";
import { examBuilderReducer } from "../features/exam-builder/examBuilderReducer";
import { firstInvalidFieldId, focusField } from "../features/exam-builder/fieldIds";
import { sumQuestionMarks } from "../features/exam-builder/numbers";
import { toPayload } from "../features/exam-builder/toPayload";
import type { CreatedExam } from "../features/exam-builder/types";
import { validateExamDraft } from "../features/exam-builder/validation";

type SubmitStatus =
  | { kind: "editing" }
  | { kind: "submitting" }
  | { kind: "failed"; failure: FailureDescription }
  | { kind: "created"; exam: CreatedExam; questionCount: number };

const FAILURE_BANNER_ID = "exam-builder-failure";

export function AdminExamBuilderPage() {
  const [draft, dispatch] = useReducer(examBuilderReducer, undefined, createExamDraft);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>({ kind: "editing" });

  const validation = validateExamDraft(draft);
  const errors = submitAttempted ? validation.errors : undefined;
  const submitting = status.kind === "submitting";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!validation.isValid) {
      flushSync(() => {
        setSubmitAttempted(true);
        setStatus({ kind: "editing" });
      });
      const target = firstInvalidFieldId(draft, validation.errors);
      if (target) focusField(target);
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const exam = await createExam(toPayload(draft));
      flushSync(() => setStatus({ kind: "created", exam, questionCount: draft.questions.length }));
      focusField(EXAM_CREATED_HEADING_ID);
    } catch (err: unknown) {
      flushSync(() =>
        setStatus({ kind: "failed", failure: describeFailure(err, draft.questions.length) }),
      );
      focusField(FAILURE_BANNER_ID);
    }
  }

  function startAnotherExam() {
    dispatch({ type: "exam/reset", draft: createExamDraft() });
    setSubmitAttempted(false);
    setStatus({ kind: "editing" });
  }

  return (
    <div className="exam-builder container" role="region" aria-label="New exam">
      <header className="exam-builder-header">
        <p className="eyebrow"><span className="eyebrow-line" /> ADMIN</p>
        <h1>New exam</h1>
        <p className="auth-subtitle">
          Add questions and marking guides. Fields marked * are required.
        </p>
      </header>

      {status.kind === "created" ? (
        <ExamCreatedNotice
          exam={status.exam}
          questionCount={status.questionCount}
          onCreateAnother={startAnotherExam}
        />
      ) : (
        <form onSubmit={handleSubmit} noValidate className="exam-builder-layout">
          <div className="exam-builder-main">
            {status.kind === "failed" && (
              <div id={FAILURE_BANNER_ID} className="alert alert-error" role="alert" tabIndex={-1}>
                <div>
                  <strong>{status.failure.title}</strong>
                  <p className="alert-detail">{status.failure.detail}</p>
                </div>
              </div>
            )}
            {errors && !validation.isValid && (
              <div className="alert alert-error" role="alert">
                <div>Some fields need attention. Fix the highlighted fields and submit again.</div>
              </div>
            )}

            <fieldset className="exam-builder-fields" disabled={submitting}>
              <ExamDetailsEditor draft={draft} errors={errors} dispatch={dispatch} />

              <section className="builder-panel" aria-labelledby="exam-questions-heading">
                <h2 id="exam-questions-heading">Questions</h2>
                {draft.questions.length === 0 && (
                  <p className="field-hint">No questions yet. Add one to get started.</p>
                )}
                {draft.questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    questionNumber={index + 1}
                    errors={errors?.byQuestion[question.id]}
                    dispatch={dispatch}
                  />
                ))}
                <AddQuestionButtons error={errors?.questions} dispatch={dispatch} />
              </section>
            </fieldset>
          </div>

          <ExamSummary
            questionCount={draft.questions.length}
            totalMarks={sumQuestionMarks(draft.questions)}
            submitting={submitting}
          />
        </form>
      )}
    </div>
  );
}
