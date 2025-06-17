import fs from 'fs'
import path from 'path'

export function getAppRoutes(
  dir = path.join(process.cwd(), 'src', 'app'),
  base = ''
) {
  const routes = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  if (entries.some(e => e.isFile() && /^page\.(js|jsx|ts|tsx)$/.test(e.name))) {
    routes.push({ name: base || '/', url: base || '/' })
  }

  for (const e of entries) {
    if (!e.isDirectory() || e.name === 'api' || e.name.startsWith('(')) continue
    const nestedDir  = path.join(dir, e.name)
    const nestedBase = path.posix.join(base, e.name)
    routes.push(...getAppRoutes(nestedDir, nestedBase))
  }

  return routes
}