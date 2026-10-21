import { formatMarks } from "../numbers";

interface ExamSummaryProps {
  questionCount: number;
  totalMarks: number;
  submitting: boolean;
}

export function ExamSummary({ questionCount, totalMarks, submitting }: ExamSummaryProps) {
  return (
    <aside className="exam-summary" aria-labelledby="exam-summary-heading">
      <h2 id="exam-summary-heading">Summary</h2>
      <dl>
        <div>
          <dt>Questions</dt>
          <dd>{questionCount}</dd>
        </div>
        <div>
          <dt>Total marks</dt>
          <dd>{formatMarks(totalMarks)}</dd>
        </div>
      </dl>
      <button
        type="submit"
        className="button button-primary exam-summary-submit"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? "Creating exam..." : "Create exam"}
      </button>
    </aside>
  );
}
