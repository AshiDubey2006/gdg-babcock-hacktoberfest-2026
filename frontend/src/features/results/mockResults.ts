import type { SubmissionResult } from "./types";

export const MOCK_RESULTS: SubmissionResult[] = [
  {
    submission_id: 301,
    exam_id: 12,
    exam_title: "Introduction to Algorithms",
    submitted_at: "2026-10-18T14:30:00Z",
    answers: [
      {
        question_id: 41,
        question: "What is the time complexity of binary search on a sorted array?",
        response: "O(log n)",
        max_marks: 5,
        grade: {
          id: 701,
          answer_id: 801,
          score: 5,
          feedback: "Correct. Each step halves the remaining search space.",
          evidence: ["O(log n)"],
          graded_by: "admin",
          needs_review: false,
        },
      },
      {
        question_id: 42,
        question: "Name one advantage of merge sort over quicksort.",
        response: "It has guaranteed O(n log n) time complexity.",
        max_marks: 5,
        grade: {
          id: 702,
          answer_id: 802,
          score: 4,
          feedback:
            "Good comparison. Mentioning its stable ordering would make this answer more complete.",
          evidence: ["guaranteed O(n log n) time complexity"],
          graded_by: "admin",
          needs_review: false,
        },
      },
    ],
  },
  {
    submission_id: 302,
    exam_id: 15,
    exam_title: "Database Design Fundamentals",
    submitted_at: "2026-10-20T09:15:00Z",
    answers: [
      {
        question_id: 51,
        question: "What does a foreign key represent?",
        response: "A column that references a key in another table.",
        max_marks: 4,
        grade: {
          id: 703,
          answer_id: 803,
          score: 3,
          feedback: "The core idea is right; clarify that it enforces a relationship.",
          evidence: ["references a key in another table"],
          graded_by: "ai",
          needs_review: true,
        },
      },
      {
        question_id: 52,
        question: "Briefly explain the purpose of database normalization.",
        response: "To organize data and reduce duplication.",
        max_marks: 6,
        grade: null,
      },
    ],
  },
];
