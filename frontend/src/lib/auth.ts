export type StoredUser = {
  id?: number;
  full_name?: string;
  email?: string;
  role?: string;
};

const STORAGE_KEY = "lj-user";

export const readStoredUser = (): StoredUser | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredUser | null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const writeStoredUser = (user: StoredUser | null) => {
  if (typeof window === "undefined") return;

  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
  writeStoredUser(null);
};
