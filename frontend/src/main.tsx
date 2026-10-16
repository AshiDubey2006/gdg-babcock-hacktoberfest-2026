/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { ExamsPage } from "./pages/Exams";
import { ResultsPage } from "./pages/Results";
import { AdminExamBuilderPage } from "./pages/AdminExamBuilder";
import { clearStoredToken, getCurrentUser, type UserResponse } from "./api";

const EXAM_BUILDER_PATH = "/admin/exams/new";

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 18 18" className="arrow">
    <path d="M3.5 9h10M9.5 4.5 14 9l-4.5 4.5" />
  </svg>
);

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  function navigate(path: string, notice?: string) {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    setNoticeMessage(notice || null);
  }

  function handleLoginSuccess() {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
    navigate("/");
  }

  function handleLogout() {
    clearStoredToken();
    setCurrentUser(null);
    navigate("/");
  }

  const isLoginPage = currentPath === "/login";
  const isRegisterPage = currentPath === "/register";
  const isExamsPage = currentPath === "/exams";
  const isResultsPage = currentPath === "/results";
  const isExamBuilderPage = currentPath === EXAM_BUILDER_PATH;
  const canManageExams =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  return (
    <main className="page-shell">
      <nav className="nav container" aria-label="Main navigation">
        <button
          type="button"
          className="brand"
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          aria-label="GDG AI Grader home"
        >
          <span className="brand-mark">G</span>
          <span>
            GDG <em>AI</em> Grader
          </span>
        </button>

        <div className="nav-links">
          {currentUser ? (
            <>
              <span style={{ fontSize: "13px", color: "#24754c", fontWeight: 600 }}>
                {currentUser.email}
              </span>
              <button
                type="button"
                className="nav-button"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="nav-button"
                onClick={() => navigate("/login")}
              >
                Open workspace <Arrow />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Login Page */}
      {isLoginPage && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => navigate("/register")}
          onCancel={() => navigate("/")}
          noticeMessage={noticeMessage}
        />
      )}

      {/* Register Page */}
      {isRegisterPage && (
        <RegisterPage
          onRegisterSuccess={() =>
            navigate(
              "/login",
              "Account created successfully! Please sign in with your credentials.",
            )
          }
          onNavigateToLogin={() => navigate("/login")}
          onCancel={() => navigate("/")}
        />
      )}

      {isExamsPage && <ExamsPage />}

      {isResultsPage && <ResultsPage />}

      {isExamBuilderPage && <AdminExamBuilderPage />}

      {!isLoginPage &&
        !isRegisterPage &&
        !isExamsPage &&
        !isResultsPage &&
        !isExamBuilderPage && (
        <>
          <section className="hero hero-centered container" id="top">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-line" /> AI-ASSISTED GRADING
              </p>
              <h1>
                Clear feedback.
                <br />
                <span>Less busywork.</span>
              </h1>
              <p className="hero-text">
                Review AI suggestions, adjust when needed, and share thoughtful
                feedback with every learner.
              </p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => navigate(currentUser ? "/" : "/login")}
                >
                  {currentUser ? "Go to workspace" : "Start grading"} <Arrow />
                </button>
              </div>
            </div>
          </section>

          <section className="proof-strip">
            <div className="proof-inner container">
              <p>HOW IT WORKS</p>
              <div className="proof-items">
                <span>
                  <b>1.</b> Upload
                </span>
                <i />
                <span>
                  <b>2.</b> Review
                </span>
                <i />
                <span>
                  <b>3.</b> Share feedback
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
