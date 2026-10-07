export interface User {
  id: string
  username: string
  name: string
  role: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  name: string
  username: string
  password: string
}
