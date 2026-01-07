import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { startTestDb, stopTestDb, clearTestDb } from '../helpers/mongoTestDb.js'
import { User } from '../../src/models/user.model.js'
import { Contact } from '../../src/models/contact.model.js'
import { Event } from '../../src/models/event.model.js'

describe('Mongoose models', () => {
  beforeAll(async () => {
    await startTestDb()
    await Contact.init()
  })
  afterAll(stopTestDb)
  beforeEach(clearTestDb)

  it('validates E.164 phone numbers', async () => {
    const u = await User.create({ email: 'a@a.com', passwordHash: 'x' })
    await expect(
      Contact.create({ userId: u._id, name: 'Test', phoneE164: '0612345678' })
    ).rejects.toThrow(/E\.164/i)
  })

  it('enforces unique (userId, phoneE164) for contacts', async () => {
    const u = await User.create({ email: 'b@b.com', passwordHash: 'x' })
    await Contact.create({ userId: u._id, name: 'A', phoneE164: '+33612345678' })
    await expect(
      Contact.create({ userId: u._id, name: 'B', phoneE164: '+33612345678' })
    ).rejects.toThrow()
  })

  it('enforces unique email for users', async () => {
    await User.create({
      email: 'unique@test.com',
      passwordHash: 'hash1'
    })

    await expect(
      User.create({
        email: 'unique@test.com',
        passwordHash: 'hash2'
      })
    ).rejects.toThrow()
  })

  it('creates an event linked to a contact', async () => {
    const u = await User.create({ email: 'c@c.com', passwordHash: 'x' })
    const c = await Contact.create({ userId: u._id, name: 'C', phoneE164: '+33611111111' })
    const e = await Event.create({ userId: u._id, contactId: c._id, type: 'birthday', date: new Date('2000-01-01') })
    expect(e.type).toBe('birthday')
  })
})
