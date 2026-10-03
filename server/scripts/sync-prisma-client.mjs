import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rootDir = path.resolve(serverDir, '..')
const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma')
const prismaBin = path.join(serverDir, 'node_modules', 'prisma', 'build', 'index.js')

if (!existsSync(prismaBin)) {
  console.error('[sync-prisma-client] prisma CLI not found in server/node_modules. Run `npm install` in server/ first.')
  process.exit(1)
}

if (!existsSync(schemaPath)) {
  console.error(`[sync-prisma-client] Prisma schema not found at ${schemaPath}`)
  process.exit(1)
}

const generate = spawnSync(process.execPath, [prismaBin, 'generate', '--schema', schemaPath], {
  cwd: serverDir,
  stdio: 'inherit',
})

if (generate.status !== 0) {
  process.exit(generate.status ?? 1)
}

const generatedClientDir = path.join(rootDir, 'node_modules', '@prisma', 'client')
const generatedRuntimeDir = path.join(rootDir, 'node_modules', '.prisma')

if (!existsSync(path.join(generatedRuntimeDir, 'client', 'index.d.ts'))) {
  console.error('[sync-prisma-client] generated client missing from root node_modules/.prisma/client')
  process.exit(1)
}

const serverModulesDir = path.join(serverDir, 'node_modules')
const copies = [
  [generatedClientDir, path.join(serverModulesDir, '@prisma', 'client')],
  [generatedRuntimeDir, path.join(serverModulesDir, '.prisma')],
]

for (const [src, dst] of copies) {
  if (!existsSync(src)) {
    console.error(`[sync-prisma-client] missing generated output: ${src}`)
    process.exit(1)
  }
  rmSync(dst, { recursive: true, force: true })
  cpSync(src, dst, { recursive: true })
}

console.log('[sync-prisma-client] generated Prisma Client synced into server/node_modules')
