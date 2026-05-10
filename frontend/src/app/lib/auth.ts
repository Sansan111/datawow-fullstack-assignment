import api from './axios'

export const POLLING_INTERVAL = 10000

interface AuthResponse {
  access_token: string
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', { email, password })
  return res.data
}

export async function registerUser(name: string, email: string, password: string, role?: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', { name, email, password, role })
  return res.data
}

export function saveToken(token: string) {
  localStorage.setItem('token', token)
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function removeToken() {
  localStorage.removeItem('token')
}

export function parseToken(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } }
    return axiosErr.response?.data?.message || fallback
  }
  return err instanceof Error ? err.message : fallback
}
