const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const normalizeBase = (value?: string | null) => {
  if (!value) return ''
  const trimmed = trimTrailingSlash(value.trim())
  return trimmed === '/' ? '' : trimmed
}

const envApiBase = normalizeBase(import.meta.env.VITE_API_BASE_URL)

let resolvedApiBase = ''

const defaultApiBases = [envApiBase, '/api', '/backend/public/api'].filter(
  (value, index, list) => Boolean(value) && list.indexOf(value) === index
)

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`)

export const getApiBaseCandidates = () => {
  const candidates = [resolvedApiBase, ...defaultApiBases].filter(
    (value, index, list) => Boolean(value) && list.indexOf(value) === index
  )

  return candidates.length > 0 ? candidates : ['/api']
}

export const getApiBase = () => getApiBaseCandidates()[0]

export const rememberApiBase = (base: string) => {
  resolvedApiBase = normalizeBase(base)
}

export const buildApiUrl = (base: string, path: string) => `${base}${normalizePath(path)}`

export const apiFetch = async (path: string, init?: RequestInit) => {
  let lastResponse: Response | null = null
  let lastError: unknown = null

  for (const base of getApiBaseCandidates()) {
    try {
      const response = await fetch(buildApiUrl(base, path), init)
      if (response.status === 404) {
        lastResponse = response
        continue
      }

      rememberApiBase(base)
      return response
    } catch (error) {
      lastError = error
    }
  }

  if (lastResponse) {
    return lastResponse
  }

  throw lastError instanceof Error ? lastError : new Error('Request API gagal')
}

const getBackendBase = () => {
  const envBackendBase = normalizeBase(import.meta.env.VITE_BACKEND_BASE_URL)
  if (envBackendBase) return envBackendBase

  const apiBase = getApiBase()
  if (/^https?:\/\//i.test(apiBase)) {
    return apiBase.replace(/\/api$/, '')
  }

  return apiBase.replace(/\/api$/, '')
}

export const resolveStorageUrl = (value?: string | null) => {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://')) return value

  const backendBase = getBackendBase()
  const normalizedValue = value.replace(/^\/+/, '')

  if (value.startsWith('/storage/')) return `${backendBase}${value}`
  if (value.startsWith('storage/')) return `${backendBase}/${value}`

  return `${backendBase}/storage/${normalizedValue}`
}
