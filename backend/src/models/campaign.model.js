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
  contacts: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    }],
    validate: {
      validator: function (v) {
        return v && v.length > 0
      },
      message: 'A campaign must contain at least one contact..'
    },
    required: [true, 'The contact list is mandatory.']
  },
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
