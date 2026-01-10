import express from 'express'
import { createMessage, getMessages } from '../controllers/message.controller.js'

const router = express.Router()

router.post('/api/messages', createMessage)
router.get('/api/messages', getMessages)

export default router
