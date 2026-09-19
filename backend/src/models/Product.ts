import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  mediaUrls: string[];
  catalogUrl?: string;
  keyFeatures?: string[];
  isActive: boolean;
  displayOrder?: number;
  ratingMode?: 'manual' | 'auto';
  manualRating?: number;
  manualRatingCount?: number;
  autoRatingAverage?: number;
  autoRatingCount?: number;
  showRating?: boolean;
  ctaText?: string;
  youtubeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategory: { type: Schema.Types.ObjectId, ref: 'Subcategory', index: true },
    mediaUrls: { type: [String], default: [] },
    catalogUrl: { type: String },
    keyFeatures: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0, index: true },
    ratingMode: { type: String, enum: ['manual', 'auto'], default: 'manual' },
    manualRating: { type: Number, min: 1, max: 5, default: 5.0 },
    manualRatingCount: { type: Number, min: 0, default: 25 },
    autoRatingAverage: { type: Number, min: 1, max: 5, default: 5.0 },
    autoRatingCount: { type: Number, min: 0, default: 0 },
    showRating: { type: Boolean, default: true },
    ctaText: { type: String, default: 'Request Quote & Pricing', trim: true },
    youtubeUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1, displayOrder: 1, name: 1 });
ProductSchema.index({ subcategory: 1, displayOrder: 1, name: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
