import mongoose from 'mongoose'

const { Schema } = mongoose

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    mfaEnabled: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

export const User = mongoose.model('User', userSchema)
