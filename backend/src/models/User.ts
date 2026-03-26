import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash?: string
  googleId?: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
  aiTokensLeft: number
  hasOnboarded: boolean
  onboardingData?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name:          { type: String, required: true },
    email:         { type: String, required: true, unique: true, lowercase: true },
    passwordHash:  { type: String },
    googleId:      { type: String, sparse: true },
    avatar:        { type: String },
    plan:          { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    aiTokensLeft:  { type: Number, default: 20 },
    hasOnboarded:  { type: Boolean, default: false },
    onboardingData:{ type: Schema.Types.Mixed },
  },
  { timestamps: true }
)

export const User = mongoose.model<IUser>('User', UserSchema)
