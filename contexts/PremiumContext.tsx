import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { getEasternDateString, getEasternTime } from '@/utils/dateUtils';
import { purchasePackage, restorePurchases as rcRestorePurchases, getCustomerInfo } from '@/utils/revenuecat';

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
const COMEBACK_BONUS_KEY = 'comeback_bonus';
const MILESTONES_KEY = 'milestones';

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

interface ComebackBonus {
  lastLogin: string;
  consecutiveDays: number;
  bonusClaimed: boolean;
}

interface Milestone {
  id: string;
  type: 'blooms' | 'level' | 'streak' | 'gems' | 'nurtures';
  target: number;
  reward: { gems?: number; energy?: number; seeds?: number };
  claimed: boolean;
  progress: number;
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
  const [hasComebackBonus, setHasComebackBonus] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const premiumQuery = useQuery({
    queryKey: ['premium'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
        const data: PremiumState = stored ? JSON.parse(stored) : { isPremium: false, expiresAt: null };
        
        if (data.isPremium && data.expiresAt && data.expiresAt < Date.now()) {
          return { isPremium: false, expiresAt: null };
        }
        
        return data;
      } catch (error) {
        console.error('[Premium] Error loading premium status:', error);
        return { isPremium: false, expiresAt: null };
      }
    },
    initialData: { isPremium: false, expiresAt: null },
    staleTime: Infinity,
  });

  const boostsQuery = useQuery({
    queryKey: ['energyBoosts'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(ENERGY_BOOSTS_KEY);
        return stored ? parseInt(stored) : 0;
      } catch (error) {
        console.error('[Premium] Error loading energy boosts:', error);
        return 0;
      }
    },
    initialData: 0,
    staleTime: Infinity,
  });

  const energyQuery = useQuery({
    queryKey: ['dailyEnergy'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(ENERGY_STORAGE_KEY);
        const today = getEasternDateString();
        
        if (!stored) {
          return {
            energy: 15,
            maxEnergy: 15,
            lastRefreshDate: today,
            streak: 1,
            lastPlayDate: today,
          };
        }
        
        const data: EnergyState = JSON.parse(stored);
        
        if (data.lastRefreshDate !== today) {
          const yesterday = getEasternTime();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          const newStreak = data.lastPlayDate === yesterdayStr ? data.streak + 1 : 1;
          
          return {
            energy: Math.max(data.energy, data.maxEnergy),
            maxEnergy: data.maxEnergy,
            lastRefreshDate: today,
            streak: newStreak,
            lastPlayDate: today,
          };
        }
        
        return data;
      } catch (error) {
        console.error('[Premium] Error loading energy:', error);
        return {
          energy: 15,
          maxEnergy: 15,
          lastRefreshDate: getEasternDateString(),
          streak: 1,
          lastPlayDate: getEasternDateString(),
        };
      }
    },
    initialData: {
      energy: 15,
      maxEnergy: 15,
      lastRefreshDate: '',
      streak: 1,
      lastPlayDate: '',
    },
  });

  const gemsQuery = useQuery({
    queryKey: ['gems'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(GEMS_STORAGE_KEY);
      return stored ? parseInt(stored) : 0;
    },
    initialData: 0,
  });

  const specialSeedsQuery = useQuery({
    queryKey: ['specialSeeds'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SPECIAL_SEEDS_KEY);
      return stored ? parseInt(stored) : 0;
    },
    initialData: 0,
  });

  const growthBoostersQuery = useQuery({
    queryKey: ['growthBoosters'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(GROWTH_BOOSTERS_KEY);
      return stored ? parseInt(stored) : 0;
    },
    initialData: 0,
  });

  const autoNurtureQuery = useQuery({
    queryKey: ['autoNurture'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(AUTO_NURTURE_KEY);
      return stored === 'true';
    },
    initialData: false,
  });

  const purchasesQuery = useQuery({
    queryKey: ['totalPurchases'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PURCHASES_KEY);
      return stored ? parseFloat(stored) : 0;
    },
    initialData: 0,
  });

  const freeSeedsQuery = useQuery({
    queryKey: ['freeSeeds'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FREE_SEEDS_KEY);
      const today = getEasternDateString();
      
      if (!stored) {
        return { claimedToday: 0, lastClaimDate: today };
      }
      
      const data: FreeSeedsState = JSON.parse(stored);
      
      if (data.lastClaimDate !== today) {
        return { claimedToday: 0, lastClaimDate: today };
      }
      
      return data;
    },
    initialData: { claimedToday: 0, lastClaimDate: '' },
  });

  const comboQuery = useQuery({
    queryKey: ['combo'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(COMBO_KEY);
      return stored ? JSON.parse(stored) : { count: 0, multiplier: 1, lastActionTime: 0 };
    },
    initialData: { count: 0, multiplier: 1, lastActionTime: 0 },
  });

  const gardenLevelQuery = useQuery({
    queryKey: ['gardenLevel'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(GARDEN_LEVEL_KEY);
      return stored ? JSON.parse(stored) : { level: 1, xp: 0, maxPlantSlots: 6 };
    },
    initialData: { level: 1, xp: 0, maxPlantSlots: 6 },
  });

  const comebackQuery = useQuery({
    queryKey: ['comeback'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(COMEBACK_BONUS_KEY);
      const today = getEasternDateString();
      
      if (!stored) {
        return { lastLogin: today, consecutiveDays: 1, bonusClaimed: false };
      }
      
      const data: ComebackBonus = JSON.parse(stored);
      const daysDiff = Math.floor((new Date(today).getTime() - new Date(data.lastLogin).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 3 && data.lastLogin !== today) {
        return { lastLogin: today, consecutiveDays: daysDiff, bonusClaimed: false };
      }
      
      if (data.lastLogin !== today) {
        return { ...data, lastLogin: today, bonusClaimed: false };
      }
      
      return data;
    },
    initialData: { lastLogin: '', consecutiveDays: 1, bonusClaimed: false },
  });

  const milestonesQuery = useQuery({
    queryKey: ['milestones'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(MILESTONES_KEY);
      if (!stored) {
        return [
          { id: 'blooms_10', type: 'blooms', target: 10, reward: { gems: 100, seeds: 2 }, claimed: false, progress: 0 },
          { id: 'blooms_50', type: 'blooms', target: 50, reward: { gems: 500, seeds: 5 }, claimed: false, progress: 0 },
          { id: 'blooms_100', type: 'blooms', target: 100, reward: { gems: 1000, seeds: 10 }, claimed: false, progress: 0 },
          { id: 'level_10', type: 'level', target: 10, reward: { gems: 200, energy: 10 }, claimed: false, progress: 0 },
          { id: 'level_25', type: 'level', target: 25, reward: { gems: 750, energy: 25 }, claimed: false, progress: 0 },
          { id: 'streak_30', type: 'streak', target: 30, reward: { gems: 500, seeds: 3 }, claimed: false, progress: 0 },
          { id: 'streak_100', type: 'streak', target: 100, reward: { gems: 2000, seeds: 15 }, claimed: false, progress: 0 },
        ] as Milestone[];
      }
      return JSON.parse(stored);
    },
    initialData: [],
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

  const { mutate: saveComeback } = useMutation({
    mutationFn: async (data: ComebackBonus) => {
      await AsyncStorage.setItem(COMEBACK_BONUS_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveMilestones } = useMutation({
    mutationFn: async (data: Milestone[]) => {
      await AsyncStorage.setItem(MILESTONES_KEY, JSON.stringify(data));
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
    if (energyQuery.data && premiumQuery.data !== undefined) {
      const isPremiumUser = premiumQuery.data?.isPremium || false;
      const baseMax = isPremiumUser ? 25 : 15;
      
      setEnergy(energyQuery.data.energy);
      setMaxEnergy(baseMax);
      setStreak(energyQuery.data.streak);
      
      if (energyQuery.data.maxEnergy !== baseMax) {
        const today = getEasternDateString();
        const adjustedEnergy = Math.min(energyQuery.data.energy, baseMax);
        saveEnergy({
          energy: adjustedEnergy,
          maxEnergy: baseMax,
          lastRefreshDate: today,
          streak: energyQuery.data.streak,
          lastPlayDate: energyQuery.data.lastPlayDate,
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

  useEffect(() => {
    if (comebackQuery.data) {
      setHasComebackBonus(comebackQuery.data.consecutiveDays >= 3 && !comebackQuery.data.bonusClaimed);
    }
  }, [comebackQuery.data]);

  useEffect(() => {
    if (milestonesQuery.data) {
      setMilestones(milestonesQuery.data);
    }
  }, [milestonesQuery.data]);

  const upgradeToPremium = useCallback(async (packageToPurchase: any) => {
    try {
      const customerInfo = await purchasePackage(packageToPurchase);
      
      if (customerInfo.entitlements.active['premium']) {
        const entitlement = customerInfo.entitlements.active['premium'];
        const expiresAt = entitlement.expirationDate ? new Date(entitlement.expirationDate).getTime() : null;
        
        const data: PremiumState = { isPremium: true, expiresAt };
        setIsPremium(true);
        savePremium(data);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Purchase failed:', error);
      if (!error.userCancelled) {
        throw error;
      }
      return false;
    }
  }, [savePremium]);

  const restorePurchases = useCallback(async () => {
    try {
      const customerInfo = await rcRestorePurchases();
      
      if (customerInfo.entitlements.active['premium']) {
        const entitlement = customerInfo.entitlements.active['premium'];
        const expiresAt = entitlement.expirationDate ? new Date(entitlement.expirationDate).getTime() : null;
        
        const data: PremiumState = { isPremium: true, expiresAt };
        setIsPremium(true);
        savePremium(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }, [savePremium]);

  const checkPremiumStatus = useCallback(async () => {
    try {
      const customerInfo = await getCustomerInfo();
      if (customerInfo && customerInfo.entitlements.active['premium']) {
        const entitlement = customerInfo.entitlements.active['premium'];
        const expiresAt = entitlement.expirationDate ? new Date(entitlement.expirationDate).getTime() : null;
        
        const data: PremiumState = { isPremium: true, expiresAt };
        setIsPremium(true);
        savePremium(data);
      }
    } catch (error) {
      console.error('Failed to check premium status:', error);
    }
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
      const today = getEasternDateString();
      
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
    const newEnergy = energy + maxEnergy;
    setEnergy(newEnergy);
    saveEnergy({
      energy: newEnergy,
      maxEnergy,
      lastRefreshDate: today,
      streak,
      lastPlayDate: today,
    });
  }, [energy, maxEnergy, streak, saveEnergy]);

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
    let newCount: number;
    let newMultiplier: number;
    
    setComboCount(prev => {
      const timeSinceLastAction = now - (comboQuery.data?.lastActionTime || 0);
      
      if (timeSinceLastAction < 5000) {
        newCount = prev + 1;
        newMultiplier = Math.min(1 + Math.floor(newCount / 3) * 0.5, 4);
        
        if (newCount % 10 === 0) {
          earnGems(Math.floor(newCount / 2), `${newCount}x Combo Bonus!`);
        }
      } else {
        newCount = 1;
        newMultiplier = 1;
      }
      
      setComboMultiplier(newMultiplier);
      
      saveCombo({
        count: newCount,
        multiplier: newMultiplier,
        lastActionTime: now,
      });
      
      return newCount;
    });
    
    return newMultiplier!;
  }, [comboQuery.data, earnGems, saveCombo]);

  const resetCombo = useCallback(() => {
    setComboCount(0);
    setComboMultiplier(1);
    saveCombo({ count: 0, multiplier: 1, lastActionTime: 0 });
  }, [saveCombo]);

  const updateMilestoneProgress = useCallback((type: Milestone['type'], value: number) => {
    setMilestones(prev => {
      const updated = prev.map(m => {
        if (m.type === type && !m.claimed) {
          return { ...m, progress: value };
        }
        return m;
      });
      saveMilestones(updated);
      return updated;
    });
  }, [saveMilestones]);

  const getXPNeeded = useCallback((level: number) => {
    return Math.floor(100 * Math.pow(1.15, level - 1));
  }, []);

  const addGardenXP = useCallback((amount: number) => {
    setGardenXP(prev => {
      const xpNeeded = getXPNeeded(gardenLevel);
      const newXP = prev + amount;
      
      if (newXP >= xpNeeded) {
        const newLevel = gardenLevel + 1;
        const newSlots = 6 + newLevel;
        const remainingXP = newXP - xpNeeded;
        
        setGardenLevel(newLevel);
        setMaxPlantSlots(newSlots);
        
        saveGardenLevel({
          level: newLevel,
          xp: remainingXP,
          maxPlantSlots: newSlots,
        });
        
        const gemReward = Math.floor(25 + (newLevel * 15));
        earnGems(gemReward, `🎉 Level ${newLevel} Reached!`);
        
        setEnergy(prevEnergy => {
          const today = getEasternDateString();
          const energyBonus = Math.min(3 + Math.floor(newLevel / 3), 10);
          const bonusEnergy = prevEnergy + energyBonus;
          saveEnergy({
            energy: bonusEnergy,
            maxEnergy,
            lastRefreshDate: today,
            streak,
            lastPlayDate: today,
          });
          return bonusEnergy;
        });
        
        updateMilestoneProgress('level', newLevel);
        
        console.log(`🎊 Level Up! Level ${newLevel} | Gems: +${gemReward} | Energy: +${Math.min(3 + Math.floor(newLevel / 3), 10)} | Slots: ${newSlots}`);
        
        return remainingXP;
      } else {
        saveGardenLevel({
          level: gardenLevel,
          xp: newXP,
          maxPlantSlots,
        });
        return newXP;
      }
    });
  }, [gardenLevel, maxPlantSlots, earnGems, maxEnergy, streak, saveEnergy, saveGardenLevel, updateMilestoneProgress, getXPNeeded]);

  const claimComebackBonus = useCallback(() => {
    if (!comebackQuery.data || comebackQuery.data.bonusClaimed) return;
    
    const days = comebackQuery.data.consecutiveDays;
    const bonusEnergy = Math.min(5 + days, 15);
    const bonusGems = days * 10;
    const bonusSeeds = Math.floor(days / 3);
    
    setEnergy(prev => {
      const today = getEasternDateString();
      const newEnergy = prev + bonusEnergy;
      saveEnergy({
        energy: newEnergy,
        maxEnergy,
        lastRefreshDate: today,
        streak,
        lastPlayDate: today,
      });
      return newEnergy;
    });
    
    earnGems(bonusGems, `Welcome back! ${days} day bonus`);
    
    if (bonusSeeds > 0) {
      setSpecialSeeds(prev => {
        const newSeeds = prev + bonusSeeds;
        saveSpecialSeeds(newSeeds);
        return newSeeds;
      });
    }
    
    saveComeback({
      ...comebackQuery.data,
      bonusClaimed: true,
    });
    
    setHasComebackBonus(false);
    
    return { energy: bonusEnergy, gems: bonusGems, seeds: bonusSeeds };
  }, [comebackQuery.data, maxEnergy, streak, earnGems, saveEnergy, saveComeback, saveSpecialSeeds]);

  const claimMilestone = useCallback((milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone || milestone.claimed || milestone.progress < milestone.target) return false;
    
    if (milestone.reward.gems) {
      earnGems(milestone.reward.gems, `Milestone: ${milestoneId}`);
    }
    
    if (milestone.reward.energy) {
      setEnergy(prev => {
        const today = getEasternDateString();
        const newEnergy = prev + milestone.reward.energy!;
        saveEnergy({
          energy: newEnergy,
          maxEnergy,
          lastRefreshDate: today,
          streak,
          lastPlayDate: today,
        });
        return newEnergy;
      });
    }
    
    if (milestone.reward.seeds) {
      setSpecialSeeds(prev => {
        const newSeeds = prev + milestone.reward.seeds!;
        saveSpecialSeeds(newSeeds);
        return newSeeds;
      });
    }
    
    setMilestones(prev => {
      const updated = prev.map(m => 
        m.id === milestoneId ? { ...m, claimed: true } : m
      );
      saveMilestones(updated);
      return updated;
    });
    
    return true;
  }, [milestones, earnGems, maxEnergy, streak, saveEnergy, saveSpecialSeeds, saveMilestones]);

  const getUnclaimedMilestones = useCallback(() => {
    return milestones.filter(m => !m.claimed && m.progress >= m.target);
  }, [milestones]);

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
    hasComebackBonus,
    milestones,
    getXPNeeded,
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
    claimComebackBonus,
    updateMilestoneProgress,
    claimMilestone,
    getUnclaimedMilestones,
    restorePurchases,
    checkPremiumStatus,
  };
});
