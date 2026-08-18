import mongoose, { Schema, Document } from 'mongoose';

export interface ISolutionCard extends Document {
  title: string;
  category: string;
  description: string;
  initials: string;
  ctaText: string;
  href: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SolutionCardSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    initials: { type: String, required: true, trim: true },
    ctaText: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.SolutionCard || mongoose.model<ISolutionCard>('SolutionCard', SolutionCardSchema);
