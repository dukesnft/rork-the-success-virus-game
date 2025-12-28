export type QuestType = 'nurture' | 'plant' | 'harvest' | 'share' | 'streak';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  completedAt?: number;
  reward: {
    gems: number;
    energy?: number;
  };
  expiresAt: number;
}
