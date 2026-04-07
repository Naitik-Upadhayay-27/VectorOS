import mongoose, { Schema, Document } from 'mongoose'

export interface ICachedJob extends Document {
  jobId:          string
  query:          string   // normalized search query
  title:          string
  company:        string
  location:       string
  employmentType: string
  seniority:      string
  salary:         string
  postedAt:       string
  applicants:     string
  description:    string
  url:            string
  remote:         boolean
  tags:           string[]
  source:         string
  cachedAt:       Date
}

const CachedJobSchema = new Schema<ICachedJob>({
  jobId:          { type: String, required: true, unique: true },
  query:          { type: String, required: true, index: true },
  title:          { type: String, default: '' },
  company:        { type: String, default: '' },
  location:       { type: String, default: '' },
  employmentType: { type: String, default: '' },
  seniority:      { type: String, default: '' },
  salary:         { type: String, default: 'Not specified' },
  postedAt:       { type: String, default: '' },
  applicants:     { type: String, default: '' },
  description:    { type: String, default: '' },
  url:            { type: String, default: '' },
  remote:         { type: Boolean, default: false },
  tags:           { type: [String], default: [] },
  source:         { type: String, default: 'linkedin' },
  cachedAt:       { type: Date, default: Date.now },  // TTL managed by schema.index below
})

// Auto-expire after 6 hours
CachedJobSchema.index({ cachedAt: 1 }, { expireAfterSeconds: 6 * 60 * 60 })

// Text search index
CachedJobSchema.index({ title: 'text', company: 'text', description: 'text' })

export const CachedJob = mongoose.model<ICachedJob>('CachedJob', CachedJobSchema)
