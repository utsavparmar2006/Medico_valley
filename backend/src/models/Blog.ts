import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  format: string;
  subject: string;
  readTime: string;
  excerpt: string;
  imageUrl: string;
  content: string[];
  highlights: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    format: { type: String, default: 'blog' },
    subject: {
      type: String,
      required: true,
    },
    readTime: { type: String, required: true },
    excerpt: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    content: { type: [String], required: true },
    highlights: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;
