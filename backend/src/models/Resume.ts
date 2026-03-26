import mongoose, { Schema, Document } from 'mongoose'

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  templateId: number
  personalInfo: Record<string, any>
  summary?: string
  experience: any[]
  education: any[]
  skills: any[]
  projects: any[]
  certificates: any[]
  awards: any[]
  languages: any[]
  volunteer: any[]
  score?: number
  version: number
  createdAt: Date
  updatedAt: Date
}

const ResumeSchema = new Schema<IResume>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:        { type: String, default: 'Untitled Resume' },
    templateId:  { type: Number, default: 1 },
    personalInfo:{ type: Schema.Types.Mixed, default: {} },
    summary:     { type: String },
    experience:  { type: Schema.Types.Mixed, default: [] },
    education:   { type: Schema.Types.Mixed, default: [] },
    skills:      { type: Schema.Types.Mixed, default: [] },
    projects:    { type: Schema.Types.Mixed, default: [] },
    certificates:{ type: Schema.Types.Mixed, default: [] },
    awards:      { type: Schema.Types.Mixed, default: [] },
    languages:   { type: Schema.Types.Mixed, default: [] },
    volunteer:   { type: Schema.Types.Mixed, default: [] },
    score:       { type: Number },
    version:     { type: Number, default: 1 },
  },
  { timestamps: true }
)

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema)
