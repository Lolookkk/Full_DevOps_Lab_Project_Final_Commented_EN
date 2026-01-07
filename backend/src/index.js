/**
 * App entrypoint.
 * We keep the HTTP listener separate from the Express app instance so
 * tests can import `app` without opening a real port.
 */
import 'dotenv/config'
import app from './app.js'
import { connectDb } from './config/db.js'
// console.log('MONGODB_URI =', process.env.MONGODB_URI) log line for debug
// console.log('INDEX EXECUTÉ', new Date().toISOString())
// console.log('INDEX PATH =', new URL(import.meta.url).pathname)
// console.log('CWD =', process.cwd())
// console.log('MONGODB_URI =', process.env.MONGODB_URI)

const port = process.env.PORT || 3000

async function bootstrap () {
  try {
    // console.log('[env] MONGODB_URI set:', Boolean(process.env.MONGODB_URI))
    // console.log('MONGODB_URI =', process.env.MONGODB_URI) debug
    await connectDb(process.env.MONGODB_URI)
    console.log('[db] connected')
  } catch (err) {
    console.error('[db] connection failed:', err.message)
  }

  app.listen(port, () => {
    console.log(`[server] listening on http://localhost:${port}`)
  })
}

bootstrap()
