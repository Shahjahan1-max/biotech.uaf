import { createContext } from 'react'
import type { AuthState, LoginCredentials, RegisterData } from '../types/auth'

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)
