import mongoose from 'mongoose'

const { Schema, Types } = mongoose

const eventSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    contactId: {
      type: Types.ObjectId,
      ref: 'Contact',
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['birthday', 'anniversary', 'custom']
    },
    label: {
      type: String,
      trim: true,
      maxlength: 300
    },
    date: {
      type: Date,
      required: true
    },
    timezone: {
      type: String,
      default: 'Europe/Paris'
    },
    lastSentYear: {
    type: Number
    }
  },
  { timestamps: true }
)

eventSchema.index({ contactId: 1, type: 1, date: 1 }, { unique: true })

export const Event = mongoose.model('Event', eventSchema)
