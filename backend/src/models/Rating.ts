import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRating extends Document {
  productId: mongoose.Types.ObjectId;
  visitorId: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    visitorId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

// Create a compound index so visitorId can only have one rating record per product
RatingSchema.index({ productId: 1, visitorId: 1 }, { unique: true });

const Rating: Model<IRating> =
  mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);

export default Rating;
