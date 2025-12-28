import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';

const PREMIUM_STORAGE_KEY = 'premium_status';
const ENERGY_BOOSTS_KEY = 'energy_boosts';
const ENERGY_STORAGE_KEY = 'daily_energy';
const GEMS_STORAGE_KEY = 'gems';
const SPECIAL_SEEDS_KEY = 'special_seeds';
const GROWTH_BOOSTERS_KEY = 'growth_boosters';
const AUTO_NURTURE_KEY = 'auto_nurture';
const PURCHASES_KEY = 'total_purchases';
const FREE_SEEDS_KEY = 'free_seeds_claimed';
const COMBO_KEY = 'combo_data';
const GARDEN_LEVEL_KEY = 'garden_level';

interface FreeSeedsState {
  claimedToday: number;
  lastClaimDate: string;
}

interface ComboState {
  count: number;
  multiplier: number;
  lastActionTime: number;
}

interface GardenLevel {
  level: number;
  xp: number;
  maxPlantSlots: number;
}

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
  const [gems, setGems] = useState(0);
  const [specialSeeds, setSpecialSeeds] = useState(0);
  const [growthBoosters, setGrowthBoosters] = useState(0);
  const [autoNurtureActive, setAutoNurtureActive] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [freeSeedsClaimed, setFreeSeedsClaimed] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [gardenLevel, setGardenLevel] = useState(1);
  const [gardenXP, setGardenXP] = useState(0);
  const [maxPlantSlots, setMaxPlantSlots] = useState(6);

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

  const gemsQuery = useQuery({
    queryKey: ['gems'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(GEMS_STORAGE_KEY);
      return stored ? parseInt(stored) : 0;
    }
  });

  const specialSeedsQuery = useQuery({
    queryKey: ['specialSeeds'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SPECIAL_SEEDS_KEY);
      return stored ? parseInt(stored) : 0;
    }
  });

  const growthBoostersQuery = useQuery({
    queryKey: ['growthBoosters'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(GROWTH_BOOSTERS_KEY);
      return stored ? parseInt(stored) : 0;
    }
  });

  const autoNurtureQuery = useQuery({
    queryKey: ['autoNurture'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(AUTO_NURTURE_KEY);
      return stored === 'true';
    }
  });

  const purchasesQuery = useQuery({
    queryKey: ['totalPurchases'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PURCHASES_KEY);
      return stored ? parseFloat(stored) : 0;
    }
  });

  const freeSeedsQuery = useQuery({
    queryKey: ['freeSeeds'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FREE_SEEDS_KEY);
      const today = new Date().toISOString().split('T')[0];
      
      if (!stored) {
        return { claimedToday: 0, lastClaimDate: today };
      }
      
      const data: FreeSeedsState = JSON.parse(stored);
      
      if (data.lastClaimDate !== today) {
        return { claimedToday: 0, lastClaimDate: today };
      }
      
      return data;
    }
  });

  const comboQuery = useQuery({
    queryKey: ['combo'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(COMBO_KEY);
      return stored ? JSON.parse(stored) : { count: 0, multiplier: 1, lastActionTime: 0 };
    }
  });

  const gardenLevelQuery = useQuery({
    queryKey: ['gardenLevel'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(GARDEN_LEVEL_KEY);
      return stored ? JSON.parse(stored) : { level: 1, xp: 0, maxPlantSlots: 6 };
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

  const { mutate: saveGems } = useMutation({
    mutationFn: async (gems: number) => {
      await AsyncStorage.setItem(GEMS_STORAGE_KEY, gems.toString());
      return gems;
    }
  });

  const { mutate: saveSpecialSeeds } = useMutation({
    mutationFn: async (seeds: number) => {
      await AsyncStorage.setItem(SPECIAL_SEEDS_KEY, seeds.toString());
      return seeds;
    }
  });

  const { mutate: saveGrowthBoosters } = useMutation({
    mutationFn: async (boosters: number) => {
      await AsyncStorage.setItem(GROWTH_BOOSTERS_KEY, boosters.toString());
      return boosters;
    }
  });

  const { mutate: saveAutoNurture } = useMutation({
    mutationFn: async (active: boolean) => {
      await AsyncStorage.setItem(AUTO_NURTURE_KEY, active.toString());
      return active;
    }
  });

  const { mutate: savePurchases } = useMutation({
    mutationFn: async (amount: number) => {
      await AsyncStorage.setItem(PURCHASES_KEY, amount.toString());
      return amount;
    }
  });

  const { mutate: saveFreeSeeds } = useMutation({
    mutationFn: async (data: FreeSeedsState) => {
      await AsyncStorage.setItem(FREE_SEEDS_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveCombo } = useMutation({
    mutationFn: async (data: ComboState) => {
      await AsyncStorage.setItem(COMBO_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveGardenLevel } = useMutation({
    mutationFn: async (data: GardenLevel) => {
      await AsyncStorage.setItem(GARDEN_LEVEL_KEY, JSON.stringify(data));
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

  useEffect(() => {
    if (gemsQuery.data !== undefined) setGems(gemsQuery.data);
  }, [gemsQuery.data]);

  useEffect(() => {
    if (specialSeedsQuery.data !== undefined) setSpecialSeeds(specialSeedsQuery.data);
  }, [specialSeedsQuery.data]);

  useEffect(() => {
    if (growthBoostersQuery.data !== undefined) setGrowthBoosters(growthBoostersQuery.data);
  }, [growthBoostersQuery.data]);

  useEffect(() => {
    if (autoNurtureQuery.data !== undefined) setAutoNurtureActive(autoNurtureQuery.data);
  }, [autoNurtureQuery.data]);

  useEffect(() => {
    if (purchasesQuery.data !== undefined) setTotalSpent(purchasesQuery.data);
  }, [purchasesQuery.data]);

  useEffect(() => {
    if (freeSeedsQuery.data) {
      setFreeSeedsClaimed(freeSeedsQuery.data.claimedToday);
    }
  }, [freeSeedsQuery.data]);

  useEffect(() => {
    if (comboQuery.data) {
      const now = Date.now();
      const timeSinceLastAction = now - comboQuery.data.lastActionTime;
      
      if (timeSinceLastAction > 5000) {
        setComboCount(0);
        setComboMultiplier(1);
      } else {
        setComboCount(comboQuery.data.count);
        setComboMultiplier(comboQuery.data.multiplier);
      }
    }
  }, [comboQuery.data]);

  useEffect(() => {
    if (gardenLevelQuery.data) {
      setGardenLevel(gardenLevelQuery.data.level);
      setGardenXP(gardenLevelQuery.data.xp);
      setMaxPlantSlots(gardenLevelQuery.data.maxPlantSlots);
    }
  }, [gardenLevelQuery.data]);

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

  const addGems = useCallback((amount: number) => {
    const newGems = gems + amount;
    setGems(newGems);
    saveGems(newGems);
  }, [gems, saveGems]);

  const spendGems = useCallback((amount: number) => {
    if (gems >= amount) {
      const newGems = gems - amount;
      setGems(newGems);
      saveGems(newGems);
      return true;
    }
    return false;
  }, [gems, saveGems]);

  const purchaseItem = useCallback((price: number) => {
    const newTotal = totalSpent + price;
    setTotalSpent(newTotal);
    savePurchases(newTotal);
  }, [totalSpent, savePurchases]);

  const purchaseGems = useCallback((amount: number, price: number) => {
    addGems(amount);
    purchaseItem(price);
  }, [addGems, purchaseItem]);

  const purchaseSpecialSeeds = useCallback((amount: number, price: number) => {
    const newSeeds = specialSeeds + amount;
    setSpecialSeeds(newSeeds);
    saveSpecialSeeds(newSeeds);
    purchaseItem(price);
  }, [specialSeeds, saveSpecialSeeds, purchaseItem]);

  const useSpecialSeed = useCallback(() => {
    if (specialSeeds > 0) {
      const newSeeds = specialSeeds - 1;
      setSpecialSeeds(newSeeds);
      saveSpecialSeeds(newSeeds);
      return true;
    }
    return false;
  }, [specialSeeds, saveSpecialSeeds]);

  const purchaseGrowthBooster = useCallback((amount: number, price: number) => {
    const newBoosters = growthBoosters + amount;
    setGrowthBoosters(newBoosters);
    saveGrowthBoosters(newBoosters);
    purchaseItem(price);
  }, [growthBoosters, saveGrowthBoosters, purchaseItem]);

  const useGrowthBooster = useCallback(() => {
    if (growthBoosters > 0) {
      const newBoosters = growthBoosters - 1;
      setGrowthBoosters(newBoosters);
      saveGrowthBoosters(newBoosters);
      return true;
    }
    return false;
  }, [growthBoosters, saveGrowthBoosters]);

  const purchaseAutoNurture = useCallback((price: number) => {
    setAutoNurtureActive(true);
    saveAutoNurture(true);
    purchaseItem(price);
  }, [saveAutoNurture, purchaseItem]);

  const buyWithGems = useCallback((gemCost: number, onSuccess: () => void) => {
    if (gems >= gemCost) {
      const newGems = gems - gemCost;
      setGems(newGems);
      saveGems(newGems);
      onSuccess();
      return true;
    }
    return false;
  }, [gems, saveGems]);

  const earnGems = useCallback((amount: number, reason: string) => {
    console.log(`Earned ${amount} gems: ${reason}`);
    const newGems = gems + amount;
    setGems(newGems);
    saveGems(newGems);
  }, [gems, saveGems]);

  const claimFreeSeeds = useCallback((amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newClaimed = freeSeedsClaimed + amount;
    const newSeeds = specialSeeds + amount;
    
    setFreeSeedsClaimed(newClaimed);
    setSpecialSeeds(newSeeds);
    
    saveFreeSeeds({ claimedToday: newClaimed, lastClaimDate: today });
    saveSpecialSeeds(newSeeds);
  }, [freeSeedsClaimed, specialSeeds, saveFreeSeeds, saveSpecialSeeds]);

  const getFreeSeedsRemaining = useCallback(() => {
    const maxFreeSeeds = isPremium ? 5 : 3;
    return Math.max(0, maxFreeSeeds - freeSeedsClaimed);
  }, [freeSeedsClaimed, isPremium]);

  const incrementCombo = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAction = now - (comboQuery.data?.lastActionTime || 0);
    
    let newCount = comboCount;
    let newMultiplier = comboMultiplier;
    
    if (timeSinceLastAction < 5000) {
      newCount = comboCount + 1;
      newMultiplier = Math.min(1 + Math.floor(newCount / 5) * 0.5, 3);
    } else {
      newCount = 1;
      newMultiplier = 1;
    }
    
    setComboCount(newCount);
    setComboMultiplier(newMultiplier);
    
    saveCombo({
      count: newCount,
      multiplier: newMultiplier,
      lastActionTime: now,
    });
    
    return newMultiplier;
  }, [comboCount, comboMultiplier, comboQuery.data, saveCombo]);

  const resetCombo = useCallback(() => {
    setComboCount(0);
    setComboMultiplier(1);
    saveCombo({ count: 0, multiplier: 1, lastActionTime: 0 });
  }, [saveCombo]);

  const addGardenXP = useCallback((amount: number) => {
    const xpNeeded = gardenLevel * 100;
    const newXP = gardenXP + amount;
    
    if (newXP >= xpNeeded) {
      const newLevel = gardenLevel + 1;
      const newSlots = 6 + newLevel;
      const remainingXP = newXP - xpNeeded;
      
      setGardenLevel(newLevel);
      setGardenXP(remainingXP);
      setMaxPlantSlots(newSlots);
      
      saveGardenLevel({
        level: newLevel,
        xp: remainingXP,
        maxPlantSlots: newSlots,
      });
      
      earnGems(10 * newLevel, `Reached Garden Level ${newLevel}`);
      return true;
    } else {
      setGardenXP(newXP);
      saveGardenLevel({
        level: gardenLevel,
        xp: newXP,
        maxPlantSlots,
      });
      return false;
    }
  }, [gardenLevel, gardenXP, maxPlantSlots, saveGardenLevel, earnGems]);

  return {
    isPremium,
    energyBoosts,
    energy,
    maxEnergy,
    streak,
    gems,
    specialSeeds,
    growthBoosters,
    autoNurtureActive,
    totalSpent,
    freeSeedsClaimed,
    comboCount,
    comboMultiplier,
    gardenLevel,
    gardenXP,
    maxPlantSlots,
    isLoading: premiumQuery.isLoading || boostsQuery.isLoading || energyQuery.isLoading,
    upgradeToPremium,
    purchaseEnergyBoost,
    consumeEnergyBoost,
    consumeEnergy,
    refillEnergy,
    addGems,
    spendGems,
    purchaseItem,
    purchaseGems,
    purchaseSpecialSeeds,
    useSpecialSeed,
    purchaseGrowthBooster,
    useGrowthBooster,
    purchaseAutoNurture,
    claimFreeSeeds,
    getFreeSeedsRemaining,
    buyWithGems,
    earnGems,
    incrementCombo,
    resetCombo,
    addGardenXP,
  };
});
