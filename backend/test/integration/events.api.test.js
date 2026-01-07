import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'
import { startTestDb, stopTestDb, clearTestDb } from '../helpers/mongoTestDb.js'

describe('Events API', () => {
  beforeAll(startTestDb)
  afterAll(stopTestDb)
  beforeEach(clearTestDb)

  it('creates and lists events', async () => {
    const contact = await request(app)
      .post('/api/contacts')
      .send({ name: 'Lina', phoneE164: '+33699999999' })
      .expect(201)

    const created = await request(app)
      .post('/api/events')
      .send({
        contactId: contact.body._id,
        type: 'birthday',
        date: '2000-01-01T00:00:00.000Z'
      })
      .expect(201)

    expect(created.body.type).toBe('birthday')

    const listed = await request(app)
      .get('/api/events')
      .expect(200)

    expect(listed.body.length).toBe(1)
  })
})
