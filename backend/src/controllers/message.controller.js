import Message from '../models/message.model.js'
import whatsappClient from '../config/whatsapp.js'
import { Contact } from '../models/contact.model.js'

export const createMessage = async (req, res, next) => {
  try {
    const { content, scheduledAt, recipientId } = req.body

    const contact = await Contact.findOne({ _id: recipientId, userId: req.userId })
    if (!contact) return res.status(404).json({ error: 'Contact not found' })

    const isFuture = scheduledAt && new Date(scheduledAt) > new Date()

    const newMessage = await Message.create({
      sender: req.userId,
      recipient: recipientId,
      content,
      scheduledAt: scheduledAt || Date.now(),
      status: isFuture ? 'scheduled' : 'pending'
    })

    if (!isFuture) {
      try {
        const cleanPhone = contact.phoneE164.replace('+', '')
        const chatId = `${cleanPhone}@c.us`

        await whatsappClient.sendMessage(chatId, content)

        newMessage.status = 'sent'
        newMessage.sentAt = new Date()
        await newMessage.save()
      } catch (err) {
        newMessage.status = 'failed'
        newMessage.errorLog = err.message
        await newMessage.save()
        return res.status(500).json({ error: 'WhatsApp failure', raison: err.message })
      }
    }
    res.status(201).json(newMessage)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
    }
    next(error)
  }
}

export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ sender: req.userId })
      .populate('recipient', 'name phoneE164')
      .sort({ createdAt: -1 })

    res.status(200).json(messages)
  } catch (error) {
    next(error)
  }
}
