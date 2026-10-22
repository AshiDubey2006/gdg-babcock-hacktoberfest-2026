import { Suspense, use, useState } from "react";
import { ExamCard } from "../features/exams/ExamCard";
import { ExamCardSkeleton } from "../features/exams/ExamCardSkeleton";
import { loadExams } from "../features/exams/mockExams";
import type { Exam } from "../features/exams/types";

const SKELETON_COUNT = 6;

function ExamListSkeleton() {
  return (
    <div className="exam-grid" aria-busy="true">
      <p className="sr-only" role="status">
        Loading exams
      </p>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <ExamCardSkeleton key={index} />
      ))}
    </div>
  );
}

function ExamsEmptyState() {
  return (
    <div className="exam-empty">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="exam-empty-icon">
        <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20V3.5Z" />
        <path d="M14 3.5V8h4M10 12.5h5M10 16h3" />
      </svg>
      <h2 className="exam-empty-title">No exams yet</h2>
      <p className="exam-empty-text">
        Exams appear here once an administrator creates them.
      </p>
    </div>
  );
}

interface ExamListProps {
  examsPromise: Promise<Exam[]>;
}

function ExamList({ examsPromise }: ExamListProps) {
  const exams = use(examsPromise);

  if (exams.length === 0) {
    return <ExamsEmptyState />;
  }

  return (
    <ul className="exam-grid" aria-label="Exams">
      {exams.map((exam) => (
        <li key={exam.id}>
          <ExamCard exam={exam} />
        </li>
      ))}
    </ul>
  );
}

export function ExamsPage() {
  const [examsPromise] = useState(loadExams);

  return (
    <section className="exams-page container" aria-labelledby="exams-heading">
      <header className="exams-header">
        <p className="eyebrow">
          <span className="eyebrow-line" /> EXAMS
        </p>
        <h1 id="exams-heading" className="exams-title">
          Your exams
        </h1>
        <p className="exams-subtitle">
          Every exam in your workspace, with its status and time limit.
        </p>
      </header>

      <Suspense fallback={<ExamListSkeleton />}>
        <ExamList examsPromise={examsPromise} />
      </Suspense>
    </section>
  );
}
