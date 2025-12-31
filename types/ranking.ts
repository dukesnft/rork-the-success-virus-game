export interface RankingEntry {
  id: string;
  username: string;
  score: number;
  rank: number;
  totalSpent: number;
}

export interface BloomedRanking extends RankingEntry {
  totalBloomed: number;
}

export interface LegendaryRanking extends RankingEntry {
  legendaryCount: number;
}

export interface StreakRanking extends RankingEntry {
  currentStreak: number;
  longestStreak: number;
}
