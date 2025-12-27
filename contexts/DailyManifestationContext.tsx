import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { WeeklyManifestation, WeeklyManifestationState } from '@/types/dailyManifestation';
import { usePremium } from '@/contexts/PremiumContext';
import { useManifestations } from '@/contexts/ManifestationContext';

const STORAGE_KEY = 'weekly_manifestations';

const getWeekStart = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  return monday.toISOString().split('T')[0];
};

const MANIFESTATION_TEMPLATES = [
  "Today, I embrace abundance in {category}",
  "I am worthy of success and {category} flows to me",
  "My intentions for {category} are manifesting now",
  "I attract positive energy in {category}",
  "Today brings new opportunities for {category}",
  "I am aligned with my {category} goals",
  "I trust the universe to guide my {category} journey",
  "My {category} dreams are becoming reality",
  "I radiate confidence in my {category} path",
  "I am grateful for the {category} I have and what's coming",
  "Today, I take inspired action toward {category}",
  "I release all doubts about my {category} success",
  "My energy attracts miracles in {category}",
  "I am open to receiving all the {category} I desire",
  "Today, I choose to focus on {category} with clarity",
  "I trust my intuition to guide me in {category}",
  "My {category} intentions are powerful and real",
  "I deserve all the {category} coming my way",
  "I am becoming the best version of myself in {category}",
  "The universe conspires to help me with {category}",
];

const generatePersonalizedManifestation = (categories: string[]): WeeklyManifestation => {
  const category = categories.length > 0 
    ? categories[Math.floor(Math.random() * categories.length)]
    : 'life';
  
  const template = MANIFESTATION_TEMPLATES[Math.floor(Math.random() * MANIFESTATION_TEMPLATES.length)];
  const text = template.replace('{category}', category.toLowerCase());
  
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    text,
    category,
    weekStart: getWeekStart(),
    used: false,
  };
};

export const [WeeklyManifestationProvider, useDailyManifestations] = createContextHook(() => {
  const [manifestations, setManifestations] = useState<WeeklyManifestation[]>([]);
  const [extraSlots, setExtraSlots] = useState(0);
  const { isPremium } = usePremium();
  const { manifestations: userManifestations } = useManifestations();

  const weeklyQuery = useQuery({
    queryKey: ['weeklyManifestations'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const data: WeeklyManifestationState = stored 
        ? JSON.parse(stored) 
        : { manifestations: [], lastGeneratedWeek: '', extraSlots: 0 };
      
      return data;
    }
  });

  const { mutate: saveMutate } = useMutation({
    mutationFn: async (data: WeeklyManifestationState) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  });

  useEffect(() => {
    if (weeklyQuery.data) {
      setManifestations(weeklyQuery.data.manifestations);
      setExtraSlots(weeklyQuery.data.extraSlots);
      
      const currentWeek = getWeekStart();
      if (weeklyQuery.data.lastGeneratedWeek !== currentWeek) {
        const categories = userManifestations.length > 0
          ? userManifestations.map(m => m.category)
          : ['wealth', 'love', 'health', 'success', 'happiness'];
        
        const baseCount = isPremium ? 5 : 1;
        const totalCount = baseCount + weeklyQuery.data.extraSlots;
        
        const newManifestations: WeeklyManifestation[] = [];
        for (let i = 0; i < totalCount; i++) {
          newManifestations.push(generatePersonalizedManifestation(categories));
        }
        
        const data: WeeklyManifestationState = {
          manifestations: newManifestations,
          lastGeneratedWeek: currentWeek,
          extraSlots: weeklyQuery.data.extraSlots,
        };
        
        setManifestations(newManifestations);
        saveMutate(data);
      }
    }
  }, [weeklyQuery.data, isPremium, userManifestations, saveMutate]);

  const regenerateWeekly = useCallback(() => {
    const currentWeek = getWeekStart();
    const baseCount = isPremium ? 5 : 1;
    const totalCount = baseCount + extraSlots;
    
    const categories = userManifestations.length > 0
      ? userManifestations.map(m => m.category)
      : ['wealth', 'love', 'health', 'success', 'happiness'];
    
    const newManifestations: WeeklyManifestation[] = [];
    for (let i = 0; i < totalCount; i++) {
      newManifestations.push(generatePersonalizedManifestation(categories));
    }
    
    const data: WeeklyManifestationState = {
      manifestations: newManifestations,
      lastGeneratedWeek: currentWeek,
      extraSlots,
    };
    
    setManifestations(newManifestations);
    saveMutate(data);
  }, [isPremium, extraSlots, userManifestations, saveMutate]);

  const markAsUsed = useCallback((id: string) => {
    const updated = manifestations.map(m => 
      m.id === id ? { ...m, used: true } : m
    );
    
    setManifestations(updated);
    saveMutate({
      manifestations: updated,
      lastGeneratedWeek: getWeekStart(),
      extraSlots,
    });
  }, [manifestations, extraSlots, saveMutate]);

  const purchaseExtraSlots = useCallback((count: number) => {
    const newExtraSlots = extraSlots + count;
    setExtraSlots(newExtraSlots);
    
    const categories = userManifestations.length > 0
      ? userManifestations.map(m => m.category)
      : ['wealth', 'love', 'health', 'success', 'happiness'];
    
    const newManifestations: WeeklyManifestation[] = [];
    for (let i = 0; i < count; i++) {
      newManifestations.push(generatePersonalizedManifestation(categories));
    }
    
    const updated = [...manifestations, ...newManifestations];
    setManifestations(updated);
    
    saveMutate({
      manifestations: updated,
      lastGeneratedWeek: getWeekStart(),
      extraSlots: newExtraSlots,
    });
  }, [extraSlots, manifestations, userManifestations, saveMutate]);

  const refreshWeekly = useCallback(() => {
    regenerateWeekly();
  }, [regenerateWeekly]);

  return {
    manifestations,
    extraSlots,
    baseCount: isPremium ? 5 : 1,
    totalCount: (isPremium ? 5 : 1) + extraSlots,
    isLoading: weeklyQuery.isLoading,
    markAsUsed,
    purchaseExtraSlots,
    refreshWeekly,
    refreshDaily: refreshWeekly,
  };
});
