import mongoose, { Schema, Document } from 'mongoose'

export interface ICoverLetter extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  templateId: number
  data: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const CoverLetterSchema = new Schema<ICoverLetter>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:       { type: String, default: 'Untitled Cover Letter' },
    templateId: { type: Number, default: 1 },
    data:       { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

export const CoverLetter = mongoose.model<ICoverLetter>('CoverLetter', CoverLetterSchema)
