import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import request from 'supertest'
import { startTestDb, stopTestDb, clearTestDb } from '../helpers/mongoTestDb.js'
import { Contact } from '../../src/models/contact.model.js'
import { User } from '../../src/models/user.model.js'

describe('Contacts API', () => {
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
      .send({ email: 'contacts@test.com', password: 'pass1234' })
      .expect(201)
    token = res.body.token
  })
  afterAll(stopTestDb)
  beforeEach(clearTestDb)

  it('creates and lists contacts', async () => {
    const created = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Laura', phoneE164: '+33612345678', consentStatus: true })
      .expect(201)

    expect(created.body.name).toBe('Laura')

    const listed = await request(app)
      .get('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(listed.body.length).toBe(1)
  })

  it('returns 409 on duplicate phoneE164 for same user', async () => {
    await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Dup', phoneE164: '+33600000000' })
      .expect(201)

    const dup = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Dup2', phoneE164: '+33600000000' })
      .expect(409)

    expect(dup.body.error).toBe('Duplicate key')
  })

  it('gets, updates, and deletes a contact', async () => {
    const created = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ToUpdate', phoneE164: '+33600000010' })
      .expect(201)

    const fetched = await request(app)
      .get(`/api/contacts/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(fetched.body._id).toBe(created.body._id)

    const updated = await request(app)
      .put(`/api/contacts/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated' })
      .expect(200)

    expect(updated.body.name).toBe('Updated')

    await request(app)
      .delete(`/api/contacts/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  it('returns 404 when contact not found', async () => {
    const missingId = '64b7f3c2f1b2a3c4d5e6f123'

    await request(app)
      .get(`/api/contacts/${missingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    await request(app)
      .put(`/api/contacts/${missingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nope' })
      .expect(404)

    await request(app)
      .delete(`/api/contacts/${missingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })
})
