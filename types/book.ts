export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  price: number;
  isPurchased: boolean;
  readingProgress: number;
  category: 'manifestation' | 'spirituality' | 'success' | 'mindfulness';
  pages: BookPage[];
}

export interface BookPage {
  id: string;
  content: string;
  pageNumber: number;
}
