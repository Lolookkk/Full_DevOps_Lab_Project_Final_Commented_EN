import express from 'express';
import { handleWhatsAppWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

router.post('/api/webhooks/whatsapp', handleWhatsAppWebhook);

export default router;