const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

const resolveCsrfEndpoint = (apiBase: string) => {
  try {
    const url = new URL(apiBase)
    return `${url.origin}/sanctum/csrf-cookie`
  } catch {
    return '/sanctum/csrf-cookie'
  }
}

export const ensureCsrfToken = async (apiBase: string) => {
  const endpoint = resolveCsrfEndpoint(apiBase)
  await fetch(endpoint, {
    credentials: 'include',
  })
  return getCookieValue('XSRF-TOKEN')
}
