import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { Achievement } from '@/types/achievement';
import { ACHIEVEMENTS } from '@/constants/achievements';
import * as Haptics from 'expo-haptics';

const STORAGE_KEY = 'achievements';

export const [AchievementProvider, useAchievements] = createContextHook(() => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newUnlocks, setNewUnlocks] = useState<Achievement[]>([]);

  const achievementsQuery = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return ACHIEVEMENTS.map(a => ({ ...a, currentValue: 0, unlocked: false }));
    }
  });

  const { mutate: saveMutate } = useMutation({
    mutationFn: async (data: Achievement[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  });

  useEffect(() => {
    if (achievementsQuery.data) {
      setAchievements(achievementsQuery.data);
    }
  }, [achievementsQuery.data]);

  const updateAchievement = useCallback((id: string, value: number) => {
    setAchievements(prev => {
      const updated = prev.map(ach => {
        if (ach.id === id && !ach.unlocked) {
          const newValue = Math.min(value, ach.targetValue);
          const wasUnlocked = ach.unlocked;
          const shouldUnlock = newValue >= ach.targetValue;
          
          if (shouldUnlock && !wasUnlocked) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const unlockedAch = { ...ach, currentValue: newValue, unlocked: true, unlockedAt: Date.now() };
            setNewUnlocks(curr => [...curr, unlockedAch]);
            return unlockedAch;
          }
          
          return { ...ach, currentValue: newValue };
        }
        return ach;
      });
      
      saveMutate(updated);
      return updated;
    });
  }, [saveMutate]);

  const incrementAchievement = useCallback((id: string, amount: number = 1) => {
    setAchievements(prev => {
      const updated = prev.map(ach => {
        if (ach.id === id && !ach.unlocked) {
          const newValue = Math.min(ach.currentValue + amount, ach.targetValue);
          const wasUnlocked = ach.unlocked;
          const shouldUnlock = newValue >= ach.targetValue;
          
          if (shouldUnlock && !wasUnlocked) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const unlockedAch = { ...ach, currentValue: newValue, unlocked: true, unlockedAt: Date.now() };
            setNewUnlocks(curr => [...curr, unlockedAch]);
            return unlockedAch;
          }
          
          return { ...ach, currentValue: newValue };
        }
        return ach;
      });
      
      saveMutate(updated);
      return updated;
    });
  }, [saveMutate]);

  const clearNewUnlocks = useCallback(() => {
    setNewUnlocks([]);
  }, []);

  const getUnlockedCount = useCallback(() => {
    return achievements.filter(a => a.unlocked).length;
  }, [achievements]);

  const getTotalCount = useCallback(() => {
    return achievements.length;
  }, [achievements]);

  const getAchievementsByCategory = useCallback((category: string) => {
    return achievements.filter(a => a.category === category);
  }, [achievements]);

  return {
    achievements,
    newUnlocks,
    isLoading: achievementsQuery.isLoading,
    updateAchievement,
    incrementAchievement,
    clearNewUnlocks,
    getUnlockedCount,
    getTotalCount,
    getAchievementsByCategory,
  };
});
