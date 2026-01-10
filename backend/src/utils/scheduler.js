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

    console.log(`🎂 [scheduler] Found ${eventsToday.length} events for today.`);

    for (const event of eventsToday) {
      // Check if we already created a message for this event TODAY
      const alreadyCreated = await Message.exists({
        event: event._id,
        scheduledAt: {
          $gte: new Date(currentYear, currentMonth - 1, currentDay),
          $lt: new Date(currentYear, currentMonth - 1, currentDay + 1)
        }
      })

      if (alreadyCreated) {
          console.log(`⚠️ [scheduler] Message already exists for event ${event._id}, skipping.`);
      }

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
  console.log('🔎 [scheduler] Looking for messages due before:', now.toISOString()); // <--- ADD THIS

  try {
    const pendingMessages = await Message.find({
      status: { $in: ['scheduled', 'pending'] }, 
      scheduledAt: { $lte: now }
    }).populate('recipient')

    if (pendingMessages.length === 0) {
      console.log('zzz [scheduler] No messages to send right now.');
      return; 
    }
    
    // 1. CHECK IF WHATSAPP IS CONNECTED
    if (!whatsappClient.info) {
      console.log('⏳ [scheduler] WhatsApp is NOT connected yet. Skipping send.');
      return; 
    }

    console.log(`🚀 [scheduler] Found ${pendingMessages.length} messages to send!`);

    for (const msg of pendingMessages) {
      if (!msg.recipient) continue; 

      try {
        // 2. LOG BEFORE SENDING (To see where it crashes)
        console.log(`[scheduler] 📤 Attempting to send to ${msg.recipient.name}...`);

        const cleanPhone = msg.recipient.phoneE164.replace('+', '')
        const chatId = `${cleanPhone}@c.us`
        
        await whatsappClient.sendMessage(chatId, msg.content)

        // 3. LOG SUCCESS
        console.log(`[scheduler] ✅ SUCCESS: Message sent to ${msg.recipient.name}`)

        msg.status = 'sent'
        msg.sentAt = new Date()
        await msg.save()

      } catch (err) {
        console.error(`[scheduler] ❌ FAILED: ${err.message}`)
        msg.status = 'failed'
        msg.errorLog = err.message
        await msg.save()
      }
    }
  } catch (err) {
    console.error('[scheduler] Erreur envoi messages:', err)
  }
}

// 3. CRON JOBS
export const startScheduler = () => {
  console.log('[scheduler] Scheduler service started...'); // <--- ADD THIS

  cron.schedule('* * * * *', () => {
    console.log('[scheduler] Cron trigger: Checking events...'); // <--- ADD THIS
    generateMessagesFromEvents()
  })

  cron.schedule('* * * * *', () => {
    console.log('[scheduler] Cron trigger: Processing pending messages...'); // <--- ADD THIS
    processPendingMessages()
  })
}