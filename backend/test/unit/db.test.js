import { beforeAll, describe, it, expect, vi } from 'vitest'

vi.mock('mongoose', () => {
  const connection = { readyState: 0, disconnect: vi.fn() }
  return {
    default: {
      set: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      connection
    }
  }
})

let connectDb
let disconnectDb
let dbState
let mongoose

beforeAll(async () => {
  mongoose = (await import('mongoose')).default
  const mod = await import('../../src/config/db.js')
  connectDb = mod.connectDb
  disconnectDb = mod.disconnectDb
  dbState = mod.dbState
})

describe('db config', () => {
  it('throws when MONGODB_URI is missing', async () => {
    await expect(connectDb()).rejects.toThrow('MONGODB_URI is missing')
  })

  it('connects and returns mongoose connection', async () => {
    const uri = 'mongodb://localhost:27017/test'
    mongoose.connect.mockResolvedValueOnce(mongoose.connection)
    const conn = await connectDb(uri)
    expect(mongoose.set).toHaveBeenCalledWith('strictQuery', true)
    expect(mongoose.connect).toHaveBeenCalledWith(uri, { serverSelectionTimeoutMS: 8000 })
    expect(conn).toBe(mongoose.connection)
  })

  it('disconnects when connected', async () => {
    mongoose.connection.readyState = 1
    await disconnectDb()
    expect(mongoose.disconnect).toHaveBeenCalled()
  })

  it('returns current db state', () => {
    mongoose.connection.readyState = 2
    expect(dbState()).toBe(2)
  })
})
