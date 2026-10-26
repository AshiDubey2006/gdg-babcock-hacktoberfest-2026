import type { Filters } from "./sortAndFilter";
import { hasActiveFilters } from "./sortAndFilter";
import { REVIEW_STATUS_LABELS, SUBMISSION_STATUS_LABELS } from "./types";

function describeFilters(filters: Filters): string[] {
  const parts: string[] = [];
  if (filters.status !== "all") {
    parts.push(
      `submission status "${SUBMISSION_STATUS_LABELS[filters.status]}"`,
    );
  }
  if (filters.reviewStatus !== "all") {
    parts.push(`review status "${REVIEW_STATUS_LABELS[filters.reviewStatus]}"`);
  }
  return parts;
}

type EmptyStateProps = {
  filters: Filters;
  onClearFilters: () => void;
};

export function EmptyState({ filters, onClearFilters }: EmptyStateProps) {
  if (!hasActiveFilters(filters)) {
    return (
      <div className="px-6 py-16 text-center">
        <h3 className="text-lg font-semibold">No submissions yet</h3>
        <p className="text-muted mx-auto mt-2 max-w-md text-sm">
          Submissions will appear here once learners submit an exam.
        </p>
      </div>
    );
  }
  return (
    <div className="px-6 py-16 text-center">
      <h3 className="text-lg font-semibold">
        No submissions match your filters
      </h3>
      <p className="text-muted mx-auto mt-2 max-w-md text-sm">
        Nothing matches {describeFilters(filters).join(" and ")}. Try broadening
        your criteria or clear the filters.
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="bg-brand hover:bg-brand-dark focus-visible:ring-brand mt-6 h-10 rounded-lg px-4 text-sm! font-semibold! text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
      >
        Clear filters
      </button>
    </div>
  );
}
