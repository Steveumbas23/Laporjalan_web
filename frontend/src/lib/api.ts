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

let resolvedApiBase = "";

const normalizePath = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

const getWindowOrigin = () => {
  if (typeof window === "undefined") return "";
  return window.location.origin;
};

const defaultApiBases = [
  envApiBase,
  envBackendBase ? `${envBackendBase}/api` : "",
  envBackendBase ? `${envBackendBase}/index.php/api` : "",
  "/api",
  "/backend/public/api",
  "/index.php/api",
  "/backend/public/index.php/api",
  `${getWindowOrigin()}/api`,
  `${getWindowOrigin()}/backend/public/api`,
  `${getWindowOrigin()}/index.php/api`,
  `${getWindowOrigin()}/backend/public/index.php/api`,
].filter(
  (value, index, list) => Boolean(value) && list.indexOf(value) === index,
);

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
  resolvedApiBase = normalizeBase(base);
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

  const apiBase = getApiBase();
  const normalizedValue = value.replace(/^\/+/, "");

  const filePath = normalizedValue.startsWith("storage/")
    ? normalizedValue
    : `storage/${normalizedValue}`;

  return `${apiBase}/files/${filePath}`;
};

export const isApiHtmlFallbackResponse = isHtmlResponse;
