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
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
  });

  const seedsQuery = useQuery({
    queryKey: ['seeds'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SEEDS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
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
  };
});
