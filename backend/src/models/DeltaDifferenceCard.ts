import mongoose from 'mongoose';

export interface IDeltaDifferenceCard extends mongoose.Document {
  title: string;
  category: string;
  description: string;
  initials: string;
  iconImage?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeltaDifferenceCardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    initials: { type: String, required: true },
    iconImage: { type: String },
    displayOrder: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Ensure index on displayOrder for efficient retrieval
DeltaDifferenceCardSchema.index({ displayOrder: 1 });

const DeltaDifferenceCard =
  mongoose.models.DeltaDifferenceCard ||
  mongoose.model<IDeltaDifferenceCard>('DeltaDifferenceCard', DeltaDifferenceCardSchema);

export default DeltaDifferenceCard;
