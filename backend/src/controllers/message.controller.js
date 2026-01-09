import Message from '../models/message.model.js';
import whatsappClient from '../config/whatsapp.js';

export const createMessage = async (req, res, next) => {
  try {
    const { recipientPhone, content, scheduledAt, recipientId } = req.body;

    const newMessage = await Message.create({
      sender: req.userId,
      recipient: recipientId,
      content,
      scheduledAt: scheduledAt || Date.now(),
      status: 'pending'
    });

    if (!scheduledAt || new Date(scheduledAt) <= new Date()) {
      try {
        const chatId = recipientPhone.includes('@c.us') 
                       ? recipientPhone 
                       : `${recipientPhone}@c.us`;

        await whatsappClient.sendMessage(chatId, content);
        
        newMessage.status = 'sent';
        newMessage.sentAt = new Date();
        await newMessage.save();
      } catch (err) {
        newMessage.status = 'failed';
        newMessage.errorLog = err.message;
        await newMessage.save();
        return res.status(500).json({ error: "Échec WhatsApp", raison: err.message });
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ sender: req.user.id })
      .populate('recipient', 'name phoneNumber')
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};