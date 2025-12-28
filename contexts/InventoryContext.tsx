import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { InventoryItem } from '@/types/inventory';

const STORAGE_KEY = 'inventory';

export const [InventoryProvider, useInventory] = createContextHook(() => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const inventoryQuery = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InventoryItem[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveMutate } = saveMutation;

  useEffect(() => {
    if (inventoryQuery.data) {
      setInventory(inventoryQuery.data);
    }
  }, [inventoryQuery.data]);

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

  return {
    inventory,
    isLoading: inventoryQuery.isLoading,
    addToInventory,
    removeFromInventory,
    getInventoryByCategory,
    getInventoryByStage,
    getTotalSeeds,
    getBloomingSeeds,
  };
});
