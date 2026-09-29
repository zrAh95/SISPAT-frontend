import type { ApiError } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
let csrfToken = ''

export function setCsrfToken(token: string) {
  csrfToken = token
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers)
  const isFormData = options.body instanceof FormData
  if (!isFormData && options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (csrfToken && options.method && options.method !== 'GET') {
    headers.set('X-CSRF-Token', csrfToken)
  }

  const requestBody: BodyInit | undefined = isFormData
    ? (options.body as FormData)
    : options.body === undefined
      ? undefined
      : JSON.stringify(options.body)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body: requestBody,
  })

  if (!response.ok) {
    let message = 'Terjadi kesalahan pada server'
    try {
      const data = (await response.json()) as ApiError
      message = data.pesan || message
    } catch {
      // Response bukan JSON.
    }
    const error = new Error(message) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}
