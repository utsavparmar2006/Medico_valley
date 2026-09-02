import mongoose, { Schema, Document } from 'mongoose';

export interface IFeaturedSpotlight extends Document {
  isActive: boolean;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  features: string[];

  showPrimaryBtn: boolean;
  primaryBtnText: string;
  primaryBtnHref: string;

  showSecondaryBtn: boolean;
  secondaryBtnText: string;
  secondaryBtnHref: string;

  showQuoteBtn: boolean;
  quoteBtnText: string;

  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeaturedSpotlightSchema: Schema = new Schema(
  {
    isActive: { type: Boolean, default: true },
    badge: { type: String, trim: true, default: 'Featured Product' },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    imageUrl: { type: String, default: '' },
    features: { type: [String], default: [] },

    showPrimaryBtn: { type: Boolean, default: true },
    primaryBtnText: { type: String, trim: true, default: 'View Product' },
    primaryBtnHref: { type: String, trim: true, default: '/products' },

    showSecondaryBtn: { type: Boolean, default: true },
    secondaryBtnText: { type: String, trim: true, default: 'Download Catalogue' },
    secondaryBtnHref: { type: String, trim: true, default: '' },

    showQuoteBtn: { type: Boolean, default: true },
    quoteBtnText: { type: String, trim: true, default: 'Request a Quote' },

    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.FeaturedSpotlight ||
  mongoose.model<IFeaturedSpotlight>('FeaturedSpotlight', FeaturedSpotlightSchema);
