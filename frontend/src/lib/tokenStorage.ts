const TOKEN_KEY = "gdg_grader_access_token";

// Touching sessionStorage throws when the browser blocks storage, so every
// access falls back instead of breaking sign-in.
function withSessionStorage<T>(action: (storage: Storage) => T, fallback: T): T {
  try {
    return action(window.sessionStorage);
  } catch {
    return fallback;
  }
}

export function getAccessToken(): string | null {
  return withSessionStorage((storage) => storage.getItem(TOKEN_KEY) || null, null);
}

export function setAccessToken(token: string): void {
  withSessionStorage((storage) => storage.setItem(TOKEN_KEY, token), undefined);
}

export function clearAccessToken(): void {
  withSessionStorage((storage) => storage.removeItem(TOKEN_KEY), undefined);
}
