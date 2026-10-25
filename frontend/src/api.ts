import type { ApiError } from "./lib/apiError";
import { http, unwrap } from "./lib/http";
import { getAccessToken, setAccessToken } from "./lib/tokenStorage";

export type { ApiError } from "./lib/apiError";

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

function credentials(email: string, password: string): { email: string; password: string } {
  return { email: email.trim().toLowerCase(), password };
}

// Auth endpoints
export function registerUser(email: string, password: string): Promise<UserResponse> {
  return unwrap(http.post<UserResponse>("/auth/register", credentials(email, password)));
}

export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const tokenData = await unwrap(
    http.post<TokenResponse>("/auth/login", credentials(email, password)),
  );
  setAccessToken(tokenData.access_token);
  return tokenData;
}

export async function getCurrentUser(): Promise<UserResponse> {
  if (!getAccessToken()) {
    throw { message: "Please login again" } satisfies ApiError;
  }

  return unwrap(http.get<UserResponse>("/auth/me"));
}
