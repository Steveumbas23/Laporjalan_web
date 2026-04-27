const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const normalizeBase = (value?: string | null) => {
  if (!value) return "";
  const trimmed = trimTrailingSlash(value.trim());
  return trimmed === "/" ? "" : trimmed;
};

const toApiBase = (value?: string | null) => {
  const normalized = normalizeBase(value);
  if (!normalized) return "";
  if (/\/index\.php\/api$/i.test(normalized) || /\/api$/i.test(normalized))
    return normalized;
  return `${normalized}/api`;
};

const envApiBase = toApiBase(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL,
);

const envBackendBase = normalizeBase(import.meta.env.VITE_BACKEND_BASE_URL);
const API_BASE_STORAGE_KEY = "lj-api-base";

const readStoredApiBase = () => {
  if (typeof window === "undefined") return "";
  try {
    return normalizeBase(window.localStorage.getItem(API_BASE_STORAGE_KEY));
  } catch {
    return "";
  }
};

let resolvedApiBase = readStoredApiBase();

const normalizePath = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

const getWindowOrigin = () => {
  if (typeof window === "undefined") return "";
  return window.location.origin;
};

const unique = (values: string[]) =>
  values.filter(
    (value, index, list) => Boolean(value) && list.indexOf(value) === index,
  );

const commonApiMounts = ["", "/backend", "/backend/public", "/public"];
const commonApiSuffixes = ["/api", "/index.php/api"];

const buildApiMountCandidates = (origin = "") =>
  commonApiMounts.flatMap((mount) =>
    commonApiSuffixes.map((suffix) => `${origin}${mount}${suffix}`),
  );

const defaultApiBases = unique([
  envApiBase,
  envBackendBase ? toApiBase(envBackendBase) : "",
  envBackendBase ? `${envBackendBase}/index.php/api` : "",
  ...buildApiMountCandidates(),
  ...buildApiMountCandidates(getWindowOrigin()),
]);

const isHtmlResponse = (response: Response) => {
  const contentType = (
    response.headers.get("content-type") || ""
  ).toLowerCase();
  return contentType.includes("text/html");
};

export const getApiBaseCandidates = () => {
  const candidates = [resolvedApiBase, ...defaultApiBases].filter(
    (value, index, list) => Boolean(value) && list.indexOf(value) === index,
  );

  return candidates.length > 0 ? candidates : ["/api"];
};

export const getApiBase = () => getApiBaseCandidates()[0];

const getBackendBaseFromConfig = () => {
  if (envBackendBase) return envBackendBase;

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
};

export const rememberApiBase = (base: string) => {
  resolvedApiBase = normalizeBase(base);

  if (typeof window === "undefined") return;

  try {
    if (resolvedApiBase) {
      window.localStorage.setItem(API_BASE_STORAGE_KEY, resolvedApiBase);
      return;
    }

    window.localStorage.removeItem(API_BASE_STORAGE_KEY);
  } catch {
    // Ignore storage access errors.
  }
};

export const buildApiUrl = (base: string, path: string) =>
  `${base}${normalizePath(path)}`;

export const apiFetch = async (path: string, init?: RequestInit) => {
  let lastResponse: Response | null = null;
  let lastError: unknown = null;

  for (const base of getApiBaseCandidates()) {
    try {
      const response = await fetch(buildApiUrl(base, path), init);

      if (response.status === 404 || isHtmlResponse(response)) {
        lastResponse = response;
        continue;
      }

      rememberApiBase(base);
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw lastError instanceof Error ? lastError : new Error("Request API gagal");
};

// ❌ getBackendBase DIHAPUS TOTAL (tidak dipakai & bikin Jenkins gagal)

export const resolveStorageUrl = (value?: string | null) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const normalizedValue = value.replace(/^\/+/, "");
  const backendBase = getBackendBaseFromConfig();
  const storagePath = normalizedValue.startsWith("storage/")
    ? normalizedValue
    : `storage/${normalizedValue}`;

  return `${backendBase}${normalizePath(storagePath)}`;
};

export const isApiHtmlFallbackResponse = isHtmlResponse;
