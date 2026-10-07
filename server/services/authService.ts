import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma.js'
import { config } from '../config/env.js'
import type { AuthUser, LoginInput, RegisterInput } from '../types/auth.js'


const SALT_ROUNDS = 12

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const existingUser = await prisma.user.findUnique({
    where: { username: input.username },
    select: { id: true },
  })

  if (existingUser) {
    throw new Error('Username already registered')
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

  const studentRole = await prisma.role.findUnique({
    where: { name: 'STUDENT' },
  })

  if (!studentRole) {
    throw new Error('Default role not found')
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      username: input.username,
      passwordHash,
      roleId: studentRole.id,
    },
    include: { role: true },
  })

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role.name,
  }
}

export async function loginUser(input: LoginInput): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { username: input.username },
    include: { role: true },
  })

  if (!user) {
    throw new Error('Invalid username or password')
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash)

  if (!isValid) {
    throw new Error('Invalid username or password')
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role.name,
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { userId: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  )
}

export function verifyToken(token: string): { userId: string; role: string } {
  return jwt.verify(token, config.jwtSecret) as { userId: string; role: string }
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      name: true,
      role: { select: { name: true } },
    },
  })

  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role.name,
  }
}
