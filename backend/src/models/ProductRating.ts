import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductRating extends Document {
  productId: mongoose.Types.ObjectId;
  visitorId: string;
  rating: number;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductRatingSchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    visitorId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    ip: { type: String },
  },
  { timestamps: true }
);

// Ensure one rating per visitor per product
ProductRatingSchema.index({ productId: 1, visitorId: 1 }, { unique: true });

const ProductRating: Model<IProductRating> =
  mongoose.models.ProductRating || mongoose.model<IProductRating>('ProductRating', ProductRatingSchema);

export default ProductRating;
