export type SeedRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface SharedManifestation {
  id: string;
  username: string;
  intention: string;
  category: 'abundance' | 'love' | 'health' | 'success' | 'peace';
  color: string;
  likes: number;
  sharedAt: number;
  likedByUser: boolean;
  rarity: SeedRarity;
}
