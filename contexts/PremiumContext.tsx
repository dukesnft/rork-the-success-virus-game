import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';

const PREMIUM_STORAGE_KEY = 'premium_status';
const ENERGY_BOOSTS_KEY = 'energy_boosts';
const ENERGY_STORAGE_KEY = 'daily_energy';

interface PremiumState {
  isPremium: boolean;
  expiresAt: number | null;
}

interface EnergyState {
  energy: number;
  maxEnergy: number;
  lastRefreshDate: string;
  streak: number;
  lastPlayDate: string;
}

export const [PremiumProvider, usePremium] = createContextHook(() => {
  const [isPremium, setIsPremium] = useState(false);
  const [energyBoosts, setEnergyBoosts] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [maxEnergy, setMaxEnergy] = useState(10);
  const [streak, setStreak] = useState(0);

  const premiumQuery = useQuery({
    queryKey: ['premium'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
      const data: PremiumState = stored ? JSON.parse(stored) : { isPremium: false, expiresAt: null };
      
      if (data.isPremium && data.expiresAt && data.expiresAt < Date.now()) {
        return { isPremium: false, expiresAt: null };
      }
      
      return data;
    }
  });

  const boostsQuery = useQuery({
    queryKey: ['energyBoosts'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ENERGY_BOOSTS_KEY);
      return stored ? parseInt(stored) : 0;
    }
  });

  const energyQuery = useQuery({
    queryKey: ['dailyEnergy'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ENERGY_STORAGE_KEY);
      const today = new Date().toISOString().split('T')[0];
      
      if (!stored) {
        return {
          energy: 10,
          maxEnergy: 10,
          lastRefreshDate: today,
          streak: 1,
          lastPlayDate: today,
        };
      }
      
      const data: EnergyState = JSON.parse(stored);
      
      if (data.lastRefreshDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const newStreak = data.lastPlayDate === yesterdayStr ? data.streak + 1 : 1;
        
        return {
          energy: data.maxEnergy,
          maxEnergy: data.maxEnergy,
          lastRefreshDate: today,
          streak: newStreak,
          lastPlayDate: today,
        };
      }
      
      return data;
    }
  });

  const { mutate: savePremium } = useMutation({
    mutationFn: async (data: PremiumState) => {
      await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveBoosts } = useMutation({
    mutationFn: async (boosts: number) => {
      await AsyncStorage.setItem(ENERGY_BOOSTS_KEY, boosts.toString());
      return boosts;
    }
  });

  const { mutate: saveEnergy } = useMutation({
    mutationFn: async (data: EnergyState) => {
      await AsyncStorage.setItem(ENERGY_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  });

  useEffect(() => {
    if (premiumQuery.data) {
      setIsPremium(premiumQuery.data.isPremium);
    }
  }, [premiumQuery.data]);

  useEffect(() => {
    if (boostsQuery.data !== undefined) {
      setEnergyBoosts(boostsQuery.data);
    }
  }, [boostsQuery.data]);

  useEffect(() => {
    if (energyQuery.data) {
      const isPremiumUser = premiumQuery.data?.isPremium || false;
      const baseMax = isPremiumUser ? 20 : 10;
      
      setEnergy(energyQuery.data.energy);
      setMaxEnergy(baseMax);
      setStreak(energyQuery.data.streak);
      
      if (energyQuery.data.maxEnergy !== baseMax) {
        const today = new Date().toISOString().split('T')[0];
        saveEnergy({
          ...energyQuery.data,
          maxEnergy: baseMax,
          energy: Math.min(energyQuery.data.energy, baseMax),
          lastRefreshDate: today,
        });
      }
    }
  }, [energyQuery.data, premiumQuery.data, saveEnergy]);

  const upgradeToPremium = useCallback((duration: 'month' | 'year') => {
    const now = Date.now();
    const expiresAt = duration === 'month' 
      ? now + 30 * 24 * 60 * 60 * 1000 
      : now + 365 * 24 * 60 * 60 * 1000;
    
    const data: PremiumState = { isPremium: true, expiresAt };
    setIsPremium(true);
    savePremium(data);
  }, [savePremium]);

  const purchaseEnergyBoost = useCallback(() => {
    const newBoosts = energyBoosts + 10;
    setEnergyBoosts(newBoosts);
    saveBoosts(newBoosts);
  }, [energyBoosts, saveBoosts]);

  const consumeEnergyBoost = useCallback(() => {
    if (energyBoosts > 0) {
      const newBoosts = energyBoosts - 1;
      setEnergyBoosts(newBoosts);
      saveBoosts(newBoosts);
      return true;
    }
    return false;
  }, [energyBoosts, saveBoosts]);

  const consumeEnergy = useCallback((amount: number = 1) => {
    if (energy >= amount) {
      const newEnergy = energy - amount;
      const today = new Date().toISOString().split('T')[0];
      
      setEnergy(newEnergy);
      saveEnergy({
        energy: newEnergy,
        maxEnergy,
        lastRefreshDate: today,
        streak,
        lastPlayDate: today,
      });
      return true;
    }
    return false;
  }, [energy, maxEnergy, streak, saveEnergy]);

  const refillEnergy = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setEnergy(maxEnergy);
    saveEnergy({
      energy: maxEnergy,
      maxEnergy,
      lastRefreshDate: today,
      streak,
      lastPlayDate: today,
    });
  }, [maxEnergy, streak, saveEnergy]);

  return {
    isPremium,
    energyBoosts,
    energy,
    maxEnergy,
    streak,
    isLoading: premiumQuery.isLoading || boostsQuery.isLoading || energyQuery.isLoading,
    upgradeToPremium,
    purchaseEnergyBoost,
    consumeEnergyBoost,
    consumeEnergy,
    refillEnergy,
  };
});
