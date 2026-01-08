/**
 * Express app configuration.
 * Responsibilities:
 *  - Base routes (/, /health)
 *  - Auto-mount all routers in src/routes/auto/*.route.js
 *  - Global error handler (consistent JSON for errors)
 */
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { errorHandler } from './utils/errorHandler.js'
import { dbState } from './config/db.js'
import { auth } from './middlewares/auth.js'
import authRoutes from './routes/auth.routes.js'
import contactsRoutes from './routes/contacts.routes.js'
import eventsRoutes from './routes/events.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())

// Simple root + health endpoints
app.get('/', (_req, res) => res.json({ ok: true, message: 'Hello from CI/CD demo 👋' }))
app.get('/health', (_req, res) => res.status(200).send('OK'))
app.get('/health/db', (_req, res) => {
  const state = dbState()
  const map = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }
  const status = map[state] ?? 'unknown'
  const ok = state === 1
  return res.status(ok ? 200 : 503).json({ ok, db: status })
})
app.use(authRoutes)
app.use('/api', auth)
app.use(contactsRoutes)
app.use(eventsRoutes)

// Auto-mount all routers placed under src/routes/auto
const autoDir = path.join(__dirname, 'routes', 'auto')
const mountAutoRoutes = async () => {
  if (!fs.existsSync(autoDir)) return

  const files = fs.readdirSync(autoDir).filter(f => f.endsWith('.route.js'))
  for (const f of files) {
    const fullPath = path.join(autoDir, f)
    const url = pathToFileURL(fullPath)
    const mod = await import(url.href)

    // Support: export default router OR export const router = ...
    const router = mod.default ?? mod.router
    if (router) app.use('/', router)
  }
}

// ESM dynamic import we await before serving requests
await mountAutoRoutes()

// Global error middleware last
app.use(errorHandler)

export default app
