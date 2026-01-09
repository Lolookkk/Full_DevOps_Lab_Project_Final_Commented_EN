import mongoose from 'mongoose'

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  }],
  messageTemplate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'processing', 'completed', 'cancelled'],
    default: 'draft'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  stats: {
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
})

const Campaign = mongoose.model('Campaign', campaignSchema)

export default Campaign
