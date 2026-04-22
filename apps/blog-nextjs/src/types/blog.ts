export interface IBlog {
  id: number;
  slug: string;
  url: string;
  title: string;
  content: string;
  image: string;
  thumbnail: string;
  status: 'published' | 'draft';
  category: string;
  publishedAt: string;
  updatedAt: string;
  userId: number;
}
