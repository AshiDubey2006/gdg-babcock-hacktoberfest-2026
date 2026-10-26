import type { ChangeEvent } from "react";
import { useId } from "react";
import type { Filters } from "./sortAndFilter";
import { hasActiveFilters } from "./sortAndFilter";
import {
  REVIEW_STATUSES,
  REVIEW_STATUS_LABELS,
  SUBMISSION_STATUSES,
  SUBMISSION_STATUS_LABELS,
  isReviewStatus,
  isSubmissionStatus,
} from "./types";

type SubmissionsToolbarProps = {
  filters: Filters;
  onChange: (next: Filters) => void;
  onClear: () => void;
  visibleCount: number;
  totalCount: number;
};

const SELECT_CLASSES =
  "bg-muted/20 focus-visible:ring-brand rounded-sm px-2 py-1 focus-visible:ring-2 focus-visible:outline-hidden";

export function SubmissionsToolbar({
  filters,
  onChange,
  onClear,
  visibleCount,
  totalCount,
}: SubmissionsToolbarProps) {
  const statusId = useId();
  const reviewId = useId();

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    onChange({ ...filters, status: isSubmissionStatus(value) ? value : "all" });
  }

  function handleReviewChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    onChange({
      ...filters,
      reviewStatus: isReviewStatus(value) ? value : "all",
    });
  }

  return (
    <div className="text-muted border-line flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 text-sm font-semibold">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5">
          <label htmlFor={statusId}>Submission Status</label>
          <select
            id={statusId}
            value={filters.status}
            onChange={handleStatusChange}
            className={SELECT_CLASSES}
          >
            <option value="all">All</option>
            {SUBMISSION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {SUBMISSION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label htmlFor={reviewId}>Review Status</label>
          <select
            id={reviewId}
            value={filters.reviewStatus}
            onChange={handleReviewChange}
            className={SELECT_CLASSES}
          >
            <option value="all">All</option>
            {REVIEW_STATUSES.map((status) => (
              <option key={status} value={status}>
                {REVIEW_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={!hasActiveFilters(filters)}
          className="group focus-visible:ring-brand flex items-center gap-1.5 rounded-sm focus-visible:ring-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4 transition-transform duration-200 group-enabled:group-hover:-rotate-45"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Clear filters
        </button>
      </div>

      <p role="status" className="text-sm font-medium">
        Showing {visibleCount} of {totalCount} submissions
      </p>
    </div>
  );
}
