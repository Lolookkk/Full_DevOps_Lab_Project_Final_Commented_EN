import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import request from 'supertest'
import { startTestDb, stopTestDb, clearTestDb } from '../helpers/mongoTestDb.js'
import { Contact } from '../../src/models/contact.model.js'
import { User } from '../../src/models/user.model.js'
import Message from '../../src/models/message.model.js'

describe('Messages API', () => {
  let app
  let token

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret'
    await startTestDb()
    await Contact.init()
    await User.init()
    await Message.init()
    app = (await import('../../src/app.js')).default

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'messages@test.com', password: 'pass1234' })
    token = res.body.token
  })

  afterAll(stopTestDb)
  beforeEach(clearTestDb)

  it('creates a scheduled message and lists it', async () => {
    const contact = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Aurel', phoneE164: '+33625671898' })
      .expect(201)

    const msgData = {
      recipientId: contact.body._id,
      content: 'Scheduled test message.',
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 3600000).toISOString()
    }

    const created = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send(msgData)
      .expect(201)

    expect(created.body.content).toBe(msgData.content)
    expect(created.body.status).toBe('scheduled')

    const listed = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(listed.body.length).toBe(1)
    expect(listed.body[0].recipient._id).toBe(contact.body._id)
  })
})