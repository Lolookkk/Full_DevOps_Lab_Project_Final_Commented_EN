import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { User } from './models/user.model.js'
import { Contact } from './models/contact.model.js'
import { Event } from './models/event.model.js'
import Campaign from './models/campaign.model.js'
import Message from './models/message.model.js'
import jwt from 'jsonwebtoken'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mojodream91_db_user:SwgWGRQVyccfUAPR@cluster0.zj7lmja.mongodb.net/?appName=Cluster0'

async function seed () {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connecté à MongoDB')

    // --- RESET ---
    await User.deleteMany({})
    await Contact.deleteMany({})
    await Event.deleteMany({})
    await Campaign.deleteMany({})
    await Message.deleteMany({})
    console.log('🧹 Collections vidées')

    // --- USER ---
    const passwordHash = await bcrypt.hash('123456', 10)
    const user = await User.create({
      email: 'test@test.com',
      passwordHash,
      mfaEnabled: false
    })
    console.log('👤 User créé:', user.email)

    // --- CONTACT ---
    const contact = await Contact.create({
      userId: user._id,
      name: 'Jean Dupont',
      phoneE164: '+33612345678',
      relationshipType: 'friend',
      isFavorite: true,
      consentStatus: true
    })
    console.log('📇 Contact créé:', contact.name)

    // --- EVENT ---
    const event = await Event.create({
      userId: user._id,
      contactId: contact._id,
      type: 'birthday',
      label: 'Anniversaire de Jean',
      date: new Date('1990-05-15T00:00:00Z'),
      timezone: 'Europe/Paris'
    })
    console.log('🎉 Event créé:', event.label)

    // --- CAMPAIGN ---
    const campaign = await Campaign.create({
      name: 'Campagne test',
      description: 'Envoi automatique test',
      creator: user._id,
      contacts: [contact._id],
      messageTemplate: 'Bonjour {name}, joyeux anniversaire !',
      status: 'draft',
      scheduledDate: new Date()
    })
    console.log('📢 Campaign créée:', campaign.name)

    // --- MESSAGES ---
    const messages = await Message.create([
      {
        sender: user._id,
        recipient: contact._id,
        event: event._id,
        campaign: campaign._id,
        content: 'Joyeux anniversaire Jean ! 🎂',
        status: 'sent',
        scheduledAt: new Date(),
        sentAt: new Date()
      },
      {
        sender: user._id,
        recipient: contact._id,
        content: 'Rappel test',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000) // +1h
      }
    ])
    console.log('✉️ Messages créés:', messages.length)

    console.log('🎯 Seed terminé avec succès !')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur seed:', error)
    process.exit(1)
  }
}

const token = jwt.sign({ id: 'id_user_seeded' }, 'test42', { expiresIn: '1d' })
console.log(token)

seed()
