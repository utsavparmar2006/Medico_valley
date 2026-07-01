export interface Article {
  id?: string;
  _id?: string;
  slug: string;
  title: string;
  format: 'blog';
  subject: string;
  date?: string;
  createdAt?: string;
  readTime: string;
  excerpt: string;
  imageUrl: string;
  content: string[];
  highlights: string[];
}

export const ARTICLES_DATABASE: Article[] = [];
