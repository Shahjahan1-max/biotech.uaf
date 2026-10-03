import { drizzle } from 'drizzle-orm/netlify-db'
import * as schema from './schema.js'

function createDatabase() {
  return drizzle({ schema })
}

let database: ReturnType<typeof createDatabase> | undefined

export function getDatabase() {
  return database ??= createDatabase()
}
