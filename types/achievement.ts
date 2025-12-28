export type AchievementCategory = 'growth' | 'collection' | 'social' | 'dedication' | 'mastery';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  targetValue: number;
  currentValue: number;
  unlocked: boolean;
  unlockedAt?: number;
  reward: {
    gems?: number;
    energy?: number;
    seeds?: { rarity: 'common' | 'rare' | 'epic' | 'legendary'; count: number };
  };
}
