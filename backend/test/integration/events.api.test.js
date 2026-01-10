import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import request from 'supertest'
import { startTestDb, stopTestDb, clearTestDb } from '../helpers/mongoTestDb.js'
import { Contact } from '../../src/models/contact.model.js'
import { User } from '../../src/models/user.model.js'

describe('Events API', () => {
  let app
  let token

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret'
    await startTestDb()
    await Contact.init()
    await User.init()
    app = (await import('../../src/app.js')).default

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'events@test.com', password: 'pass1234' })
      .expect(201)
    token = res.body.token
  })
  afterAll(stopTestDb)
  beforeEach(clearTestDb)

  it('creates and lists events', async () => {
    const contact = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lina', phoneE164: '+33699999999' })
      .expect(201)

    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        contactId: contact.body._id,
        type: 'birthday',
        date: '2000-01-01T00:00:00.000Z'
      })
      .expect(201)

    expect(created.body.type).toBe('birthday')

    const listed = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(listed.body.length).toBe(1)
  })

  it('returns 400 when contactId is invalid', async () => {
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        contactId: '64b7f3c2f1b2a3c4d5e6f999',
        type: 'birthday',
        date: '2000-01-01T00:00:00.000Z'
      })
      .expect(400)
  })

  it('updates and deletes an event', async () => {
    const contact = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Eva', phoneE164: '+33611111112' })
      .expect(201)

    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        contactId: contact.body._id,
        type: 'custom',
        label: 'Test',
        date: '2001-01-01T00:00:00.000Z'
      })
      .expect(201)

    const updated = await request(app)
      .put(`/api/events/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ label: 'Updated' })
      .expect(200)

    expect(updated.body.label).toBe('Updated')

    await request(app)
      .delete(`/api/events/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  it('returns 404 when event not found', async () => {
    const missingId = '64b7f3c2f1b2a3c4d5e6f124'

    await request(app)
      .get(`/api/events/${missingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    await request(app)
      .put(`/api/events/${missingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ label: 'Nope' })
      .expect(404)

    await request(app)
      .delete(`/api/events/${missingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })
})
