import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: false
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'sent', 'failed'],
    default: 'pending'
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  sentAt: {
    type: Date
  },
  errorLog: {
    type: String
  }
}, {
  timestamps: true
})

const Message = mongoose.model('Message', messageSchema)

export default Message
