import cron from 'node-cron';
import Message from '../models/message.model.js';
import Campaign from '../models/campaign.model.js';
import whatsappClient from '../config/whatsapp.js';

const processPendingMessages = async () => {
  const now = new Date();

  try {
    const pendingMessages = await Message.find({
      status: 'scheduled',
      scheduledAt: { $lte: now }
    }).populate('recipient');

    for (const msg of pendingMessages) {
      try {
        const chatId = `${msg.recipient.phoneNumber}@c.us`;
        await whatsappClient.sendMessage(chatId, msg.content);
        
        msg.status = 'sent';
        msg.sentAt = new Date();
        await msg.save();
        console.log(`[Scheduler] Message envoyé à ${msg.recipient.phoneNumber}`);
      } catch (err) {
        msg.status = 'failed';
        msg.errorLog = err.message;
        await msg.save();
      }
    }

    const pendingCampaigns = await Campaign.find({
      status: 'scheduled',
      scheduledDate: { $lte: now }
    }).populate('contacts');

    for (const campaign of pendingCampaigns) {
      campaign.status = 'processing';
      await campaign.save();

      for (const contact of campaign.contacts) {
        try {
          const chatId = `${contact.phoneNumber}@c.us`;
          await whatsappClient.sendMessage(chatId, campaign.messageTemplate);
          campaign.stats.sentCount += 1;
        } catch (err) {
          campaign.stats.failedCount += 1;
        }
      }

      campaign.status = 'completed';
      await campaign.save();
      console.log(`[Scheduler] Campagne "${campaign.name}" terminée.`);
    }

  } catch (error) {
    console.error('[Scheduler Error]:', error);
  }
};

export const startScheduler = () => {
  cron.schedule('* * * * *', () => {
    console.log('Vérification des messages planifiés...');
    processPendingMessages();
  });
};