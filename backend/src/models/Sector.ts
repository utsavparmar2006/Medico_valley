import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISector extends Document {
  title: string;
  desc: string;
  defaultImg: string;
  hoverImg?: string;
  linkUrl?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const SectorSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 40 },
    desc: { type: String, required: true, trim: true, maxlength: 180 },
    defaultImg: { type: String, required: true },
    hoverImg: { type: String, default: '' },
    linkUrl: { type: String, default: '/products' },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Sector: Model<ISector> =
  mongoose.models.Sector || mongoose.model<ISector>('Sector', SectorSchema);

export default Sector;
