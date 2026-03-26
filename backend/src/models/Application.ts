import mongoose, { Schema, Document } from 'mongoose'

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId
  jobTitle: string
  company: string
  location?: string
  jobUrl?: string
  jobDescription?: string
  resumeId?: mongoose.Types.ObjectId
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  matchScore?: number
  notes?: string
  appliedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobTitle:       { type: String, required: true },
    company:        { type: String, required: true },
    location:       { type: String },
    jobUrl:         { type: String },
    jobDescription: { type: String },
    resumeId:       { type: Schema.Types.ObjectId, ref: 'Resume' },
    status:         { type: String, enum: ['saved', 'applied', 'interview', 'offer', 'rejected'], default: 'saved' },
    matchScore:     { type: Number },
    notes:          { type: String },
    appliedAt:      { type: Date },
  },
  { timestamps: true }
)

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema)
