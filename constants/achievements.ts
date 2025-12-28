import { Achievement } from '@/types/achievement';

export const ACHIEVEMENTS: Omit<Achievement, 'currentValue' | 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_plant',
    title: 'First Steps',
    description: 'Plant your first manifestation',
    category: 'growth',
    icon: '🌱',
    targetValue: 1,
    reward: { gems: 20, energy: 8 }
  },
  {
    id: 'plant_10',
    title: 'Gardener',
    description: 'Plant 10 manifestations',
    category: 'growth',
    icon: '🌿',
    targetValue: 10,
    reward: { gems: 50, seeds: { rarity: 'rare', count: 2 }, energy: 15 }
  },
  {
    id: 'plant_50',
    title: 'Master Cultivator',
    description: 'Plant 50 manifestations',
    category: 'growth',
    icon: '🌳',
    targetValue: 50,
    reward: { gems: 200, seeds: { rarity: 'epic', count: 3 }, energy: 25 }
  },
  {
    id: 'first_bloom',
    title: 'First Bloom',
    description: 'Grow a manifestation to blooming stage',
    category: 'growth',
    icon: '🌸',
    targetValue: 1,
    reward: { gems: 30, energy: 15 }
  },
  {
    id: 'bloom_25',
    title: 'Garden in Full Bloom',
    description: 'Harvest 25 blooming manifestations',
    category: 'collection',
    icon: '🌺',
    targetValue: 25,
    reward: { gems: 150, seeds: { rarity: 'epic', count: 2 }, energy: 20 }
  },
  {
    id: 'bloom_100',
    title: 'Abundance Master',
    description: 'Harvest 100 blooming manifestations',
    category: 'collection',
    icon: '🌻',
    targetValue: 100,
    reward: { gems: 500, seeds: { rarity: 'legendary', count: 2 }, energy: 50 }
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    category: 'dedication',
    icon: '🔥',
    targetValue: 7,
    reward: { gems: 100, energy: 30 }
  },
  {
    id: 'streak_30',
    title: 'Monthly Manifestor',
    description: 'Maintain a 30-day streak',
    category: 'dedication',
    icon: '⚡',
    targetValue: 30,
    reward: { gems: 400, seeds: { rarity: 'legendary', count: 2 }, energy: 50 }
  },
  {
    id: 'share_10',
    title: 'Community Spirit',
    description: 'Share 10 manifestations to the community',
    category: 'social',
    icon: '💫',
    targetValue: 10,
    reward: { gems: 80, energy: 25 }
  },
  {
    id: 'nurture_100',
    title: 'Dedicated Nurturer',
    description: 'Nurture manifestations 100 times',
    category: 'mastery',
    icon: '✨',
    targetValue: 100,
    reward: { gems: 150, seeds: { rarity: 'rare', count: 8 }, energy: 30 }
  },
  {
    id: 'legendary_seed',
    title: 'Legendary Manifestor',
    description: 'Bloom a legendary manifestation',
    category: 'mastery',
    icon: '👑',
    targetValue: 1,
    reward: { gems: 300, seeds: { rarity: 'legendary', count: 3 }, energy: 40 }
  },
  {
    id: 'epic_seed',
    title: 'Epic Achievement',
    description: 'Bloom an epic manifestation',
    category: 'mastery',
    icon: '💎',
    targetValue: 1,
    reward: { gems: 100, seeds: { rarity: 'epic', count: 2 }, energy: 20 }
  },
  {
    id: 'all_categories',
    title: 'Balanced Life',
    description: 'Bloom a manifestation in each category',
    category: 'collection',
    icon: '🌈',
    targetValue: 5,
    reward: { gems: 200, seeds: { rarity: 'epic', count: 4 }, energy: 30 }
  },
  {
    id: 'energy_efficient',
    title: 'Energy Master',
    description: 'Use energy 50 times',
    category: 'mastery',
    icon: '⚙️',
    targetValue: 50,
    reward: { gems: 120, energy: 40 }
  },
];
