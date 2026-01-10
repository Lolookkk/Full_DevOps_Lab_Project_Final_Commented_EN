import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import request from 'supertest'
import { startTestDb, stopTestDb, clearTestDb } from '../helpers/mongoTestDb.js'
import { Contact } from '../../src/models/contact.model.js'
import { User } from '../../src/models/user.model.js'
import Campaign from '../../src/models/campaign.model.js'

describe('Campaigns API', () => {
  let app
  let token

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret'
    await startTestDb()
    await Contact.init()
    await User.init()
    await Campaign.init()

    app = (await import('../../src/app.js')).default

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'campaign@test.com', password: 'pass1234' })
      .expect(201)
    token = res.body.token
  })

  afterAll(stopTestDb)
  beforeEach(clearTestDb)

  it('creates a campaign with multiple contacts and the list', async () => {
    const c1 = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Contact One', phoneE164: '+33600000001', consentStatus: true })
      .expect(201)

    const c2 = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Contact Two', phoneE164: '+33600000002', consentStatus: true })
      .expect(201)

    const campaignData = {
      name: 'Vitest Test Campaign',
      description: 'Test description',
      messageTemplate: 'Hello, here is a special offer !',
      contacts: [c1.body._id, c2.body._id],
      status: 'scheduled',
      scheduledDate: new Date(Date.now() + 86400000).toISOString() // Demain
    }

    const created = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .send(campaignData)
      .expect(201)

    expect(created.body.name).toBe(campaignData.name)
    expect(created.body.contacts.length).toBe(2)
    expect(created.body.status).toBe('scheduled')

    const listed = await request(app)
      .get('/api/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(listed.body.length).toBe(1)
    expect(listed.body[0].name).toBe(campaignData.name)
  })

  it('returns a 400 error if no contact is provided', async () => {
    const invalidCampaign = {
      name: 'Campaign Empty',
      messageTemplate: 'Test',
      contacts: []
    }

    await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidCampaign)
      .expect(400)
  })
})
