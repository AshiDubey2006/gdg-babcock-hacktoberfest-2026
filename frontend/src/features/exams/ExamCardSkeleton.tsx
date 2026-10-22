export function ExamCardSkeleton() {
  return (
    <div className="exam-card" aria-hidden="true">
      <div className="exam-card-header">
        <span className="skeleton skeleton-title" />
        <span className="skeleton skeleton-badge" />
      </div>
      <div className="skeleton-lines">
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line skeleton-line-short" />
      </div>
      <span className="skeleton skeleton-meta" />
    </div>
  );
}
