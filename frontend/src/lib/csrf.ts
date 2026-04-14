import { buildApiUrl, getApiBaseCandidates, rememberApiBase } from './api'

const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

const resolveCsrfEndpoint = (apiBase: string) => {
  try {
    const apiUrl = new URL(buildApiUrl(apiBase, '/ping'))
    return `${apiUrl.origin}${apiUrl.pathname.replace(/\/api\/ping$/, '')}/sanctum/csrf-cookie`
  } catch {
    return `${apiBase.replace(/\/api$/, '')}/sanctum/csrf-cookie`
  }
}

export const ensureCsrfToken = async (preferredApiBase?: string) => {
  const candidates = preferredApiBase
    ? [preferredApiBase, ...getApiBaseCandidates()]
    : getApiBaseCandidates()

  let lastResponse: Response | null = null

  for (const apiBase of candidates.filter((value, index, list) => list.indexOf(value) === index)) {
    const endpoint = resolveCsrfEndpoint(apiBase)
    const response = await fetch(endpoint, {
      credentials: 'include',
    })

    if (response.status === 404) {
      lastResponse = response
      continue
    }

    rememberApiBase(apiBase)
    return getCookieValue('XSRF-TOKEN')
  }

  if (lastResponse) {
    throw new Error('Endpoint CSRF tidak ditemukan di server')
  }

  return getCookieValue('XSRF-TOKEN')
}

export const resetCsrfToken = () => {
  // No in-memory cache is used, keep API for callers that clear auth state.
}
