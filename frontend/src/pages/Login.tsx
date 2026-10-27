import { useState, type FormEvent } from "react";
import { loginUser, type ApiError } from "../api";

const SuccessIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    className="alert-svg"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="10" cy="10" r="8" />
    <path d="m6.5 10 2.5 2.5 4.5-4.5" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    className="alert-svg"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="10" cy="10" r="8" />
    <line x1="10" y1="6" x2="10" y2="10" />
    <line x1="10" y1="14" x2="10.01" y2="14" />
  </svg>
);

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
  onCancel: () => void;
  noticeMessage?: string | null;
}

export function LoginPage({
  onLoginSuccess,
  onNavigateToRegister,
  onCancel,
  noticeMessage,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      await loginUser(email, password);
      onLoginSuccess();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.fieldErrors) {
        setFieldErrors(apiErr.fieldErrors);
      }
      setGeneralError(
        apiErr.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper" role="region" aria-label="Login Page">
      <div className="auth-card">
        <div className="auth-header">
          {/* <button
                        type="button"
                        className="auth-back-button"
                        onClick={onCancel}
                        aria-label="Back to home page"
                    >
                        Back to home
                    </button> */}
          <h2>Sign In</h2>
          <p className="auth-subtitle">
            Enter your credentials to access your grading workspace.
          </p>
        </div>

        {noticeMessage && !generalError && (
          <div className="alert alert-success" role="status" aria-live="polite">
            <SuccessIcon />
            <div>{noticeMessage}</div>
          </div>
        )}

        {generalError && (
          <div className="alert alert-error" role="alert" aria-live="assertive">
            <ErrorIcon />
            <div>{generalError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">
              Email Address{" "}
              <span className="required-star" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              aria-required="true"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={
                fieldErrors.email ? "login-email-error" : undefined
              }
              className={fieldErrors.email ? "input-error" : ""}
              placeholder="learner@example.com"
              disabled={loading}
            />
            {fieldErrors.email && (
              <span id="login-email-error" className="field-error" role="alert">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">
              Password{" "}
              <span className="required-star" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              aria-required="true"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={
                fieldErrors.password ? "login-password-error" : undefined
              }
              className={fieldErrors.password ? "input-error" : ""}
              placeholder="••••••••"
              disabled={loading}
            />
            {fieldErrors.password && (
              <span
                id="login-password-error"
                className="field-error"
                role="alert"
              >
                {fieldErrors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="button button-primary auth-submit-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer-note">
          <p>
            Don't have an account yet?{" "}
            <button
              type="button"
              className="inline-link"
              onClick={onNavigateToRegister}
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
