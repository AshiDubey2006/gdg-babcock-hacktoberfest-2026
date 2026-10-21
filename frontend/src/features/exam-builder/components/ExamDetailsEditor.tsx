import type { Dispatch } from "react";
import type { ExamBuilderAction } from "../examBuilderReducer";
import { fieldId } from "../fieldIds";
import type { ExamDraft } from "../types";
import { TITLE_MAX_LENGTH, type ExamDraftErrors } from "../validation";
import { TextField } from "./TextField";

interface ExamDetailsEditorProps {
  draft: ExamDraft;
  errors?: ExamDraftErrors;
  dispatch: Dispatch<ExamBuilderAction>;
}

export function ExamDetailsEditor({ draft, errors, dispatch }: ExamDetailsEditorProps) {
  return (
    <section className="builder-panel" aria-labelledby="exam-details-heading">
      <h2 id="exam-details-heading">Exam details</h2>
      <TextField
        id={fieldId("title")}
        label="Title"
        value={draft.title}
        onChange={(e) => dispatch({ type: "exam/update", field: "title", value: e.target.value })}
        error={errors?.title}
        hint={`Up to ${TITLE_MAX_LENGTH} characters.`}
        placeholder="Introduction to Databases: Midterm"
        required
      />
      <TextField
        id={fieldId("description")}
        label="Description"
        value={draft.description}
        onChange={(e) => dispatch({ type: "exam/update", field: "description", value: e.target.value })}
        hint="Optional. Shown to learners before they start."
        multiline
      />
      <TextField
        id={fieldId("duration")}
        label="Duration (minutes)"
        value={draft.durationMin}
        onChange={(e) => dispatch({ type: "exam/update", field: "durationMin", value: e.target.value })}
        error={errors?.durationMin}
        type="number"
        min={1}
        step={1}
        placeholder="60"
        required
      />
    </section>
  );
}
