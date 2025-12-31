import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { DailyManifestation, DailyManifestationState } from '@/types/dailyManifestation';
import { usePremium } from '@/contexts/PremiumContext';
import { useManifestations } from '@/contexts/ManifestationContext';
import { getStartOfWeek } from '@/utils/dateUtils';

const STORAGE_KEY = 'daily_manifestations';

const getToday = (): string => {
  return getStartOfWeek();
};

const MANIFESTATION_TEMPLATES = [
  "Today, I embrace abundance in {category}",
  "I am worthy of success and {category} flows to me effortlessly",
  "My intentions for {category} are manifesting in divine timing",
  "I attract positive energy and miracles in {category}",
  "Today brings new opportunities for growth in {category}",
  "I am perfectly aligned with my {category} goals and dreams",
  "I trust the universe to guide my {category} journey with wisdom",
  "My {category} dreams are becoming my reality right now",
  "I radiate confidence and joy in my {category} path",
  "I am deeply grateful for the {category} I have and what's manifesting",
  "Today, I take inspired action toward my {category} vision",
  "I release all doubts and fears about my {category} success",
  "My powerful energy attracts infinite miracles in {category}",
  "I am open to receiving all the abundant {category} I desire",
  "Today, I choose to focus on {category} with crystal clarity",
  "I trust my intuition to guide me perfectly in {category}",
  "My {category} intentions are powerful, real, and manifesting now",
  "I deeply deserve all the wonderful {category} coming my way",
  "I am becoming the highest version of myself in {category}",
  "The universe conspires to help me achieve {category} beyond imagination",
  "I am a magnet for positive {category} experiences and blessings",
  "My heart is open to receive limitless {category} abundance",
  "Every day I grow stronger and more aligned with {category}",
  "I celebrate my {category} journey and trust the process completely",
  "Divine timing brings me exactly what I need for {category}",
  "I am surrounded by love and support in my {category} path",
  "My {category} manifestations exceed my wildest expectations",
  "I claim my birthright of abundant {category} with gratitude",
  "The universe delivers {category} to me in miraculous ways",
  "I am worthy of extraordinary {category} success and happiness",
];

const generatePersonalizedManifestation = (categories: string[]): DailyManifestation => {
  const category = categories.length > 0 
    ? categories[Math.floor(Math.random() * categories.length)]
    : 'life';
  
  const template = MANIFESTATION_TEMPLATES[Math.floor(Math.random() * MANIFESTATION_TEMPLATES.length)];
  const text = template.replace('{category}', category.toLowerCase());
  
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    text,
    category,
    date: getToday(),
    used: false,
  };
};

export const [DailyManifestationProvider, useDailyManifestations] = createContextHook(() => {
  const [manifestations, setManifestations] = useState<DailyManifestation[]>([]);
  const [extraSlots, setExtraSlots] = useState(0);
  const { isPremium } = usePremium();
  const { manifestations: userManifestations } = useManifestations();

  const dailyQuery = useQuery({
    queryKey: ['dailyManifestations'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const data: DailyManifestationState = stored 
        ? JSON.parse(stored) 
        : { manifestations: [], lastGeneratedDate: '', extraSlots: 0 };
      
      return data;
    }
  });

  const { mutate: saveMutate } = useMutation({
    mutationFn: async (data: DailyManifestationState) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  });

  useEffect(() => {
    if (dailyQuery.data) {
      setManifestations(dailyQuery.data.manifestations);
      setExtraSlots(dailyQuery.data.extraSlots);
      
      const today = getToday();
      if (dailyQuery.data.lastGeneratedDate !== today) {
        const categories = userManifestations.length > 0
          ? userManifestations.map(m => m.category)
          : ['wealth', 'love', 'health', 'success', 'happiness'];
        
        const baseCount = isPremium ? 5 : 1;
        const totalCount = baseCount + dailyQuery.data.extraSlots;
        
        const newManifestations: DailyManifestation[] = [];
        for (let i = 0; i < totalCount; i++) {
          newManifestations.push(generatePersonalizedManifestation(categories));
        }
        
        const data: DailyManifestationState = {
          manifestations: newManifestations,
          lastGeneratedDate: today,
          extraSlots: dailyQuery.data.extraSlots,
        };
        
        setManifestations(newManifestations);
        saveMutate(data);
      }
    }
  }, [dailyQuery.data, isPremium, userManifestations, saveMutate]);

  const regenerateDaily = useCallback(() => {
    const today = getToday();
    const baseCount = isPremium ? 5 : 1;
    const totalCount = baseCount + extraSlots;
    
    const categories = userManifestations.length > 0
      ? userManifestations.map(m => m.category)
      : ['wealth', 'love', 'health', 'success', 'happiness'];
    
    const newManifestations: DailyManifestation[] = [];
    for (let i = 0; i < totalCount; i++) {
      newManifestations.push(generatePersonalizedManifestation(categories));
    }
    
    const data: DailyManifestationState = {
      manifestations: newManifestations,
      lastGeneratedDate: today,
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
      lastGeneratedDate: getToday(),
      extraSlots,
    });
  }, [manifestations, extraSlots, saveMutate]);

  const purchaseExtraSlots = useCallback((count: number) => {
    const newExtraSlots = extraSlots + count;
    setExtraSlots(newExtraSlots);
    
    const categories = userManifestations.length > 0
      ? userManifestations.map(m => m.category)
      : ['wealth', 'love', 'health', 'success', 'happiness'];
    
    const newManifestations: DailyManifestation[] = [];
    for (let i = 0; i < count; i++) {
      newManifestations.push(generatePersonalizedManifestation(categories));
    }
    
    const updated = [...manifestations, ...newManifestations];
    setManifestations(updated);
    
    saveMutate({
      manifestations: updated,
      lastGeneratedDate: getToday(),
      extraSlots: newExtraSlots,
    });
  }, [extraSlots, manifestations, userManifestations, saveMutate]);

  const refreshDaily = useCallback(() => {
    regenerateDaily();
  }, [regenerateDaily]);

  return {
    manifestations,
    extraSlots,
    baseCount: isPremium ? 5 : 1,
    totalCount: (isPremium ? 5 : 1) + extraSlots,
    isLoading: dailyQuery.isLoading,
    markAsUsed,
    purchaseExtraSlots,
    refreshDaily,
  };
});
