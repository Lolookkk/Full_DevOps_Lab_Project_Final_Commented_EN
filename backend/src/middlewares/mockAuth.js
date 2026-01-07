import mongoose from 'mongoose'

/**
 * Temporary auth for TP: injects a stable userId in req.userId.
 * Later replaced by real JWT auth middleware.
 */
export function mockAuth (req, _res, next) {
  const headerUserId = req.header('x-user-id')
  req.userId = headerUserId || new mongoose.Types.ObjectId('64b7f3c2f1b2a3c4d5e6f789').toString()
  next()
}
