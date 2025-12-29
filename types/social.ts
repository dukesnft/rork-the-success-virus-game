export interface Friend {
  id: string;
  username: string;
  level: number;
  totalBloomed: number;
  currentStreak: number;
  addedAt: number;
  lastActive: number;
}

export interface FriendRequest {
  id: string;
  fromUsername: string;
  toUsername: string;
  sentAt: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Gift {
  id: string;
  fromUsername: string;
  toUsername: string;
  type: 'seeds' | 'gems' | 'energy' | 'booster';
  amount: number;
  rarity?: 'common' | 'rare' | 'epic';
  message?: string;
  sentAt: number;
  claimed: boolean;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  level: number;
  memberCount: number;
  totalBloomed: number;
  createdAt: number;
  icon: string;
}

export interface GuildMember {
  id: string;
  username: string;
  level: number;
  role: 'leader' | 'officer' | 'member';
  contribution: number;
  joinedAt: number;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'nurture' | 'harvest' | 'share' | 'bloom_legendary' | 'daily_streak';
  target: number;
  progress: number;
  reward: {
    gems: number;
    energy?: number;
    seeds?: number;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  };
  expiresAt: number;
  completed: boolean;
}

export interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  type: 'community_bloom' | 'legendary_hunt' | 'nurture_marathon';
  globalProgress: number;
  globalTarget: number;
  userContribution: number;
  rewards: {
    tier1: { gems: number; seeds?: number };
    tier2: { gems: number; seeds?: number };
    tier3: { gems: number; seeds?: number };
  };
  startedAt: number;
  endsAt: number;
  active: boolean;
}
