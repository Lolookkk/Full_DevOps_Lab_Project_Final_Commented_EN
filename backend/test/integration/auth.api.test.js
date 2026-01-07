import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import request from 'supertest'
import { startTestDb, stopTestDb, clearTestDb } from '../helpers/mongoTestDb.js'

describe('Auth API', () => {
  let app

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret'
    await startTestDb()
    app = (await import('../../src/app.js')).default
  })

  afterAll(stopTestDb)
  beforeEach(clearTestDb)

  it('registers a user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'auth@test.com', password: 'pass1234' })
      .expect(201)

    expect(typeof res.body.token).toBe('string')
  })

  it('rejects register when missing fields', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'missing@test.com' })
      .expect(400)
  })

  it('rejects login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'wrongpass@test.com', password: 'pass1234' })
      .expect(201)

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrongpass@test.com', password: 'bad' })
      .expect(401)
  })

  it('blocks access without token', async () => {
    await request(app)
      .get('/api/contacts')
      .expect(401)
  })

  it('logs in and accesses protected contacts', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@test.com', password: 'pass1234' })
      .expect(201)

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'pass1234' })
      .expect(200)

    const token = login.body.token
    expect(typeof token).toBe('string')

    await request(app)
      .get('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })
})
