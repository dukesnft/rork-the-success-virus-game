import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { Background } from '@/types/background';
import { AVAILABLE_BACKGROUNDS } from '@/constants/backgrounds';
import { usePremium } from '@/contexts/PremiumContext';

const STORAGE_KEY = 'backgrounds';
const SELECTED_BG_KEY = 'selected_background';

export const [BackgroundProvider, useBackgrounds] = createContextHook(() => {
  const [backgrounds, setBackgrounds] = useState<Background[]>(AVAILABLE_BACKGROUNDS);
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string>('cosmic-purple');
  const { isPremium } = usePremium();

  const backgroundsQuery = useQuery({
    queryKey: ['backgrounds'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const purchasedData = stored ? JSON.parse(stored) : {};
      
      const selected = await AsyncStorage.getItem(SELECTED_BG_KEY);
      if (selected) {
        setSelectedBackgroundId(selected);
      }
      
      return AVAILABLE_BACKGROUNDS.map(bg => ({
        ...bg,
        isPurchased: bg.id === 'cosmic-purple' || purchasedData[bg.id]?.isPurchased || false,
      }));
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Background[]) => {
      const purchasedData = data.reduce((acc, bg) => {
        acc[bg.id] = {
          isPurchased: bg.isPurchased,
        };
        return acc;
      }, {} as Record<string, { isPurchased: boolean }>);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(purchasedData));
      return data;
    }
  });

  const { mutate: saveMutate } = saveMutation;

  useEffect(() => {
    if (backgroundsQuery.data) {
      setBackgrounds(backgroundsQuery.data);
    }
  }, [backgroundsQuery.data]);

  const purchaseBackground = useCallback((backgroundId: string) => {
    const updated = backgrounds.map(bg => 
      bg.id === backgroundId ? { ...bg, isPurchased: true } : bg
    );
    setBackgrounds(updated);
    saveMutate(updated);
  }, [backgrounds, saveMutate]);

  const selectBackground = useCallback(async (backgroundId: string) => {
    setSelectedBackgroundId(backgroundId);
    await AsyncStorage.setItem(SELECTED_BG_KEY, backgroundId);
  }, []);

  const getBackgroundPrice = useCallback((background: Background) => {
    if (isPremium) {
      return background.price * 0.5;
    }
    return background.price;
  }, [isPremium]);

  const selectedBackground = backgrounds.find(bg => bg.id === selectedBackgroundId) || backgrounds[0];
  const purchasedBackgrounds = backgrounds.filter(bg => bg.isPurchased);
  const availableBackgrounds = backgrounds.filter(bg => !bg.isPurchased);

  return {
    backgrounds,
    selectedBackground,
    purchasedBackgrounds,
    availableBackgrounds,
    isLoading: backgroundsQuery.isLoading,
    purchaseBackground,
    selectBackground,
    getBackgroundPrice,
  };
});
