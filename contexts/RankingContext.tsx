import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { BloomedRanking, LegendaryRanking, StreakRanking } from '@/types/ranking';
import { useInventory } from '@/contexts/InventoryContext';
import { usePremium } from '@/contexts/PremiumContext';
import { getEasternTime } from '@/utils/dateUtils';

const STORAGE_KEY_USER = 'user_ranking_data';
const STORAGE_KEY_BLOOMED = 'bloomed_rankings';
const STORAGE_KEY_LEGENDARY = 'legendary_rankings';
const STORAGE_KEY_STREAK = 'streak_rankings';

interface UserRankingData {
  username: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string;
}

const generateMockRankings = (): { bloomedRankings: BloomedRanking[], legendaryRankings: LegendaryRanking[], streakRankings: StreakRanking[] } => {
  const names = [
    'CosmicDreamer', 'LunarLight', 'StellarSoul', 'MysticVibes', 'ZenMaster',
    'AuraGlow', 'ChakraWarrior', 'SpiritSeeker', 'ManifestKing', 'IntentionQueen',
    'CrystalHeart', 'MindfulOne', 'SacredPath', 'DivinePurpose', 'EnlightenedBeing',
    'PeacefulJourney', 'AbundanceFlow', 'LoveLight', 'HealingEnergy', 'SuccessVibes',
    'SoulShine', 'DreamWeaver', 'StarGazer', 'MoonChild', 'SunSeeker',
    'OceanWaves', 'MountainPeak', 'ForestSpirit', 'DesertRose', 'RiverFlow',
    'ThunderBolt', 'RainbowLight', 'CloudWalker', 'EarthAngel', 'FireStarter',
    'IceCrystal', 'WindDancer', 'SkySail', 'LeafWhisper', 'FlowerBloom',
    'NightOwl', 'DawnBringer', 'TwilightDream', 'StarlightPath', 'CosmicEnergy',
    'InfiniteJoy', 'EternalPeace', 'RadiantSoul', 'PureHeart', 'WiseSpirit'
  ];

  const bloomedRankings: BloomedRanking[] = [];
  const legendaryRankings: LegendaryRanking[] = [];
  const streakRankings: StreakRanking[] = [];

  for (let i = 0; i < 50; i++) {
    const seed = (i * 1337 + 42) % 1000;
    const randomFactor = (seed * 7919) % 100;
    
    let totalBloomed = 0;
    let totalSpent = 0;
    
    if (i === 0) {
      totalBloomed = 450 + randomFactor;
      totalSpent = 2500 + (randomFactor * 10);
    } else if (i === 1) {
      totalBloomed = 380 + randomFactor;
      totalSpent = 2100 + (randomFactor * 8);
    } else if (i === 2) {
      totalBloomed = 320 + randomFactor;
      totalSpent = 1800 + (randomFactor * 7);
    } else if (i < 5) {
      totalBloomed = 250 + randomFactor + (5 - i) * 20;
      totalSpent = 1500 + (randomFactor * 5) + (5 - i) * 100;
    } else if (i < 10) {
      totalBloomed = 180 + randomFactor + (10 - i) * 10;
      totalSpent = 1000 + (randomFactor * 4) + (10 - i) * 50;
    } else if (i < 20) {
      totalBloomed = 120 + randomFactor + (20 - i) * 5;
      totalSpent = 600 + (randomFactor * 3) + (20 - i) * 30;
    } else if (i < 35) {
      totalBloomed = 60 + randomFactor + (35 - i) * 2;
      totalSpent = 300 + (randomFactor * 2) + (35 - i) * 15;
    } else {
      totalBloomed = 20 + randomFactor;
      totalSpent = 100 + (randomFactor * 2);
    }
    
    const legendaryCount = Math.min(Math.floor(totalBloomed * 0.12) + (randomFactor % 8), Math.floor(totalBloomed * 0.25));
    
    const currentStreak = Math.min((seed % 12) + 1 + Math.floor(i / 10), 14);
    const longestStreak = Math.max(currentStreak, Math.min(currentStreak + (randomFactor % 5), 14));
    
    bloomedRankings.push({
      id: `bloomed_${i}`,
      username: names[i % names.length] + (i >= names.length ? Math.floor(i / names.length) : ''),
      score: totalBloomed,
      rank: i + 1,
      totalBloomed,
      totalSpent,
    });

    legendaryRankings.push({
      id: `legendary_${i}`,
      username: names[i % names.length] + (i >= names.length ? Math.floor(i / names.length) : ''),
      score: legendaryCount,
      rank: i + 1,
      legendaryCount,
      totalSpent,
    });
    
    streakRankings.push({
      id: `streak_${i}`,
      username: names[i % names.length] + (i >= names.length ? Math.floor(i / names.length) : ''),
      score: currentStreak,
      rank: i + 1,
      currentStreak,
      longestStreak,
      totalSpent,
    });
  }

  bloomedRankings.sort((a, b) => b.score - a.score);
  legendaryRankings.sort((a, b) => b.score - a.score);
  streakRankings.sort((a, b) => b.score - a.score);

  bloomedRankings.forEach((r, i) => r.rank = i + 1);
  legendaryRankings.forEach((r, i) => r.rank = i + 1);
  streakRankings.forEach((r, i) => r.rank = i + 1);

  return { bloomedRankings, legendaryRankings, streakRankings };
};

