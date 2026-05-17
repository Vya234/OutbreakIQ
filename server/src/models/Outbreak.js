import mongoose from 'mongoose';

const SEVERITY = ['low', 'medium', 'high'];

const outbreakSchema = new mongoose.Schema(
  {
    disease: { type: String, required: true, trim: true, index: true },
    location: { type: String, required: true, trim: true, index: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    cases: { type: Number, required: true, min: 0 },
    severity: { type: String, enum: SEVERITY, required: true, index: true },
    reportedAt: { type: Date, required: true, index: true },
    description: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

outbreakSchema.index({ disease: 'text', location: 'text', description: 'text' });

export const Outbreak = mongoose.model('Outbreak', outbreakSchema);
export { SEVERITY };
