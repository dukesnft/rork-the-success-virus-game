export type GrowthStage = 'seed' | 'sprout' | 'growing' | 'blooming';
export type SeedRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Manifestation {
  id: string;
  intention: string;
  category: 'abundance' | 'love' | 'health' | 'success' | 'peace';
  stage: GrowthStage;
  energy: number;
  maxEnergy: number;
  createdAt: number;
  lastNurtured: number;
  position: { x: number; y: number };
  color: string;
  rarity: SeedRarity;
}
