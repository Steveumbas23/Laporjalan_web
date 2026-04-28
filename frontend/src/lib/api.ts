const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const isLoopbackHost = (hostname: string) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "0.0.0.0" ||
  hostname === "[::1]";

const normalizeBase = (value?: string | null) => {
  if (!value) return "";
  const trimmed = trimTrailingSlash(value.trim());
  return trimmed === "/" ? "" : trimmed;
};

const sanitizeBase = (value?: string | null) => {
  const normalized = normalizeBase(value);

  if (!normalized) return "";

  if (typeof window === "undefined") {
    return normalized;
  }

  try {
    const parsed = new URL(normalized, window.location.origin);
    const pageUrl = new URL(window.location.href);
    const mixedContent =
      pageUrl.protocol === "https:" && parsed.protocol === "http:";
    const remotePageUsingLoopback =
      pageUrl.hostname !== parsed.hostname && isLoopbackHost(parsed.hostname);

    if (mixedContent || remotePageUsingLoopback) {
      return "";
    }

    return trimTrailingSlash(parsed.toString());
  } catch {
    return normalized;
  }
};

const toApiBase = (value?: string | null) => {
  const normalized = normalizeBase(value);
  if (!normalized) return "";
  if (/\/index\.php\/api$/i.test(normalized) || /\/api$/i.test(normalized))
    return normalized;
  return `${normalized}/api`;
};

const envApiBase = toApiBase(
  sanitizeBase(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL),
);

const envBackendBase = sanitizeBase(import.meta.env.VITE_BACKEND_BASE_URL);
const API_BASE_STORAGE_KEY = "lj-api-base";

const readStoredApiBase = () => {
  if (typeof window === "undefined") return "";
  try {
    return sanitizeBase(window.localStorage.getItem(API_BASE_STORAGE_KEY));
  } catch {
    return "";
  }
};

let resolvedApiBase = readStoredApiBase();

const normalizePath = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

const stripApiSuffix = (value: string) =>
  value
    .replace(/\/index\.php\/api$/i, "")
    .replace(/\/api$/i, "");

const getWindowOrigin = () => {
  if (typeof window === "undefined") return "";
  return window.location.origin;
};

const unique = (values: string[]) =>
  values.filter(
    (value, index, list) => Boolean(value) && list.indexOf(value) === index,
  );

const commonApiMounts = ["", "/backend"];
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

export const rememberApiBase = (base: string) => {
  resolvedApiBase = sanitizeBase(base);

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

export const resolveStorageUrl = (value?: string | null) => {
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const parsed = new URL(value);
      if (!parsed.pathname.includes("/storage/")) {
        return "";
      }

      const normalizedPath = parsed.pathname.replace(/^\/+/, "");
      const storagePath = normalizedPath.startsWith("storage/")
        ? normalizedPath
        : `storage/${normalizedPath}`;

      return `/api/files/${storagePath}`;
    } catch {
      return "";
    }
  }

  const normalizedValue = value.replace(/^\/+/, "");
  const storagePath = normalizedValue.startsWith("storage/")
    ? normalizedValue
    : `storage/${normalizedValue}`;

  return `/api/files/${storagePath}`;
};

const getStorageBaseCandidates = () => {
  const apiBases = getApiBaseCandidates();

  return unique(
    apiBases.map((base) => stripApiSuffix(base)).filter((value) => Boolean(value)),
  );
};

export const resolveStorageUrlCandidates = (value?: string | null) => {
  if (!value) return [];

  const candidates = new Set<string>();
  const normalizedValue = value.replace(/^\/+/, "");
  const storagePath = normalizedValue.startsWith("storage/")
    ? normalizedValue
    : `storage/${normalizedValue}`;

  const add = (candidate: string) => {
    if (candidate) candidates.add(candidate);
  };

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const parsed = new URL(value);
      if (parsed.pathname.includes("/storage/")) {
        const normalizedPath = parsed.pathname.replace(/^\/+/, "");
        const normalizedStoragePath = normalizedPath.startsWith("storage/")
          ? normalizedPath
          : `storage/${normalizedPath}`;
        add(`/api/files/${normalizedStoragePath}`);
      }
    } catch {
      // ignore URL parse errors
    }
  }

  for (const base of getStorageBaseCandidates()) {
    add(`${base}/api/files/${storagePath}`);
  }

  add(resolveStorageUrl(value));
  add(`/api/files/${storagePath}`);

  return [...candidates];
};

export const isApiHtmlFallbackResponse = isHtmlResponse;
