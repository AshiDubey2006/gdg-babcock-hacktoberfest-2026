import { useId, useMemo, useState } from "react";
import { MOCK_SUBMISSIONS } from "./mockData";
import { StatusBadge } from "./StatusBadge";
import type { BadgeTone } from "./StatusBadge";
import { SortableHeader } from "./SortableHeader";
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  filterSubmissions,
  sortSubmissions,
} from "./sortAndFilter";
import type { SortKey, SortState, Filters } from "./sortAndFilter";
import { EmptyState } from "./EmptyState";
import { SubmissionsToolbar } from "./SubmissionsToolbar";
import {
  REVIEW_STATUS_LABELS,
  SUBMISSION_STATUS_LABELS,
  toRow,
  type ReviewStatus,
  type SubmissionStatus,
} from "./types";

const ALL_ROWS = MOCK_SUBMISSIONS.map(toRow);

const SUBMISSION_TONES: Record<SubmissionStatus, BadgeTone> = {
  submitted: "neutral",
  graded: "success",
};

const REVIEW_TONES: Record<ReviewStatus, BadgeTone> = {
  needs_review: "warning",
  pending: "neutral",
  clear: "success",
};

export default function Submissions() {
  const headingId = useId();
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const visibleRows = useMemo(
    () => sortSubmissions(filterSubmissions(ALL_ROWS, filters), sort),
    [filters, sort],
  );

  function handleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <div className="container">
      <section aria-labelledby={headingId} className="py-10">
        <header className="mb-5">
          <h1
            id={headingId}
            className="max-w-none! text-3xl! font-semibold tracking-tight!"
          >
            Submissions
          </h1>
          <p className="text-muted mt-1 text-sm">
            AI-graded submissions and which ones need a human decision.
          </p>
        </header>

        <div className="border-line overflow-hidden rounded-lg border bg-white shadow-xs">
          <SubmissionsToolbar
            filters={filters}
            onChange={setFilters}
            onClear={handleClearFilters}
            visibleCount={visibleRows.length}
            totalCount={ALL_ROWS.length}
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-line bg-canvas border-b">
                  <SortableHeader
                    label="Learner"
                    columnKey="learner_email"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Exam"
                    columnKey="exam_title"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Submission status"
                    columnKey="status"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Review status"
                    columnKey="review_status"
                    sort={sort}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        filters={filters}
                        onClearFilters={handleClearFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <tr key={row.submission_id} className="hover:bg-canvas">
                      <td className="px-5 py-3.5 font-medium">
                        {row.learner_email}
                      </td>
                      <td className="text-muted px-5 py-3.5">
                        {row.exam_title}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          label={
                            SUBMISSION_STATUS_LABELS[
                              row.status as SubmissionStatus
                            ] ?? row.status
                          }
                          tone={
                            SUBMISSION_TONES[row.status as SubmissionStatus] ??
                            "neutral"
                          }
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          label={REVIEW_STATUS_LABELS[row.review_status]}
                          tone={REVIEW_TONES[row.review_status]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
