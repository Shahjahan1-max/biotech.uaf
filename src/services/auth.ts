import { login as identityLogin, signup, logout as identityLogout, getUser, handleAuthCallback } from '@netlify/identity'
import { apiFetch } from './api'
import type { LoginCredentials, RegisterData, User } from '../types/auth'

export async function login(credentials: LoginCredentials): Promise<User> {
  await identityLogin(credentials.email.trim().toLowerCase(), credentials.password)
  return getCurrentUser()
}

export async function register(data: RegisterData): Promise<User | null> {
  const user = await signup(data.email.trim().toLowerCase(), data.password, { full_name: data.name.trim() })
  return user.confirmedAt ? getCurrentUser() : null
}

export async function logout(): Promise<void> {
  await identityLogout()
}

export async function getCurrentUser(): Promise<User> {
  if (!(await getUser())) throw new Error('Authentication required')
  const data = await apiFetch<{ user: User }>('/auth/me')
  return data.user
}

let restoringSession: Promise<User> | undefined

export function restoreSession(): Promise<User> {
  restoringSession ??= handleAuthCallback().then(getCurrentUser).finally(() => { restoringSession = undefined })
  return restoringSession
}
