export interface RankingEntry {
  id: string;
  username: string;
  score: number;
  rank: number;
}

export interface SeedRanking extends RankingEntry {
  totalSeeds: number;
  bloomingSeeds: number;
}

export interface StreakRanking extends RankingEntry {
  currentStreak: number;
  longestStreak: number;
}
