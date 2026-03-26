import { useAuthStore } from '@/store/authStore'

/**
 * Wrapper around fetch that automatically:
 * 1. Injects the Bearer token
 * 2. On 401, attempts a token refresh and retries once
 * 3. On second 401, logs the user out
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { token, refreshAccessToken, logout } = useAuthStore.getState()

  const withAuth = (t: string | null): RequestInit => ({
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
  })

  let res = await fetch(url, withAuth(token))

  if (res.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      const newToken = useAuthStore.getState().token
      res = await fetch(url, withAuth(newToken))
    } else {
      logout()
    }
  }

  return res
}
