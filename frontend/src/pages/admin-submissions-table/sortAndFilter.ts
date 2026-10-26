import type { ReviewStatus, SubmissionRow, SubmissionStatus } from "./types";

export type SortKey =
  "learner_email" | "exam_title" | "status" | "review_status";
export type SortDirection = "asc" | "desc";
export type SortState = { key: SortKey; direction: SortDirection };

export type Filters = {
  status: SubmissionStatus | "all";
  reviewStatus: ReviewStatus | "all";
};

export const DEFAULT_SORT: SortState = {
  key: "learner_email",
  direction: "asc",
};

export const DEFAULT_FILTERS: Filters = {
  status: "all",
  reviewStatus: "all",
};

const REVIEW_ORDER: Record<ReviewStatus, number> = {
  needs_review: 0,
  pending: 1,
  clear: 2,
};

function compareBy(key: SortKey, a: SubmissionRow, b: SubmissionRow): number {
  if (key === "review_status") {
    return REVIEW_ORDER[a.review_status] - REVIEW_ORDER[b.review_status];
  }
  return a[key].localeCompare(b[key], undefined, { sensitivity: "base" });
}

export function sortSubmissions(
  rows: readonly SubmissionRow[],
  sort: SortState,
): SubmissionRow[] {
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort(
    (a, b) =>
      compareBy(sort.key, a, b) * factor || a.submission_id - b.submission_id,
  );
}

export function filterSubmission(
  rows: readonly SubmissionRow[],
  filters: Filters,
): SubmissionRow[] {
  return rows.filter(
    (row) =>
      (filters.status === "all" || row.status === filters.status) &&
      (filters.reviewStatus === "all" ||
        row.review_status === filters.reviewStatus),
  );
}

export const filterSubmissions = filterSubmission;

export function hasActiveFilters(filters: Filters): boolean {
  return filters.status !== "all" || filters.reviewStatus !== "all";
}
