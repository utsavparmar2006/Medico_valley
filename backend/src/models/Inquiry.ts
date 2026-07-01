import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInquiry extends Document {
  inquiryId: string; // e.g., MVQ-2026-000001
  productId: mongoose.Types.ObjectId;
  productName: string;
  category: string;
  quantity: number;
  customerName: string;
  institution: string;
  email: string;
  phone: string;
  city: string;
  message?: string;
  status: 'Pending' | 'Contacted' | 'Quoted' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema: Schema = new Schema(
  {
    inquiryId: { type: String, unique: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 1, min: 0 },
    customerName: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Contacted', 'Quoted', 'Completed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate sequential inquiryId (e.g. MVQ-2026-000001)
InquirySchema.pre<IInquiry>('save', async function (next) {
  if (this.inquiryId) {
    return next();
  }

  const currentYear = new Date().getFullYear();

  try {
    const lastInquiry = await mongoose.model<IInquiry>('Inquiry')
      .findOne({ inquiryId: new RegExp(`^MVQ-${currentYear}-`) })
      .sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastInquiry && lastInquiry.inquiryId) {
      const parts = lastInquiry.inquiryId.split('-');
      if (parts.length === 3) {
        const lastNum = parseInt(parts[2], 10);
        if (!isNaN(lastNum)) {
          nextNumber = lastNum + 1;
        }
      }
    }

    const paddedNum = String(nextNumber).padStart(6, '0');
    this.inquiryId = `MVQ-${currentYear}-${paddedNum}`;
    next();
  } catch (error: any) {
    next(error);
  }
});

const Inquiry: Model<IInquiry> =
  mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);

export default Inquiry;
