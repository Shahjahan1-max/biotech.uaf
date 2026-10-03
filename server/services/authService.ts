import { getUser } from '@netlify/identity'
import { getDatabase } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { records as portal } from '../../db/repository.js'
import type { AuthUser } from '../types/auth.js'

export async function getSessionUser(): Promise<AuthUser | null> {
  const identityUser = await getUser()
  if (!identityUser?.email) return null
  const role = identityUser.roles?.some((value) => value.toUpperCase() === 'ADMIN') ? 'ADMIN' : 'STUDENT'
  const profile = {
    email: identityUser.email.toLowerCase(),
    name: identityUser.name || identityUser.email,
    role,
  } as const
  const [user] = await getDatabase().insert(users).values({ id: identityUser.id, ...profile })
    .onConflictDoUpdate({ target: users.id, set: profile }).returning()
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await portal.user.findUnique({ where: { id }, include: { role: true } })
  return user ? { id: user.id, email: user.email, name: user.name, role: user.role.name } : null
}
