export const CATEGORY_COLORS = {
  abundance: '#FFD700',
  love: '#FF69B4',
  health: '#00CED1',
  success: '#9370DB',
  peace: '#98FB98',
} as const;

export const AFFIRMATIONS = {
  abundance: [
    'I attract wealth effortlessly',
    'Abundance flows to me naturally',
    'I am a magnet for prosperity',
  ],
  love: [
    'Love surrounds me always',
    'I radiate love and compassion',
    'My heart is open to receive',
  ],
  health: [
    'My body is strong and vibrant',
    'I am radiating perfect health',
    'Every cell in my body thrives',
  ],
  success: [
    'Success is my natural state',
    'I achieve my goals with ease',
    'Opportunities flow to me',
  ],
  peace: [
    'I am calm and centered',
    'Peace flows through me',
    'I choose tranquility',
  ],
} as const;

export const ENERGY_PER_STAGE = {
  seed: 25,
  sprout: 50,
  growing: 75,
  blooming: 100,
} as const;

export const RARITY_COLORS = {
  common: '#A0A0A0',
  rare: '#4A90E2',
  epic: '#9B59B6',
  legendary: '#FFD700',
} as const;

export const RARITY_GLOW_COLORS = {
  common: ['#A0A0A0', '#C0C0C0'],
  rare: ['#4A90E2', '#87CEEB'],
  epic: ['#9B59B6', '#E066FF'],
  legendary: ['#FFD700', '#FFA500'],
} as const;

export const RARITY_NAMES = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
} as const;
