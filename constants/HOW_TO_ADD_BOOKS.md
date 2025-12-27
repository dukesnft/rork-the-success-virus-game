# How to Add New Books to the App

📚 This guide explains how to add new books that users can purchase and read in the app.

## Overview

The app supports:
- ✅ Book purchases with automatic pricing
- ✅ 50% discount for Premium users
- ✅ Additional 25% discount for consecutive purchases (within 5 minutes)
- ✅ Reading progress tracking
- ✅ In-app book reader with page navigation

## Step 1: Prepare Your Book Content

Books are stored as an array of pages with text content. Each page should be a manageable chunk of text (around 200-400 words per page for optimal mobile reading).

**Tips for formatting:**
- Break your content into digestible pages
- Use clear chapter headings
- Include introductions and conclusions
- Format with proper line breaks (`\n\n`)

## Step 2: Add Book to constants/books.ts

Open `constants/books.ts` and add your new book to the `AVAILABLE_BOOKS` array:

```typescript
{
  id: 'your-book-id',                    // Unique identifier (use kebab-case)
  title: 'Your Book Title',              // Display title
  author: '@thesuccess.virus',           // Author name
  description: 'Book description...',    // Short description for the store
  coverUrl: 'https://images.unsplash.com/photo-XXXXX', // Cover image URL
  price: 22.2,                           // Base price (22.2 for regular books, 33.3 for Success Virus)
  isPurchased: false,                    // Always false for new books
  readingProgress: 0,                    // Always 0 for new books
  category: 'manifestation',             // Category: 'manifestation', 'spirituality', 'success', or 'mindfulness'
  pages: [
    { 
      id: '1', 
      content: 'First page content here...', 
      pageNumber: 1 
    },
    { 
      id: '2', 
      content: 'Second page content here...', 
      pageNumber: 2 
    },
    // Add more pages...
  ],
}
```

## Step 3: Cover Image

Use a high-quality cover image from Unsplash or another source:
- Recommended size: 400x600px minimum
- Format: JPG or PNG
- Use Unsplash URLs for easy integration: `https://images.unsplash.com/photo-XXXXX?w=400&h=600&fit=crop`

## Step 4: Pricing Structure

### Base Prices:
- **The Success Virus: A Manifestation Story**: `$33.30` (flagship book)
- **All other books**: `$22.20`

### Automatic Discounts:
1. **Premium Users**: 50% OFF all books
   - Success Virus: $33.30 → $16.65
   - Other books: $22.20 → $11.10

2. **Consecutive Purchase Bonus**: Additional 25% OFF
   - Applies when purchasing within 5 minutes of previous purchase
   - Stacks with Premium discount!
   - Premium + Consecutive: $33.30 → $16.65 → $12.49 (Success Virus)
   - Premium + Consecutive: $22.20 → $11.10 → $8.33 (Other books)

### Examples:
- **Free User** buying Success Virus: $33.30
- **Premium User** buying Success Virus: $16.65
- **Premium User** buying Success Virus + Another book within 5 min:
  - First book: $16.65
  - Second book: $12.49 (or $8.33 for regular books)

## Step 5: Format Your Book Content

Each page object requires:
- `id`: Unique page identifier (use sequential numbers as strings)
- `content`: The text content for that page
- `pageNumber`: Sequential page number

**Formatting Tips:**
- Use `\n\n` for paragraph breaks
- Keep pages between 200-400 words for comfortable mobile reading
- Start chapters with clear headings
- Use proper punctuation and formatting

## Example Book Entry

```typescript
{
  id: 'abundance-mindset',
  title: 'The Abundance Mindset',
  author: '@thesuccess.virus',
  description: 'Transform your relationship with wealth and abundance through powerful mindset shifts.',
  coverUrl: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=400&h=600&fit=crop',
  price: 22.2,
  isPurchased: false,
  readingProgress: 0,
  category: 'manifestation',
  pages: [
    { 
      id: '1', 
      content: 'Introduction\n\nWelcome to The Abundance Mindset. This book will guide you through...',
      pageNumber: 1 
    },
    { 
      id: '2', 
      content: 'Chapter 1: Understanding Abundance\n\nAbundance is not just about money...',
      pageNumber: 2 
    },
  ],
}
```

## That's It!

Once you add the book to `constants/books.ts`, it will automatically appear in the Books tab for users to purchase and read. The app handles:
- ✅ Purchase flow with automatic premium discounts (50% off)
- ✅ Consecutive purchase bonus (additional 25% off within 5 minutes)
- ✅ Reading progress tracking
- ✅ Book storage in user's library
- ✅ Beautiful in-app reader with page navigation
- ✅ Book categorization (manifestation, spirituality, success, mindfulness)

## Notes

- **Storage**: Books are stored locally on the user's device after purchase
- **Progress**: Reading progress is saved automatically as users navigate pages
- **Pricing**: All monetary transactions are simulated (no real payment integration)
- **Discounts**: Premium users see their discount automatically applied in the UI
- **Timing**: Consecutive purchase window is 5 minutes

## Quick Reference: Adding a Book

```typescript
{
  id: 'unique-book-id',
  title: 'Your Book Title',
  author: '@thesuccess.virus',
  description: 'A compelling description...',
  coverUrl: 'https://images.unsplash.com/photo-XXXXX?w=400&h=600&fit=crop',
  price: 22.2, // or 33.3 for Success Virus
  isPurchased: false,
  readingProgress: 0,
  category: 'manifestation', // or 'spirituality', 'success', 'mindfulness'
  pages: [
    { id: '1', content: 'Page 1 content...', pageNumber: 1 },
    { id: '2', content: 'Page 2 content...', pageNumber: 2 },
    // Add more pages...
  ],
}
```

## Background Store

The app also includes a background store where users can purchase different gradient backgrounds for their manifestation garden:
- **Free**: Cosmic Purple (default)
- **Paid backgrounds**: $1.99 - $2.99 each
- **Premium discount**: 50% off all backgrounds

Backgrounds are managed in `constants/backgrounds.ts`.
