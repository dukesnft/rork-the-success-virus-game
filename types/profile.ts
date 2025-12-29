import { SeedRarity } from './manifestation';

export interface TopManifestation {
  id: string;
  intention: string;
  category: 'abundance' | 'love' | 'health' | 'success' | 'peace';
  color: string;
  rarity: SeedRarity;
}

export interface UserProfile {
  username: string;
  topManifestations: TopManifestation[];
  totalSeeds: number;
  streak: number;
  level: number;
}
