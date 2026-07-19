import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
  name: string;
  location: string;
  testimonial: string;
  type: string;
  logoUrl: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: false, trim: true },
    testimonial: { type: String, required: true, trim: true },
    type: { type: String, required: false, trim: true },
    logoUrl: { type: String, required: true },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);

export default Client;
