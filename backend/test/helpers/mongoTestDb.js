import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongo

export async function startTestDb () {
  mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()
  await mongoose.connect(uri)
}

export async function stopTestDb () {
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
}

export async function clearTestDb () {
  const collections = await mongoose.connection.db.collections()
  for (const c of collections) await c.deleteMany({})
}
