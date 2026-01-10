import mongoose from 'mongoose'
import 'dotenv/config'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { User } from './models/user.model.js'
import { Contact } from './models/contact.model.js'
import { Event } from './models/event.model.js'
import Campaign from './models/campaign.model.js'
import Message from './models/message.model.js'

const MONGODB_URI = process.env.MONGODB_URI

async function seed () {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connecté à MongoDB')

    // ─── RESET ───────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Contact.deleteMany({}),
      Event.deleteMany({}),
      Campaign.deleteMany({}),
      Message.deleteMany({})
    ])
    console.log('🧹 Collections vidées')

    // ─── USER ────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('123456', 10)

    const user = await User.create({
      email: 'test@test.com',
      passwordHash,
      mfaEnabled: false
    })
    console.log('👤 User créé:', user.email)

    // ─── CONTACTS ────────────────────────────────────────────
    const [contact1, contact2] = await Contact.create([
      {
        userId: user._id,
        name: 'Jean Dupont',
        phoneE164: '+33612345678',
        relationshipType: 'friend',
        isFavorite: true,
        consentStatus: true
      },
      {
        userId: user._id,
        name: 'Marie Martin',
        phoneE164: '+33687654321',
        relationshipType: 'family',
        isFavorite: false,
        consentStatus: true
      }
    ])

    console.log('📇 Contacts créés')

    // ─── EVENTS ──────────────────────────────────────────────
    const [event1, event2, event3] = await Event.create([
      {
        userId: user._id,
        contactId: contact1._id,
        type: 'birthday',
        label: 'Anniversaire de Jean',
        date: new Date('2024-05-15T00:00:00Z'),
        timezone: 'Europe/Paris'
      },
      {
        userId: user._id,
        contactId: contact1._id,
        type: 'anniversary',
        label: 'Mariage de Jean',
        date: new Date('2024-09-10T00:00:00Z'),
        timezone: 'Europe/Paris'
      },
      {
        userId: user._id,
        contactId: contact2._id,
        type: 'birthday',
        label: 'Anniversaire de Marie',
        date: new Date('2025-02-20T00:00:00Z'),
        timezone: 'Europe/Paris'
      }
    ])

    console.log('🎉 3 événements créés')

    // ─── CAMPAIGN ────────────────────────────────────────────
    const campaign = await Campaign.create({
      name: 'Nouvelle année',
      description: 'Campagne de test automatique',
      creator: user._id,
      contacts: [contact1._id, contact2._id],
      messageTemplate: 'Bonjour {name}, meilleurs vœux 🎉',
      status: 'draft',
      scheduledDate: new Date()
    })

    console.log('📢 Campaign créée')

    // ─── MESSAGES ────────────────────────────────────────────
    const messages = await Message.create([
      {
        sender: user._id,
        recipient: contact1._id,
        event: event1._id,
        campaign: campaign._id,
        content: 'Joyeux anniversaire Jean 🎂',
        status: 'sent',
        scheduledAt: new Date(),
        sentAt: new Date()
      },
      {
        sender: user._id,
        recipient: contact1._id,
        event: event2._id,
        campaign: campaign._id,
        content: 'Félicitations pour ton mariage 💍',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000)
      },
      {
        sender: user._id,
        recipient: contact2._id,
        event: event3._id,
        campaign: campaign._id,
        content: 'Bon anniversaire Marie 🎉',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
      }
    ])

    console.log(`✉️ ${messages.length} messages créés`)

    // ─── TOKEN ───────────────────────────────────────────────
    const token = jwt.sign(
      { sub: user._id, id: user._id, email: user.email },
      process.env.JWT_SECRET || 'test42',
      { expiresIn: '1d' }
    )

    console.log('\n🔑 TOKEN DE TEST :\n')
    console.log(token)
    console.log('\n')

    console.log('🎯 Seed terminé avec succès')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur seed:', error)
    process.exit(1)
  }
}

seed()
