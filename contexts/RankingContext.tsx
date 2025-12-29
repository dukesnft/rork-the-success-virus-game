import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { SeedRanking, StreakRanking } from '@/types/ranking';
import { useInventory } from '@/contexts/InventoryContext';
import { usePremium } from '@/contexts/PremiumContext';

const STORAGE_KEY_USER = 'user_ranking_data';
const STORAGE_KEY_SEED = 'seed_rankings';
const STORAGE_KEY_STREAK = 'streak_rankings';

interface UserRankingData {
  username: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string;
}

const generateMockRankings = (userScore: number, userStreak: number): { seedRankings: SeedRanking[], streakRankings: StreakRanking[] } => {
  const names = [
    'CosmicDreamer', 'LunarLight', 'StellarSoul', 'MysticVibes', 'ZenMaster',
    'AuraGlow', 'ChakraWarrior', 'SpiritSeeker', 'ManifestKing', 'IntentionQueen',
    'CrystalHeart', 'MindfulOne', 'SacredPath', 'DivinePurpose', 'EnlightenedBeing',
    'PeacefulJourney', 'AbundanceFlow', 'LoveLight', 'HealingEnergy', 'SuccessVibes'
  ];

  const seedRankings: SeedRanking[] = [];
  const streakRankings: StreakRanking[] = [];

  for (let i = 0; i < 20; i++) {
    let totalSpent = 0;
    
    if (i === 0) {
      totalSpent = 750 + Math.floor(Math.random() * 500);
    } else if (i === 1) {
      totalSpent = 550 + Math.floor(Math.random() * 200);
    } else if (i === 2) {
      totalSpent = 350 + Math.floor(Math.random() * 150);
    } else if (i < 10) {
      totalSpent = Math.floor(Math.random() * 300) + 100;
    } else {
      totalSpent = Math.floor(Math.random() * 100);
    }
    
    const totalSeeds = Math.floor(Math.random() * 150) + 10 + Math.floor(totalSpent / 2);
    const bloomingSeeds = Math.floor(totalSeeds * (Math.random() * 0.5 + 0.2));
    
    seedRankings.push({
      id: `seed_${i}`,
      username: names[i],
      score: totalSeeds,
      rank: i + 1,
      totalSeeds,
      bloomingSeeds,
      totalSpent,
    });

    const currentStreak = Math.floor(Math.random() * 100) + 1 + Math.floor(totalSpent / 10);
    const longestStreak = currentStreak + Math.floor(Math.random() * 50);
    
    streakRankings.push({
      id: `streak_${i}`,
      username: names[i],
      score: currentStreak,
      rank: i + 1,
      currentStreak,
      longestStreak,
      totalSpent,
    });
  }

  seedRankings.sort((a, b) => b.score - a.score);
  streakRankings.sort((a, b) => b.score - a.score);

  seedRankings.forEach((r, i) => r.rank = i + 1);
  streakRankings.forEach((r, i) => r.rank = i + 1);

  return { seedRankings, streakRankings };
};

