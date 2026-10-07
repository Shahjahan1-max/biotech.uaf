export interface RegisterInput {
  name: string
  username: string
  password: string
}

export interface LoginInput {
  username: string
  password: string
}

export interface AuthUser {
  id: string
  username: string
  name: string
  role: string
}

export interface AuthResponse {
  user: AuthUser
}
