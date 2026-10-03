import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextType } from '../hooks/authContext'
import * as authService from '../services/auth'
import type { LoginCredentials, RegisterData, User } from '../types/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    authService.getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(credentials: LoginCredentials) {
    const user = await authService.login(credentials)
    setUser(user)
  }

  async function register(data: RegisterData) {
    await authService.register(data)
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
