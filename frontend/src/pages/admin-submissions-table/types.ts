export type SubmissionListItem = {
  submission_id: number;
  learner_id: number;
  learner_email: string;
  exam_id: number;
  exam_title: string;
  status: string;
  submitted_at: string;
  total_answer: number;
  graded_answers: number;
  needs_review: number;
};

export const SUBMISSION_STATUSES = ["submitted", "graded"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const REVIEW_STATUSES = ["needs_review", "pending", "clear"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type SubmissionRow = SubmissionListItem & {
  review_status: ReviewStatus;
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  submitted: "Submitted",
  graded: "Graded",
};
export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  needs_review: "Needs Review",
  pending: "Awaiting Grading",
  clear: "No flags",
};

export function isSubmissionStatus(value: string): value is SubmissionStatus {
  return (SUBMISSION_STATUSES as readonly string[]).includes(value);
}
export function isReviewStatus(value: string): value is ReviewStatus {
  return (REVIEW_STATUSES as readonly string[]).includes(value);
}

export function getReviewStatus(item: SubmissionListItem): ReviewStatus {
  if (item.needs_review > 0) return "needs_review";
  if (item.status !== "graded" || item.graded_answers < item.total_answer) {
    return "pending";
  }
  return "clear";
}

export function toRow(item: SubmissionListItem): SubmissionRow {
  return { ...item, review_status: getReviewStatus(item) };
}
