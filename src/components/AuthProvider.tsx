import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextType } from '../hooks/authContext'
import * as authService from '../services/auth'
import type { LoginCredentials, RegisterData, User } from '../types/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    authService.restoreSession()
      .then((user) => { if (active) setUser(user) })
      .catch(() => { if (active) setUser(null) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  async function login(credentials: LoginCredentials) {
    const user = await authService.login(credentials)
    setUser(user)
  }

  async function register(data: RegisterData) {
    const user = await authService.register(data)
    setUser(user)
    return !!user
  }

  async function logout() {
    await authService.logout()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
