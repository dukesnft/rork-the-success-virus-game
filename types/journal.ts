export interface JournalEntry {
  id: string;
  date: string;
  gratitude: string[];
  thoughts: string;
  mood: 'amazing' | 'good' | 'neutral' | 'low' | 'struggling';
  createdAt: number;
}
