import type { ReactNode } from "react";
import type { SortKey, SortState } from "./sortAndFilter";
import type { ReviewStatus, SubmissionRow, SubmissionStatus } from "./types";
import type { BadgeTone } from "./StatusBadge";
import { SortableHeader } from "./SortableHeader";
import {
  REVIEW_STATUS_LABELS,
  SUBMISSION_STATUS_LABELS,
  isSubmissionStatus,
} from "./types";
import { StatusBadge } from "./StatusBadge";

type SubmissionsTableProps = {
  rows: readonly SubmissionRow[];
  sort: SortState;
  onSort: (key: SortKey) => void;
  emptyState: ReactNode;
};

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "learner_email", label: "Learner" },
  { key: "exam_title", label: "Exam" },
  { key: "status", label: "Submission status" },
  { key: "review_status", label: "Review status" },
];

const SUBMISSION_TONES: Record<SubmissionStatus, BadgeTone> = {
  submitted: "neutral",
  graded: "success",
};

const REVIEW_TONES: Record<ReviewStatus, BadgeTone> = {
  needs_review: "warning",
  pending: "neutral",
  clear: "success",
};

function SubmissionStatusBadge({ status }: { status: string }) {
  if (isSubmissionStatus(status)) {
    return (
      <StatusBadge
        label={SUBMISSION_STATUS_LABELS[status]}
        tone={SUBMISSION_TONES[status]}
      />
    );
  }
  return <StatusBadge label={status} tone="neutral" />;
}

export function SubmissionsTable({
  rows,
  sort,
  onSort,
  emptyState,
}: SubmissionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-line bg-canvas border-b">
            {COLUMNS.map((column) => (
              <SortableHeader
                key={column.key}
                label={column.label}
                columnKey={column.key}
                sort={sort}
                onSort={onSort}
              />
            ))}
          </tr>
        </thead>
        <tbody className="divide-line divide-y">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length}>{emptyState}</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.submission_id} className="hover:bg-canvas">
                <td className="px-5 py-3.5 font-medium">{row.learner_email}</td>
                <td className="text-muted px-5 py-3.5">{row.exam_title}</td>
                <td className="px-5 py-3.5">
                  <SubmissionStatusBadge status={row.status} />
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
  );
}
