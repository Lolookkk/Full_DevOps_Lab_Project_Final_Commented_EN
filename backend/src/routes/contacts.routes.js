import { Router } from 'express'
import { auth } from '../middlewares/auth.js'
import {
  listContacts, getContact, createContact, updateContact, deleteContact
} from '../controllers/contacts.controller.js'

const router = Router()

router.get('/api/contacts', listContacts)
router.get('/api/contacts/:id', getContact)
router.post('/api/contacts', createContact)
router.put('/api/contacts/:id', updateContact)
router.delete('/api/contacts/:id', deleteContact)

export default router
