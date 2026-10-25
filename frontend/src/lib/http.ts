import axios, { isAxiosError, type AxiosResponse } from "axios";
import { toApiError } from "./apiError";
import { clearAccessToken, getAccessToken } from "./tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const http = axios.create({ baseURL: API_BASE_URL });

type UnauthorizedListener = () => void;

const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

function bearer(token: string): string {
  return `Bearer ${token}`;
}

// A 401 means the session expired only if the request carried the token that is
// still stored. A wrong-password login sends no token. Once the first failure
// clears the token, other in-flight requests no longer match, so listeners hear
// about an expiry once; a fresh sign-in stores a new token, which re-arms this.
function isSessionExpiry(error: unknown): boolean {
  if (!isAxiosError(error) || error.response?.status !== 401) return false;

  const token = getAccessToken();
  return token !== null && error.config?.headers.get("Authorization") === bearer(token);
}

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.setAuthorization(bearer(token));
  }
  return config;
});

http.interceptors.response.use(undefined, (error: unknown) => {
  if (isSessionExpiry(error)) {
    clearAccessToken();
    unauthorizedListeners.forEach((listener) => listener());
  }
  return Promise.reject(error);
});

export async function unwrap<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
  try {
    return (await request).data;
  } catch (error: unknown) {
    throw toApiError(error);
  }
}
