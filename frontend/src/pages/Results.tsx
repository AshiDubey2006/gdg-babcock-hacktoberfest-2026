import { MOCK_RESULTS } from "../features/results/mockResults";
import type { SubmissionResult } from "../features/results/types";

function formatMarks(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);
}

function SubmissionCard({ result }: { result: SubmissionResult }) {
  const allGraded =
    result.answers.length > 0 &&
    result.answers.every((answer) => answer.grade !== null);
  const needsReview = result.answers.some(
    (answer) => answer.grade?.needs_review,
  );
  const isFinal = allGraded && !needsReview;
  const earnedMarks = result.answers.reduce(
    (total, answer) => total + (answer.grade?.score ?? 0),
    0,
  );
  const possibleMarks = result.answers.reduce(
    (total, answer) => total + answer.max_marks,
    0,
  );

  return (
    <article className="result-card">
      <header className="result-card-header">
        <div>
          <h2 className="result-exam-title">{result.exam_title}</h2>
          <p className="result-submitted">
            Submitted{" "}
            <time dateTime={result.submitted_at}>
              {new Date(result.submitted_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </p>
        </div>
        <span
          className={`result-status ${isFinal ? "result-status-final" : "result-status-pending"}`}
          role="status"
        >
          {isFinal ? "Final result" : needsReview ? "Under review" : "Grading in progress"}
        </span>
      </header>

      <p className="result-overall">
        <span>Overall score</span>
        {isFinal ? (
          <strong>
            {formatMarks(earnedMarks)} / {formatMarks(possibleMarks)}
          </strong>
        ) : (
          <strong className="result-overall-pending">
            {formatMarks(earnedMarks)} marks recorded · not final
          </strong>
        )}
      </p>

      <ol className="result-answers">
        {result.answers.map((answer, index) => {
          const grade = answer.grade;

          return (
            <li className="result-answer" key={answer.question_id}>
              <div className="result-question-header">
                <h3>
                  <span className="result-question-number">Q{index + 1}</span>
                  {answer.question}
                </h3>
                <span className="result-marks">
                  {grade ? formatMarks(grade.score) : "—"} /{" "}
                  {formatMarks(answer.max_marks)}
                </span>
              </div>

              <section className="result-answer-section">
                <h4>Your answer</h4>
                <p className="result-response">{answer.response || "No answer submitted."}</p>
              </section>

              <section className="result-answer-section">
                <h4>Feedback</h4>
                <p className="result-feedback">
                  {grade?.feedback ||
                    "Feedback is not available yet. This answer has not been graded."}
                </p>
                {grade?.needs_review && (
                  <p className="result-review-note">
                    This answer is awaiting administrator review; its mark is not final.
                  </p>
                )}
              </section>

              <section className="result-answer-section">
                <h4>Evidence</h4>
                {grade && grade.evidence.length > 0 ? (
                  <ul className="result-evidence">
                    {grade.evidence.map((evidence, evidenceIndex) => (
                      <li key={`${answer.question_id}-${evidenceIndex}`}>
                        {evidence}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="result-no-evidence">
                    {grade
                      ? "No evidence provided."
                      : "Evidence will appear after grading."}
                  </p>
                )}
              </section>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

export function ResultsPage() {
  return (
    <section className="results-page container" aria-labelledby="results-heading">
      <header className="results-header">
        <p className="eyebrow">
          <span className="eyebrow-line" /> RESULTS
        </p>
        <h1 id="results-heading" className="exams-title">
          Your results
        </h1>
        <p className="exams-subtitle">
          Review your marks, feedback, and the evidence for each answer.
        </p>
        <p className="results-demo-note">
          Sample results shown for interface preview.
        </p>
      </header>

      <div className="results-list">
        {MOCK_RESULTS.map((result) => (
          <SubmissionCard key={result.submission_id} result={result} />
        ))}
      </div>
    </section>
  );
}
