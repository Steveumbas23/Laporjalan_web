import { getApiBaseCandidates, isApiHtmlFallbackResponse, rememberApiBase } from './api'

const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

const normalizeEndpoint = (value: string) => value.replace(/([^:]\/)\/+/g, '$1')

const toAbsoluteUrl = (value: string) => {
  if (/^https?:\/\//i.test(value)) return value
  if (typeof window === 'undefined') return value
  return new URL(value.startsWith('/') ? value : `/${value}`, window.location.origin).toString()
}

const getCsrfEndpoints = (apiBase: string) => {
  const baseWithoutApi = apiBase.replace(/\/api$/, '')
  const candidates = [
    `${baseWithoutApi}/sanctum/csrf-cookie`,
    `${baseWithoutApi.replace(/\/backend\/public$/, '')}/sanctum/csrf-cookie`,
    '/sanctum/csrf-cookie',
    '/backend/public/sanctum/csrf-cookie',
  ]

  return candidates
    .map((value) => normalizeEndpoint(toAbsoluteUrl(value)))
    .filter((value, index, list) => list.indexOf(value) === index)
}

export const ensureCsrfToken = async (preferredApiBase?: string) => {
  const candidates = preferredApiBase
    ? [preferredApiBase, ...getApiBaseCandidates()]
    : getApiBaseCandidates()

  let lastResponse: Response | null = null

  for (const apiBase of candidates.filter((value, index, list) => list.indexOf(value) === index)) {
    for (const endpoint of getCsrfEndpoints(apiBase)) {
      const response = await fetch(endpoint, {
        credentials: 'include',
      })

      if (response.status === 404 || isApiHtmlFallbackResponse(response)) {
        lastResponse = response
        continue
      }

      rememberApiBase(apiBase)
      return getCookieValue('XSRF-TOKEN')
    }
  }

  if (lastResponse) {
    return getCookieValue('XSRF-TOKEN')
  }

  return getCookieValue('XSRF-TOKEN')
}

export const resetCsrfToken = () => {
  // No in-memory cache is used, keep API for callers that clear auth state.
}
