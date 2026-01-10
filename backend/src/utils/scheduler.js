import cron from 'node-cron'
import Message from '../models/message.model.js'
import Campaign from '../models/campaign.model.js'
import { Event } from '../models/event.model.js'
import whatsappClient from '../config/whatsapp.js'

// 1. EVENT SCANNER
const generateMessagesFromEvents = async () => {
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()
  const currentYear = today.getFullYear()

  try {
    // Find events matching today's Day and Month
    const eventsToday = await Event.find({
      $expr: {
        $and: [
          { $eq: [{ $dayOfMonth: '$date' }, currentDay] },
          { $eq: [{ $month: '$date' }, currentMonth] }
        ]
      }
    }).populate('contactId')

    for (const event of eventsToday) {
      // Check if we already created a message for this event TODAY
      const alreadyCreated = await Message.exists({
        event: event._id,
        scheduledAt: {
          $gte: new Date(currentYear, currentMonth - 1, currentDay),
          $lt: new Date(currentYear, currentMonth - 1, currentDay + 1)
        }
      })

      if (!alreadyCreated) {
        await Message.create({
          sender: event.userId,
          recipient: event.contactId._id,
          event: event._id,
          content: event.label || 'Joyeux anniversaire !',
          status: 'scheduled', // We set it to 'scheduled' so the next function picks it up
          scheduledAt: new Date() // Schedule for NOW
        })
        console.log(`[scheduler] Message d'anniversaire généré pour ${event.contactId.name}`)
      }
    }
  } catch (err) {
    console.error('[scheduler] Erreur génération events:', err)
  }
}

// 2. MESSAGE PROCESSOR
const processPendingMessages = async () => {
  const now = new Date()

  try {
    // FIX: Look for BOTH 'scheduled' AND 'pending' statuses
    const pendingMessages = await Message.find({
      status: { $in: ['scheduled', 'pending'] }, 
      scheduledAt: { $lte: now }
    }).populate('recipient')

    for (const msg of pendingMessages) {
      if (!msg.recipient) continue; // Skip if contact was deleted

      try {
        const cleanPhone = msg.recipient.phoneE164.replace('+', '')
        const chatId = `${cleanPhone}@c.us`
        
        await whatsappClient.sendMessage(chatId, msg.content)

        msg.status = 'sent'
        msg.sentAt = new Date()
        await msg.save()

        console.log(`[scheduler] SUCCESS: Message sent to ${msg.recipient.name}`)
      } catch (err) {
        console.error(`[scheduler] FAILED: ${err.message}`)
        msg.status = 'failed'
        msg.errorLog = err.message
        await msg.save()
      }
    }

    // (Campaign logic remains the same...)
    const pendingCampaigns = await Campaign.find({
      status: 'scheduled',
      scheduledDate: { $lte: now }
    }).populate('contacts')
    
    // ... [Keep your existing campaign logic here] ...

  } catch (error) {
    console.error('[scheduler Error]:', error)
  }
}

// 3. CRON JOBS
export const startScheduler = () => {
  console.log('✅ [scheduler] Scheduler service started...'); // <--- ADD THIS

  cron.schedule('* * * * *', () => {
    console.log('⏰ [scheduler] Cron trigger: Checking events...'); // <--- ADD THIS
    generateMessagesFromEvents()
  })

  cron.schedule('* * * * *', () => {
    console.log('⏰ [scheduler] Cron trigger: Processing pending messages...'); // <--- ADD THIS
    processPendingMessages()
  })
}