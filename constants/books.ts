import { Book } from '@/types/book';

export const AVAILABLE_BOOKS: Book[] = [
  {
    id: 'success-virus',
    title: 'The Success Virus: A Manifestation Story',
    author: '@thesuccess.virus',
    description: 'Discover the power of manifestation through an inspiring story that will transform your mindset and attract abundance into your life.',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    price: 33.3,
    isPurchased: false,
    readingProgress: 0,
    category: 'manifestation',
    pages: [
      { id: '1', content: 'Welcome to The Success Virus...\n\nThis is the beginning of your transformation journey. Every thought you think, every word you speak, and every action you take is creating your reality.\n\nThe success virus is not just a concept—it\'s a way of life. It\'s about rewiring your mind to attract success, abundance, and joy into every aspect of your existence.', pageNumber: 1 },
      { id: '2', content: 'Chapter 1: The Awakening\n\nSuccess begins with a single decision: the decision to believe in yourself and your dreams. When you plant the seed of intention, you begin a powerful transformation.\n\nYour thoughts are like seeds in a garden. What you nurture will grow. What you neglect will wither. The choice is always yours.', pageNumber: 2 },
      { id: '3', content: 'The Power of Daily Practice\n\nManifestation is not a one-time event. It\'s a daily practice of aligning your thoughts, emotions, and actions with your desires.\n\nEvery morning, set your intentions. Every evening, express gratitude. This simple practice will shift your entire reality.', pageNumber: 3 },
    ],
  },
  {
    id: 'manifestation-mastery',
    title: 'Manifestation Mastery',
    author: '@thesuccess.virus',
    description: 'A comprehensive guide to mastering the art of manifestation. Learn advanced techniques to accelerate your manifestations and create the life you desire.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    price: 22.2,
    isPurchased: false,
    readingProgress: 0,
    category: 'manifestation',
    pages: [
      { id: '1', content: 'Manifestation Mastery: Introduction\n\nYou are about to embark on a journey that will unlock your true potential. This book contains the secrets that top manifestors use to create extraordinary results.\n\nAre you ready to master your reality?', pageNumber: 1 },
      { id: '2', content: 'The 3 Pillars of Manifestation\n\n1. Clarity: Know exactly what you want\n2. Energy: Align your vibration with your desires\n3. Action: Take inspired steps toward your goals\n\nMaster these three pillars, and nothing can stop you.', pageNumber: 2 },
    ],
  },
  {
    id: 'spiritual-awakening',
    title: 'The Spiritual Awakening Guide',
    author: '@thesuccess.virus',
    description: 'Unlock your spiritual potential and connect with your higher self. A transformative journey into consciousness and enlightenment.',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    price: 22.2,
    isPurchased: false,
    readingProgress: 0,
    category: 'spirituality',
    pages: [
      { id: '1', content: 'The Spiritual Awakening Guide\n\nWelcome, seeker. You have been called to this moment for a reason. Your spiritual awakening is not an accident—it is your soul\'s invitation to remember who you truly are.', pageNumber: 1 },
      { id: '2', content: 'Chapter 1: Awakening to Your Truth\n\nYou are not just a physical being having a spiritual experience. You are a spiritual being having a physical experience.\n\nWhen you realize this fundamental truth, everything changes.', pageNumber: 2 },
    ],
  },
];
