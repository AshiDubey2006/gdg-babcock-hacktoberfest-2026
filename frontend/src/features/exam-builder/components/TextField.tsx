import type { ChangeEvent, ChangeEventHandler } from "react";
import { describedBy, errorId } from "../fieldIds";

export type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  hint?: string;
  required?: boolean;
  multiline?: boolean;
  type?: "text" | "number";
  min?: number;
  step?: number | "any";
  placeholder?: string;
  extraDescribedBy?: string;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  required = false,
  multiline = false,
  type = "text",
  min,
  step,
  placeholder,
  extraDescribedBy,
}: TextFieldProps) {
  const hintId = `${id}-hint`;
  const controlProps = {
    id,
    value,
    onChange,
    placeholder,
    "aria-required": required,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy(hint && hintId, error && errorId(id), extraDescribedBy),
    className: error ? "input-error" : "",
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}
        {required && (
          <>
            {" "}
            <span className="required-star" aria-hidden="true">*</span>
          </>
        )}
      </label>
      {multiline ? (
        <textarea {...controlProps} rows={3} />
      ) : (
        <input
          {...controlProps}
          type={type}
          min={min}
          step={step}
          inputMode={type === "number" ? "decimal" : undefined}
        />
      )}
      {hint && (
        <span id={hintId} className="field-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId(id)} className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}
