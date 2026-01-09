import cron from 'node-cron'
import Message from '../models/message.model.js'
import Campaign from '../models/campaign.model.js'
import { Event } from '../models/event.model.js'
import whatsappClient from '../config/whatsapp.js'

const generateMessagesFromEvents = async () => {
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()
  const currentYear = today.getFullYear()

  try {
    const eventsToday = await Event.find({
      $expr: {
        $and: [
          { $eq: [{ $dayOfMonth: '$date' }, currentDay] },
          { $eq: [{ $month: '$date' }, currentMonth] }
        ]
      }
    }).populate('contactId')

    for (const event of eventsToday) {
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
          status: 'scheduled',
          scheduledAt: new Date()
        })
        console.log(`[scheduler] Message d'anniversaire généré pour ${event.contactId.name}`)
      }
    }
  } catch (err) {
    console.error('[scheduler] Erreur génération events:', err)
  }
}

const processPendingMessages = async () => {
  const now = new Date()

  try {
    const pendingMessages = await Message.find({
      status: 'scheduled',
      scheduledAt: { $lte: now }
    }).populate('recipient')

    for (const msg of pendingMessages) {
      try {
        const chatId = `${msg.recipient.phoneE164.replace('+', '')}@c.us`
        await whatsappClient.sendMessage(chatId, msg.content)

        msg.status = 'sent'
        msg.sentAt = new Date()
        await msg.save()

        console.log(`[scheduler] Message envoyé avec succès à ${msg.recipient.phoneE164} (${msg.recipient.name || 'Sans nom'})`)
      } catch (err) {
        msg.status = 'failed'
        msg.errorLog = err.message
        await msg.save()
      }
    }

    const pendingCampaigns = await Campaign.find({
      status: 'scheduled',
      scheduledDate: { $lte: now }
    }).populate('contacts')

    for (const campaign of pendingCampaigns) {
      campaign.status = 'processing'
      await campaign.save()

      for (const contact of campaign.contacts) {
        try {
          const chatId = `${contact.phoneE164.replace('+', '')}@c.us`
          await whatsappClient.sendMessage(chatId, campaign.messageTemplate)

          await Message.create({
            sender: campaign.creator,
            recipient: contact._id,
            campaign: campaign._id,
            content: campaign.messageTemplate,
            status: 'sent',
            sentAt: new Date()
          })

          campaign.stats.sentCount += 1
        } catch (err) {
          campaign.stats.failedCount += 1
        }
      }

      campaign.status = 'completed'
      await campaign.save()
      console.log('[scheduler] Campaign envoyé avec succès')
    }
  } catch (error) {
    console.error('[scheduler Error]:', error)
  }
}

export const startScheduler = () => {
  cron.schedule('0 * * * *', () => {
    console.log('[scheduler] Scan event...')
    generateMessagesFromEvents()
  })

  cron.schedule('* * * * *', () => {
    console.log('[scheduler] Scan messages...')
    processPendingMessages()
  })
}
