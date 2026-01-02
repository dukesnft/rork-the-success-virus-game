import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { InventoryItem, Seed, SeedRarity } from '@/types/inventory';

const STORAGE_KEY = 'inventory';
const SEEDS_STORAGE_KEY = 'seeds_inventory';

export const [InventoryProvider, useInventory] = createContextHook(() => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [seeds, setSeeds] = useState<Seed[]>([]);

  const inventoryQuery = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('[Inventory] Error loading inventory:', error);
        return [];
      }
    },
    initialData: [],
    staleTime: Infinity,
  });

  const seedsQuery = useQuery({
    queryKey: ['seeds'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(SEEDS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('[Inventory] Error loading seeds:', error);
        return [];
      }
    },
    initialData: [],
    staleTime: Infinity,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InventoryItem[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  });

  const saveSeedsMutation = useMutation({
    mutationFn: async (data: Seed[]) => {
      await AsyncStorage.setItem(SEEDS_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveMutate } = saveMutation;
  const { mutate: saveSeedsMutate } = saveSeedsMutation;

  useEffect(() => {
    if (inventoryQuery.data) {
      setInventory(inventoryQuery.data);
    }
  }, [inventoryQuery.data]);

  useEffect(() => {
    if (seedsQuery.data) {
      setSeeds(seedsQuery.data);
    }
  }, [seedsQuery.data]);

  const addToInventory = useCallback((item: Omit<InventoryItem, 'id' | 'collectedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      collectedAt: Date.now(),
    };

    const updated = [...inventory, newItem];
    setInventory(updated);
    saveMutate(updated);
    
    console.log(`Added ${item.rarity} bloom to inventory: ${item.intention}`);
  }, [inventory, saveMutate]);

  const removeFromInventory = useCallback((id: string) => {
    const updated = inventory.filter(item => item.id !== id);
    setInventory(updated);
    saveMutate(updated);
  }, [inventory, saveMutate]);

  const getInventoryByCategory = useCallback((category: string) => {
    return inventory.filter(item => item.category === category);
  }, [inventory]);

  const getInventoryByStage = useCallback((stage: string) => {
    return inventory.filter(item => item.stage === stage);
  }, [inventory]);

  const getTotalSeeds = useCallback(() => {
    return inventory.length;
  }, [inventory]);

  const getBloomingSeeds = useCallback(() => {
    return inventory.filter(item => item.stage === 'blooming').length;
  }, [inventory]);

  const addSeeds = useCallback((rarity: SeedRarity, count: number = 1) => {
    setSeeds(prev => {
      const newSeeds: Seed[] = [];
      for (let i = 0; i < count; i++) {
        newSeeds.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + i,
          rarity,
          acquiredAt: Date.now(),
        });
      }
      const updated = [...prev, ...newSeeds];
      saveSeedsMutate(updated);
      return updated;
    });
  }, [saveSeedsMutate]);

  const useSeed = useCallback((rarity: SeedRarity) => {
    let consumed = false;
    setSeeds(prev => {
      const seedIndex = prev.findIndex(s => s.rarity === rarity);
      if (seedIndex === -1) {
        consumed = false;
        return prev;
      }
      
      const updated = prev.filter((_, index) => index !== seedIndex);
      saveSeedsMutate(updated);
      consumed = true;
      return updated;
    });
    return consumed;
  }, [saveSeedsMutate]);

  const getSeedsByRarity = useCallback((rarity: SeedRarity) => {
    return seeds.filter(s => s.rarity === rarity).length;
  }, [seeds]);

  const getTotalSeedsCount = useCallback(() => {
    return seeds.length;
  }, [seeds]);

  const burnBloomsForSeed = useCallback((bloomIds: string[]) => {
    if (bloomIds.length !== 5) {
      console.warn('Must burn exactly 5 blooms');
      return null;
    }

    const bloomsToBurn = bloomIds.map(id => inventory.find(item => item.id === id)).filter(Boolean) as InventoryItem[];
    
    if (bloomsToBurn.length !== 5 || !bloomsToBurn.every(b => b.stage === 'blooming')) {
      console.warn('All items must be blooming stage');
      return null;
    }

    const getRarityFromColor = (color: string): SeedRarity => {
      if (color.toLowerCase().includes('ffd700') || color.toLowerCase().includes('ffa500')) return 'legendary';
      if (color.toLowerCase().includes('9370db') || color.toLowerCase().includes('8a2be2')) return 'epic';
      if (color.toLowerCase().includes('4169e1') || color.toLowerCase().includes('1e90ff')) return 'rare';
      return 'common';
    };

    const bloomRarities = bloomsToBurn.map(b => getRarityFromColor(b.color));
    
    const rarityCounts = bloomRarities.reduce((acc, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {} as Record<SeedRarity, number>);

    const dominantRarity = Object.entries(rarityCounts).sort(([,a], [,b]) => b - a)[0][0] as SeedRarity;
    const dominantCount = rarityCounts[dominantRarity];

    const calculateResultRarity = (): SeedRarity => {
      const rand = Math.random() * 100;
      
      if (dominantRarity === 'legendary') {
        if (dominantCount === 5) {
          if (rand < 70) return 'legendary';
          if (rand < 95) return 'epic';
          return 'rare';
        } else if (dominantCount >= 3) {
          if (rand < 50) return 'legendary';
          if (rand < 85) return 'epic';
          return 'rare';
        } else {
          if (rand < 25) return 'legendary';
          if (rand < 70) return 'epic';
          return 'rare';
        }
      }
      
      if (dominantRarity === 'epic') {
        if (rand < 70) return 'epic';
        if (rand < 92) return 'rare';
        if (rand < 99) return 'common';
        return 'legendary';
      }
      
      if (dominantRarity === 'rare') {
        if (rand < 70) return 'rare';
        if (rand < 94) return 'common';
        if (rand < 99.2) return 'epic';
        return 'legendary';
      }
      
      if (rand < 70) return 'common';
      if (rand < 92) return 'rare';
      if (rand < 99.5) return 'epic';
      return 'legendary';
    };

    const resultRarity = calculateResultRarity();
    
    setInventory(prev => {
      const updated = prev.filter(item => !bloomIds.includes(item.id));
      saveMutate(updated);
      return updated;
    });

    addSeeds(resultRarity, 1);
    
    return resultRarity;
  }, [inventory, saveMutate, addSeeds]);

  return {
    inventory,
    seeds,
    isLoading: inventoryQuery.isLoading || seedsQuery.isLoading,
    addToInventory,
    removeFromInventory,
    getInventoryByCategory,
    getInventoryByStage,
    getTotalSeeds,
    getBloomingSeeds,
    addSeeds,
    useSeed,
    getSeedsByRarity,
    getTotalSeedsCount,
    burnBloomsForSeed,
  };
});
