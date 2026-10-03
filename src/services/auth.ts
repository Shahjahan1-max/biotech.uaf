import { apiFetch } from './api'
import type { LoginCredentials, RegisterData, User } from '../types/auth'

export async function login(credentials: LoginCredentials): Promise<User> {
  const data = await apiFetch<{ user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  return data.user
}

export async function register(data: RegisterData): Promise<User> {
  const response = await apiFetch<{ user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.user
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' })
}

export async function getCurrentUser(): Promise<User> {
  const data = await apiFetch<{ user: User }>('/auth/me')
  return data.user
}