export const [RankingProvider, useRankings] = createContextHook(() => {
  const [seedRankings, setSeedRankings] = useState<SeedRanking[]>([]);
  const [streakRankings, setStreakRankings] = useState<StreakRanking[]>([]);
  const [userData, setUserData] = useState<UserRankingData>({
    username: 'You',
    currentStreak: 0,
    longestStreak: 0,
    lastCheckIn: '',
  });

  const { getTotalSeeds, getBloomingSeeds } = useInventory();
  const { totalSpent } = usePremium();

  const userDataQuery = useQuery({
    queryKey: ['userRankingData'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : {
        username: 'You',
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: '',
      };
    }
  });

  const seedRankingsQuery = useQuery({
    queryKey: ['seedRankings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_SEED);
      if (stored) {
        return JSON.parse(stored);
      }
      const { seedRankings } = generateMockRankings(0, 0);
      return seedRankings;
    }
  });

  const streakRankingsQuery = useQuery({
    queryKey: ['streakRankings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_STREAK);
      if (stored) {
        return JSON.parse(stored);
      }
      const { streakRankings } = generateMockRankings(0, 0);
      return streakRankings;
    }
  });

  const { mutate: saveUserDataMutate } = useMutation({
    mutationFn: async (data: UserRankingData) => {
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveSeedRankingsMutate } = useMutation({
    mutationFn: async (data: SeedRanking[]) => {
      await AsyncStorage.setItem(STORAGE_KEY_SEED, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveStreakRankingsMutate } = useMutation({
    mutationFn: async (data: StreakRanking[]) => {
      await AsyncStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(data));
      return data;
    }
  });

  useEffect(() => {
    if (userDataQuery.data) {
      setUserData(userDataQuery.data);
    }
  }, [userDataQuery.data]);

  useEffect(() => {
    if (seedRankingsQuery.data) {
      setSeedRankings(seedRankingsQuery.data);
    }
  }, [seedRankingsQuery.data]);

  useEffect(() => {
    if (streakRankingsQuery.data) {
      setStreakRankings(streakRankingsQuery.data);
    }
  }, [streakRankingsQuery.data]);

  const updateStreakRankings = useCallback((currentStreak: number, longestStreak: number) => {
    setSeedRankings(prevSeedRankings => prevSeedRankings);
    setStreakRankings(prevRankings => {
      const userRanking: StreakRanking = {
        id: 'user',
        username: userData.username,
        score: currentStreak,
        rank: 0,
        currentStreak,
        longestStreak,
        totalSpent,
      };

      const otherRankings = prevRankings.filter(r => r.id !== 'user');
      const allRankings: StreakRanking[] = [...otherRankings, userRanking];
      
      allRankings.sort((a, b) => b.score - a.score);
      
      const finalRankings: StreakRanking[] = [];
      let currentRank = 1;
      
      for (let i = 0; i < allRankings.length; i++) {
        const item = allRankings[i];
        
        if (currentRank === 1 && item.totalSpent < 700) {
          item.rank = 999;
        } else if (currentRank === 2 && item.totalSpent < 500) {
          item.rank = 999;
        } else if (currentRank === 3 && item.totalSpent < 300) {
          item.rank = 999;
        } else {
          item.rank = currentRank;
          currentRank++;
        }
        
        finalRankings.push(item);
      }
      
      finalRankings.sort((a, b) => {
        if (a.rank === 999 && b.rank === 999) return b.score - a.score;
        if (a.rank === 999) return 1;
        if (b.rank === 999) return -1;
        return a.rank - b.rank;
      });
      
      let adjustedRank = 1;
      finalRankings.forEach(item => {
        if (item.rank !== 999) {
          item.rank = adjustedRank;
          adjustedRank++;
        } else {
          item.rank = adjustedRank;
          adjustedRank++;
        }
      });

      saveStreakRankingsMutate(finalRankings);
      return finalRankings;
    });
  }, [userData.username, totalSpent, saveStreakRankingsMutate]);

  const checkInStreak = useCallback(() => {
    const today = new Date().toDateString();
    
    setUserData(prevData => {
      if (prevData.lastCheckIn === today) {
        return prevData;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      let newStreak = prevData.currentStreak;
      
      if (prevData.lastCheckIn === yesterdayStr) {
        newStreak = prevData.currentStreak + 1;
      } else if (prevData.lastCheckIn === '') {
        newStreak = 1;
      } else {
        newStreak = 1;
      }

      const newLongestStreak = Math.max(newStreak, prevData.longestStreak);

      const updatedData = {
        ...prevData,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastCheckIn: today,
      };

      saveUserDataMutate(updatedData);
      
      setTimeout(() => {
        updateStreakRankings(newStreak, newLongestStreak);
      }, 0);
      
      return updatedData;
    });
  }, [saveUserDataMutate, updateStreakRankings]);

  const updateSeedRankings = useCallback(() => {
    setStreakRankings(prevStreakRankings => prevStreakRankings);
    setSeedRankings(prevRankings => {
      const totalSeeds = getTotalSeeds();
      const bloomingSeeds = getBloomingSeeds();
      
      const userRanking: SeedRanking = {
        id: 'user',
        username: userData.username,
        score: totalSeeds,
        rank: 0,
        totalSeeds,
        bloomingSeeds,
        totalSpent,
      };

      const otherRankings = prevRankings.filter(r => r.id !== 'user');
      const allRankings: SeedRanking[] = [...otherRankings, userRanking];
      
      allRankings.sort((a, b) => b.score - a.score);
      
      const finalRankings: SeedRanking[] = [];
      let currentRank = 1;
      
      for (let i = 0; i < allRankings.length; i++) {
        const item = allRankings[i];
        
        if (currentRank === 1 && item.totalSpent < 700) {
          item.rank = 999;
        } else if (currentRank === 2 && item.totalSpent < 500) {
          item.rank = 999;
        } else if (currentRank === 3 && item.totalSpent < 300) {
          item.rank = 999;
        } else {
          item.rank = currentRank;
          currentRank++;
        }
        
        finalRankings.push(item);
      }
      
      finalRankings.sort((a, b) => {
        if (a.rank === 999 && b.rank === 999) return b.score - a.score;
        if (a.rank === 999) return 1;
        if (b.rank === 999) return -1;
        return a.rank - b.rank;
      });
      
      let adjustedRank = 1;
      finalRankings.forEach(item => {
        if (item.rank !== 999) {
          item.rank = adjustedRank;
          adjustedRank++;
        } else {
          item.rank = adjustedRank;
          adjustedRank++;
        }
      });

      saveSeedRankingsMutate(finalRankings);
      return finalRankings;
    });
  }, [getTotalSeeds, getBloomingSeeds, userData.username, totalSpent, saveSeedRankingsMutate]);

  const setUsername = useCallback((username: string) => {
    setUserData(prevData => {
      const updatedData = {
        ...prevData,
        username,
      };
      saveUserDataMutate(updatedData);
      return updatedData;
    });
  }, [saveUserDataMutate]);

  const getUserSeedRank = useCallback(() => {
    const userRanking = seedRankings.find(r => r.id === 'user');
    return userRanking?.rank || 0;
  }, [seedRankings]);

  const getUserStreakRank = useCallback(() => {
    const userRanking = streakRankings.find(r => r.id === 'user');
    return userRanking?.rank || 0;
  }, [streakRankings]);

  return {
    seedRankings,
    streakRankings,
    userData,
    isLoading: userDataQuery.isLoading || seedRankingsQuery.isLoading || streakRankingsQuery.isLoading,
    checkInStreak,
    updateSeedRankings,
    setUsername,
    getUserSeedRank,
    getUserStreakRank,
  };
});