export const [RankingProvider, useRankings] = createContextHook(() => {
  const [bloomedRankings, setBloomedRankings] = useState<BloomedRanking[]>([]);
  const [legendaryRankings, setLegendaryRankings] = useState<LegendaryRanking[]>([]);
  const [streakRankings, setStreakRankings] = useState<StreakRanking[]>([]);
  const [userData, setUserData] = useState<UserRankingData>({
    username: 'You',
    currentStreak: 0,
    longestStreak: 0,
    lastCheckIn: '',
  });

  const { getBloomingSeeds, inventory } = useInventory();
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

  const bloomedRankingsQuery = useQuery({
    queryKey: ['bloomedRankings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_BLOOMED);
      if (stored) {
        return JSON.parse(stored);
      }
      const { bloomedRankings } = generateMockRankings();
      return bloomedRankings;
    }
  });

  const legendaryRankingsQuery = useQuery({
    queryKey: ['legendaryRankings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_LEGENDARY);
      if (stored) {
        return JSON.parse(stored);
      }
      const { legendaryRankings } = generateMockRankings();
      return legendaryRankings;
    }
  });

  const streakRankingsQuery = useQuery({
    queryKey: ['streakRankings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_STREAK);
      if (stored) {
        return JSON.parse(stored);
      }
      const { streakRankings } = generateMockRankings();
      return streakRankings;
    }
  });

  const { mutate: saveUserDataMutate } = useMutation({
    mutationFn: async (data: UserRankingData) => {
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveBloomedRankingsMutate } = useMutation({
    mutationFn: async (data: BloomedRanking[]) => {
      await AsyncStorage.setItem(STORAGE_KEY_BLOOMED, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveLegendaryRankingsMutate } = useMutation({
    mutationFn: async (data: LegendaryRanking[]) => {
      await AsyncStorage.setItem(STORAGE_KEY_LEGENDARY, JSON.stringify(data));
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
    if (bloomedRankingsQuery.data) {
      setBloomedRankings(bloomedRankingsQuery.data);
    }
  }, [bloomedRankingsQuery.data]);

  useEffect(() => {
    if (legendaryRankingsQuery.data) {
      setLegendaryRankings(legendaryRankingsQuery.data);
    }
  }, [legendaryRankingsQuery.data]);

  useEffect(() => {
    if (streakRankingsQuery.data) {
      setStreakRankings(streakRankingsQuery.data);
    }
  }, [streakRankingsQuery.data]);

  const updateStreakRankings = useCallback((currentStreak: number, longestStreak: number) => {
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
      allRankings.forEach((r, i) => r.rank = i + 1);

      saveStreakRankingsMutate(allRankings);
      return allRankings;
    });
  }, [userData.username, totalSpent, saveStreakRankingsMutate]);

  const checkInStreak = useCallback(() => {
    const today = getEasternTime().toDateString();
    
    setUserData(prevData => {
      if (prevData.lastCheckIn === today) {
        return prevData;
      }

      const yesterday = getEasternTime();
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

  const updateBloomedRankings = useCallback(() => {
    setBloomedRankings(prevRankings => {
      const totalBloomed = getBloomingSeeds();
      
      const userRanking: BloomedRanking = {
        id: 'user',
        username: userData.username,
        score: totalBloomed,
        rank: 0,
        totalBloomed,
        totalSpent,
      };

      const otherRankings = prevRankings.filter(r => r.id !== 'user');
      const allRankings: BloomedRanking[] = [...otherRankings, userRanking];
      
      allRankings.sort((a, b) => b.score - a.score);
      allRankings.forEach((r, i) => r.rank = i + 1);

      saveBloomedRankingsMutate(allRankings);
      return allRankings;
    });
  }, [getBloomingSeeds, userData.username, totalSpent, saveBloomedRankingsMutate]);

  const updateLegendaryRankings = useCallback(() => {
    setLegendaryRankings(prevRankings => {
      const legendaryCount = inventory.filter(item => {
        const isLegendary = item.color.toLowerCase().includes('ffd700') || item.color.toLowerCase().includes('ffa500');
        const isBloomedStage = item.stage === 'blooming';
        return isLegendary && isBloomedStage;
      }).length;
      
      const userRanking: LegendaryRanking = {
        id: 'user',
        username: userData.username,
        score: legendaryCount,
        rank: 0,
        legendaryCount,
        totalSpent,
      };

      const otherRankings = prevRankings.filter(r => r.id !== 'user');
      const allRankings: LegendaryRanking[] = [...otherRankings, userRanking];
      
      allRankings.sort((a, b) => b.score - a.score);
      allRankings.forEach((r, i) => r.rank = i + 1);

      saveLegendaryRankingsMutate(allRankings);
      return allRankings;
    });
  }, [inventory, userData.username, totalSpent, saveLegendaryRankingsMutate]);

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

  const getUserBloomedRank = useCallback(() => {
    const userRanking = bloomedRankings.find(r => r.id === 'user');
    return userRanking?.rank || 0;
  }, [bloomedRankings]);

  const getUserLegendaryRank = useCallback(() => {
    const userRanking = legendaryRankings.find(r => r.id === 'user');
    return userRanking?.rank || 0;
  }, [legendaryRankings]);

  const getUserStreakRank = useCallback(() => {
    const userRanking = streakRankings.find(r => r.id === 'user');
    return userRanking?.rank || 0;
  }, [streakRankings]);

  return {
    bloomedRankings,
    legendaryRankings,
    streakRankings,
    userData,
    isLoading: userDataQuery.isLoading || bloomedRankingsQuery.isLoading || legendaryRankingsQuery.isLoading || streakRankingsQuery.isLoading,
    checkInStreak,
    updateBloomedRankings,
    updateLegendaryRankings,
    setUsername,
    getUserBloomedRank,
    getUserLegendaryRank,
    getUserStreakRank,
  };
});
