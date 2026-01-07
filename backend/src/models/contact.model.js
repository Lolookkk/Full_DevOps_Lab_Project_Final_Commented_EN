import mongoose from 'mongoose'
import { isE164 } from '../utils/validators.js'

const { Schema, Types } = mongoose

const contactSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    phoneE164: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isE164,
        message: 'phoneE164 must be a valid E.164 number (e.g. +33612345678)'
      }
    },
    relationshipType: {
      type: String,
      default: 'other',
      enum: ['family', 'friend', 'coworker', 'partner', 'other']
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    consentStatus: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
)

contactSchema.index({ userId: 1, phoneE164: 1 }, { unique: true })

export const Contact = mongoose.model('Contact', contactSchema)
