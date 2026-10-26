import { isAxiosError } from "axios";

export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string>;
}

const CONNECTION_MESSAGE = "Please check your connection";
const GENERIC_MESSAGE = "Something went wrong. Please try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toFieldErrors(detail: readonly unknown[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const item of detail) {
    if (!isRecord(item) || !Array.isArray(item.loc) || item.loc.length < 2) continue;

    const field = String(item.loc[item.loc.length - 1]);
    if (field) {
      fieldErrors[field] = typeof item.msg === "string" && item.msg ? item.msg : "Invalid value";
    }
  }

  return fieldErrors;
}

function fromResponse(status: number, body: unknown): ApiError {
  if (isRecord(body)) {
    if (Array.isArray(body.detail)) {
      return {
        message: "Please correct the errors in the form.",
        fieldErrors: toFieldErrors(body.detail),
      };
    }
    if (typeof body.detail === "string") {
      return { message: body.detail };
    }
  }

  if (status === 401) {
    return { message: "Incorrect email or password." };
  }
  if (status === 409) {
    return { message: "Email is already registered." };
  }
  return { message: GENERIC_MESSAGE };
}

export function toApiError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    return { message: GENERIC_MESSAGE };
  }
  if (!error.response) {
    return { message: CONNECTION_MESSAGE };
  }
  return fromResponse(error.response.status, error.response.data);
}
