import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { DailyQuest, QuestType } from '@/types/quest';
import * as Haptics from 'expo-haptics';

const STORAGE_KEY = 'daily_quests';

const generateDailyQuests = (): DailyQuest[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const expiresAt = tomorrow.getTime();

  const questTemplates: { type: QuestType; title: string; description: string; target: number; gems: number; energy?: number }[] = [
    { type: 'nurture', title: 'Daily Care', description: 'Nurture 5 manifestations', target: 5, gems: 35, energy: 8 },
    { type: 'nurture', title: 'Extra Love', description: 'Nurture 10 manifestations', target: 10, gems: 60, energy: 15 },
    { type: 'plant', title: 'New Beginnings', description: 'Plant 2 new manifestations', target: 2, gems: 45 },
    { type: 'harvest', title: 'Harvest Time', description: 'Harvest 1 blooming manifestation', target: 1, gems: 55, energy: 12 },
    { type: 'share', title: 'Spread Joy', description: 'Share 2 manifestations to community', target: 2, gems: 70 },
    { type: 'streak', title: 'Consistency is Key', description: 'Maintain your login streak', target: 1, gems: 30, energy: 8 },
  ];

  const selectedQuests = questTemplates
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((template, index) => ({
      id: `quest_${Date.now()}_${index}`,
      title: template.title,
      description: template.description,
      type: template.type,
      targetValue: template.target,
      currentValue: 0,
      completed: false,
      reward: {
        gems: template.gems,
        energy: template.energy,
      },
      expiresAt,
    }));

  return selectedQuests;
};

export const [QuestProvider, useQuests] = createContextHook(() => {
  const [quests, setQuests] = useState<DailyQuest[]>([]);

  const questsQuery = useQuery({
    queryKey: ['dailyQuests'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedQuests: DailyQuest[] = JSON.parse(stored);
        const now = Date.now();
        
        if (parsedQuests.length === 0 || parsedQuests[0].expiresAt < now) {
          return generateDailyQuests();
        }
        
        return parsedQuests;
      }
      return generateDailyQuests();
    }
  });

  const { mutate: saveMutate } = useMutation({
    mutationFn: async (data: DailyQuest[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  });

  useEffect(() => {
    if (questsQuery.data) {
      setQuests(questsQuery.data);
    }
  }, [questsQuery.data]);

  const progressQuest = useCallback((type: QuestType, amount: number = 1) => {
    setQuests(prev => {
      const updated = prev.map(quest => {
        if (quest.type === type && !quest.completed) {
          const newValue = Math.min(quest.currentValue + amount, quest.targetValue);
          const shouldComplete = newValue >= quest.targetValue;
          
          if (shouldComplete && !quest.completed) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return { ...quest, currentValue: newValue, completed: true, completedAt: Date.now() };
          }
          
          return { ...quest, currentValue: newValue };
        }
        return quest;
      });
      
      saveMutate(updated);
      return updated;
    });
  }, [saveMutate]);

  const getCompletedCount = useCallback(() => {
    return quests.filter(q => q.completed).length;
  }, [quests]);

  const getTotalCount = useCallback(() => {
    return quests.length;
  }, [quests]);

  const getActiveQuests = useCallback(() => {
    return quests.filter(q => !q.completed);
  }, [quests]);

  const refreshQuests = useCallback(() => {
    const newQuests = generateDailyQuests();
    setQuests(newQuests);
    saveMutate(newQuests);
  }, [saveMutate]);

  return {
    quests,
    isLoading: questsQuery.isLoading,
    progressQuest,
    getCompletedCount,
    getTotalCount,
    getActiveQuests,
    refreshQuests,
  };
});
