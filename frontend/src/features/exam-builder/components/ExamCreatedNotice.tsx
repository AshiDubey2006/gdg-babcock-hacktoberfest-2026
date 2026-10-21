import type { CreatedExam } from "../types";

export const EXAM_CREATED_HEADING_ID = "exam-created-heading";

interface ExamCreatedNoticeProps {
  exam: CreatedExam;
  questionCount: number;
  onCreateAnother: () => void;
}

export function ExamCreatedNotice({ exam, questionCount, onCreateAnother }: ExamCreatedNoticeProps) {
  return (
    <section className="builder-panel exam-created" aria-labelledby={EXAM_CREATED_HEADING_ID}>
      <h2 id={EXAM_CREATED_HEADING_ID} tabIndex={-1}>
        Exam created
      </h2>
      <p>
        <strong>{exam.title}</strong> was saved as a draft with {questionCount}{" "}
        {questionCount === 1 ? "question" : "questions"}.
      </p>
      <button type="button" className="button button-primary" onClick={onCreateAnother}>
        Create another exam
      </button>
    </section>
  );
}
