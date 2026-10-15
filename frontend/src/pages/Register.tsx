import { useState, type FormEvent } from "react";
import { registerUser, type ApiError } from "../api";

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

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
  onCancel: () => void;
}

export function RegisterPage({
  onRegisterSuccess,
  onNavigateToLogin,
  onCancel,
}: RegisterPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; }>({});
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const errors: { email?: string; password?: string; } = {};

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    } else if (password.length > 128) {
      errors.password = "Password cannot exceed 128 characters.";
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
      await registerUser(email, password);
      setSuccess(true);
      onRegisterSuccess();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.fieldErrors) {
        setFieldErrors(apiErr.fieldErrors);
      }
      setGeneralError(apiErr.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper" role="region" aria-label="Registration Page">
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
          <h2>Create an account</h2>
          <p className="auth-subtitle">
            Register to begin grading and reviewing learner submissions.
          </p>
        </div>

        {/* Accessible Success State */}
        {success ? (
          <div className="auth-success-box" role="status" aria-live="polite">
            <div className="alert alert-success">
              <SuccessIcon />
              <div>
                <strong>Account created successfully!</strong>
              </div>
            </div>
            <button
              type="button"
              className="button button-primary auth-submit-btn"
              onClick={onNavigateToLogin}
            >
              Proceed to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* General API Error Alert */}
            {generalError && (
              <div className="alert alert-error" role="alert" aria-live="assertive">
                <ErrorIcon />
                <div>{generalError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="auth-form">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="register-email">
                  Email Address <span className="required-star" aria-hidden="true">*</span>
                </label>
                <input
                  id="register-email"
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
                  aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
                  className={fieldErrors.email ? "input-error" : ""}
                  placeholder="learner@example.com"
                  disabled={loading}
                />
                {fieldErrors.email && (
                  <span id="register-email-error" className="field-error" role="alert">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="register-password">
                  Password <span className="required-star" aria-hidden="true">*</span>
                </label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
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
                    fieldErrors.password ? "register-password-error" : "register-password-hint"
                  }
                  className={fieldErrors.password ? "input-error" : ""}
                  placeholder="At least 8 characters"
                  disabled={loading}
                />
                {!fieldErrors.password && (
                  <span id="register-password-hint" className="field-hint">
                    Must be between 8 and 128 characters.
                  </span>
                )}
                {fieldErrors.password && (
                  <span id="register-password-error" className="field-error" role="alert">
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
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="auth-footer-note">
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="inline-link"
                  onClick={onNavigateToLogin}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
