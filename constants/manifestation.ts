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
