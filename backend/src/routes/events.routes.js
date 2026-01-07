import { Router } from 'express'
import {
  listEvents, getEvent, createEvent, updateEvent, deleteEvent
} from '../controllers/events.controller.js'

const router = Router()

router.get('/api/events', listEvents)
router.get('/api/events/:id', getEvent)
router.post('/api/events', createEvent)
router.put('/api/events/:id', updateEvent)
router.delete('/api/events/:id', deleteEvent)

export default router
