import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import { startTestDb, stopTestDb, clearTestDb } from '../helpers/mongoTestDb.js'
import { Contact } from '../../src/models/contact.model.js'
import { User } from '../../src/models/user.model.js'
import Message from '../../src/models/message.model.js'

vi.mock('../../src/config/whatsapp.js', () => ({
  default: { sendMessage: vi.fn() }
}))

describe('Messages API', () => {
  let app
  let token
  let whatsappClient

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret'
    await startTestDb()
    await Contact.init()
    await User.init()
    await Message.init()
    whatsappClient = (await import('../../src/config/whatsapp.js')).default
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

  it('sends immediately and marks as sent', async () => {
    const contact = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Immediate', phoneE164: '+33625671890' })
      .expect(201)

    whatsappClient.sendMessage.mockResolvedValueOnce()

    const created = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        recipientId: contact.body._id,
        content: 'Send now'
      })
      .expect(201)

    expect(created.body.status).toBe('sent')
    expect(created.body.sentAt).toBeTruthy()
  })

  it('returns 500 on WhatsApp failure', async () => {
    const contact = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'FailSend', phoneE164: '+33625671891' })
      .expect(201)

    whatsappClient.sendMessage.mockRejectedValueOnce(new Error('boom'))

    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        recipientId: contact.body._id,
        content: 'Send now'
      })
      .expect(500)

    expect(res.body.error).toBe('WhatsApp failure')
  })

  it('returns 404 when recipient is missing', async () => {
    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        recipientId: '64b7f3c2f1b2a3c4d5e6f321',
        content: 'Hello',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 3600000).toISOString()
      })
      .expect(404)
  })

  it('returns 400 when message is invalid', async () => {
    const contact = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'NoContent', phoneE164: '+33625671899' })
      .expect(201)

    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        recipientId: contact.body._id,
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 3600000).toISOString()
      })
      .expect(400)
  })
})
