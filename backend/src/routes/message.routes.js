import express from 'express';
import { createMessage, getMessages } from '../controllers/message.controller.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/api/messages', auth, createMessage);
router.get('/api/messages', auth, getMessages);

export default router;