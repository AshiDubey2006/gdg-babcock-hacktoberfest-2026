export const API_BASE_URL =
  ((import.meta as any).env.VITE_API_URL as string | undefined) ||
  "http://localhost:8000";

const TOKEN_KEY = "gdg_grader_access_token";

// TS interfaces
export interface UserResponse {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string>;
}

// session storage functions for token
export function setStoredToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function getStoredToken(): string {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error("No token found");
    return token;
  } catch {
    throw new Error("No token found");
  }
}

export function clearStoredToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
}

// API helpers
export async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const data = await response.json();
    if (data && typeof data === "object") {
      // validation error array
      if (Array.isArray(data.detail)) {
        const fieldErrors: Record<string, string> = {};

        for (const item of data.detail) {
          const field =
            item.loc && item.loc.length > 1
              ? String(item.loc[item.loc.length - 1])
              : "";
          if (field) {
            fieldErrors[field] = item.msg || "Invalid value";
          }
        }

        return {
          message: "Please correct the errors in the form.",
          fieldErrors,
        };
      }
      if (typeof data.detail === "string") {
        return {
          message: data.detail,
        };
      }
    }
  } catch {}

  if (response.status === 401) {
    return { message: "Incorrect email or password." };
  }
  if (response.status === 409) {
    return { message: "Email is already registered." };
  }
  return {
    message: `Something went wrong. Please try again.`,
  };
}

// Auth endpoints
export async function registerUser(
  email: string,
  password: string,
): Promise<UserResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
  } catch {
    throw {
      message: "Please check your connection",
    } as ApiError;
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as UserResponse;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<TokenResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
  } catch {
    throw {
      message: "Please check your connection",
    } as ApiError;
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const tokenData = (await response.json()) as TokenResponse;
  setStoredToken(tokenData.access_token);
  return tokenData;
}

export async function getCurrentUser(): Promise<UserResponse> {
  const token = getStoredToken();
  if (!token) {
    throw {
      message: "Please login again",
    } as ApiError;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      if (response.status === 401) {
        clearStoredToken();
      }
      throw await parseApiError(response);
    }
    return (await response.json()) as UserResponse;
  } catch {
    throw {
      message: "Please check your connection",
    } as ApiError;
  }
}
