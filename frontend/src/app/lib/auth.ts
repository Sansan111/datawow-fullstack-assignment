import api from './axios'

interface AuthResponse {
  access_token: string
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', { email, password })
  return res.data
}

export async function registerUser(email: string, password: string, role?: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', { email, password, role })
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
