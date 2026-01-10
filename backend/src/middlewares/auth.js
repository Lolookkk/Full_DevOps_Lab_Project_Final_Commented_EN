import jwt from 'jsonwebtoken'

export function auth (req, res, next) {
  const header = req.header('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing token' })

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return res.status(500).json({ error: 'JWT_SECRET is missing' })
    const payload = jwt.verify(token, secret)
    req.userId = payload.sub || payload.id
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
