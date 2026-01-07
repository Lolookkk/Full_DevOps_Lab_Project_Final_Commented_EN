/**
 * App entrypoint.
 * We keep the HTTP listener separate from the Express app instance so
 * tests can import `app` without opening a real port.
 */
import 'dotenv/config'
import app from './app.js'
import { connectDb } from './config/db.js'

const port = process.env.PORT || 3000

async function bootstrap () {
  try {
    await connectDb(process.env.MONGODB_URI)
    console.log('[db] connected')
  } catch (err) {
    console.error('[db] connection failed:', err.code, err.message)
  }

  app.listen(port, () => {
    console.log(`[server] listening on http://localhost:${port}`)
  })
}

bootstrap()
