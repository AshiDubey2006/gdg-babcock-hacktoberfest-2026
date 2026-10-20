import { formatDuration } from "./formatDuration";
import type { Exam, ExamStatus } from "./types";

const STATUS_LABELS: Record<ExamStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
  published: "Published",
};

interface ExamCardProps {
  exam: Exam;
}

export function ExamCard({ exam }: ExamCardProps) {
  const titleId = `exam-${exam.id}-title`;
  const description = exam.description.trim();

  return (
    <article className="exam-card" aria-labelledby={titleId}>
      <header className="exam-card-header">
        <h2 id={titleId} className="exam-card-title">
          {exam.title}
        </h2>
        <span className={`exam-status exam-status-${exam.status}`}>
          <span className="sr-only">Status: </span>
          {STATUS_LABELS[exam.status]}
        </span>
      </header>

      <p
        className={
          description
            ? "exam-card-description"
            : "exam-card-description exam-card-description-empty"
        }
      >
        {description || "No description provided."}
      </p>

      <dl className="exam-card-meta">
        <dt>Duration</dt>
        <dd>
          <time dateTime={`PT${exam.duration_min}M`}>
            {formatDuration(exam.duration_min)}
          </time>
        </dd>
      </dl>
    </article>
  );
}
