import { Contact } from '../models/contact.model.js'



export async function listContacts (req, res, next) {
  try {
    const docs = await Contact.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(docs)
  } catch (err) {
    next(err)
  }
}

export async function getContact (req, res, next) {
  try {
    const doc = await Contact.findOne({ _id: req.params.id, userId: req.userId })
    if (!doc) return res.status(404).json({ error: 'Contact not found' })
    res.json(doc)
  } catch (err) {
    next(err)
  }
}

export async function createContact (req, res, next) {
  try {
    // FIX: Map 'phone' from frontend to 'phoneE164' for database
    const payload = {
      ...req.body,
      userId: req.userId,
      phoneE164: req.body.phone || req.body.phoneE164 // <--- THIS LINE FIXES IT
    }
    
    // (Optional) Remove the old 'phone' key if strict schema is on, though usually fine
    delete payload.phone; 

    const doc = await Contact.create(payload)
    res.status(201).json(doc)
  } catch (err) {
    next(err)
  }
}

export async function updateContact (req, res, next) {
  try {
    // FIX: Handle mapping for updates too
    const updateData = { ...req.body };
    if (updateData.phone) {
      updateData.phoneE164 = updateData.phone;
    }

    const doc = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    )
    if (!doc) return res.status(404).json({ error: 'Contact not found' })
    res.json(doc)
  } catch (err) {
    next(err)
  }
}

export async function deleteContact (req, res, next) {
  try {
    const doc = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!doc) return res.status(404).json({ error: 'Contact not found' })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
