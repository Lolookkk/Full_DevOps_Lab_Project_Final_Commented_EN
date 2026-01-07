/**
 * Centralized Express error handler.
 * Ensures consistent JSON error shape across the API.
 */
export function errorHandler (err, _req, res, _next) {
  if (err?.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key', details: err.keyValue })
  }
  const status = err?.status ?? 500
  const message = err?.message ?? 'Internal Server Error'
  res.status(status).json({ error: true, message })
}
