export type ExamStatus = "draft" | "open" | "closed" | "published";

export interface Exam {
  id: number;
  title: string;
  description: string;
  duration_min: number;
  status: ExamStatus;
}
