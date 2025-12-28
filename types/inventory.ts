export interface InventoryItem {
  id: string;
  intention: string;
  category: 'abundance' | 'love' | 'health' | 'success' | 'peace';
  stage: 'sprout' | 'growing' | 'blooming';
  collectedAt: number;
  color: string;
}
