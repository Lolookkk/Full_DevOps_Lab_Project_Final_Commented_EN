import { Event } from '../models/event.model.js'
import { Contact } from '../models/contact.model.js'

export async function listEvents (req, res, next) {
  try {
    const docs = await Event.find({ userId: req.userId }).sort({ date: 1 })
    res.json(docs)
  } catch (err) {
    next(err)
  }
}

export async function getEvent (req, res, next) {
  try {
    const doc = await Event.findOne({ _id: req.params.id, userId: req.userId })
    if (!doc) return res.status(404).json({ error: 'Event not found' })
    res.json(doc)
  } catch (err) {
    next(err)
  }
}

export async function createEvent (req, res, next) {
  try {
    const { contactId } = req.body

    const contact = await Contact.findOne({ _id: contactId, userId: req.userId })
    if (!contact) return res.status(400).json({ error: 'Invalid contactId' })

    const payload = { ...req.body, userId: req.userId }
    const doc = await Event.create(payload)
    res.status(201).json(doc)
  } catch (err) {
    next(err)
  }
}

export async function updateEvent (req, res, next) {
  try {
    const update = { ...req.body }
    delete update.userId

    const doc = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update,
      { new: true, runValidators: true }
    )
    if (!doc) return res.status(404).json({ error: 'Event not found' })
    res.json(doc)
  } catch (err) {
    next(err)
  }
}

export async function deleteEvent (req, res, next) {
  try {
    const doc = await Event.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!doc) return res.status(404).json({ error: 'Event not found' })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
