import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { SeedRanking, StreakRanking } from '@/types/ranking';
import { useInventory } from '@/contexts/InventoryContext';

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
    const totalSeeds = Math.floor(Math.random() * 150) + 10;
    const bloomingSeeds = Math.floor(totalSeeds * (Math.random() * 0.5 + 0.2));
    
    seedRankings.push({
      id: `seed_${i}`,
      username: names[i],
      score: totalSeeds,
      rank: i + 1,
      totalSeeds,
      bloomingSeeds,
    });

    const currentStreak = Math.floor(Math.random() * 100) + 1;
    const longestStreak = currentStreak + Math.floor(Math.random() * 50);
    
    streakRankings.push({
      id: `streak_${i}`,
      username: names[i],
      score: currentStreak,
      rank: i + 1,
      currentStreak,
      longestStreak,
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
      };

      const otherRankings = prevRankings.filter(r => r.id !== 'user');
      const allRankings: StreakRanking[] = [...otherRankings, userRanking];
      
      allRankings.sort((a, b) => b.score - a.score);
      allRankings.forEach((r, i) => r.rank = i + 1);

      saveStreakRankingsMutate(allRankings);
      return allRankings;
    });
  }, [userData.username, saveStreakRankingsMutate]);

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
      };

      const otherRankings = prevRankings.filter(r => r.id !== 'user');
      const allRankings: SeedRanking[] = [...otherRankings, userRanking];
      
      allRankings.sort((a, b) => b.score - a.score);
      allRankings.forEach((r, i) => r.rank = i + 1);

      saveSeedRankingsMutate(allRankings);
      return allRankings;
    });
  }, [getTotalSeeds, getBloomingSeeds, userData.username, saveSeedRankingsMutate]);

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
