import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { Manifestation, GrowthStage } from '@/types/manifestation';
import { ENERGY_PER_STAGE } from '@/constants/manifestation';
import { usePremium } from '@/contexts/PremiumContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useInventory } from '@/contexts/InventoryContext';
import { Dimensions } from 'react-native';

const STORAGE_KEY = 'manifestations';

const { width, height } = Dimensions.get('window');
const GARDEN_WIDTH = width - 48;
const GARDEN_HEIGHT = height - 350;
const PLANT_SIZE = 120;
const MIN_DISTANCE = 130;

const getStageFromEnergy = (energy: number): GrowthStage => {
  if (energy >= ENERGY_PER_STAGE.blooming) return 'blooming';
  if (energy >= ENERGY_PER_STAGE.growing) return 'growing';
  if (energy >= ENERGY_PER_STAGE.sprout) return 'sprout';
  return 'seed';
};

const generateSmartPosition = (existingManifestations: Manifestation[]): { x: number; y: number } => {
  const maxAttempts = 50;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = Math.random() * (GARDEN_WIDTH - PLANT_SIZE) + 24;
    const y = Math.random() * (GARDEN_HEIGHT - PLANT_SIZE) + 80;
    
    const hasCollision = existingManifestations.some(m => {
      const dx = m.position.x - x;
      const dy = m.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < MIN_DISTANCE;
    });
    
    if (!hasCollision) {
      return { x, y };
    }
  }
  
  const spiralIndex = existingManifestations.length;
  const angle = spiralIndex * 0.5;
  const radius = 60 + spiralIndex * 20;
  const centerX = GARDEN_WIDTH / 2;
  const centerY = GARDEN_HEIGHT / 2 + 40;
  
  return {
    x: Math.min(Math.max(centerX + Math.cos(angle) * radius, 24), GARDEN_WIDTH - PLANT_SIZE + 24),
    y: Math.min(Math.max(centerY + Math.sin(angle) * radius, 80), GARDEN_HEIGHT - PLANT_SIZE + 80),
  };
};

export const [ManifestationProvider, useManifestations] = createContextHook(() => {
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);
  const { isPremium } = usePremium();
  const { scheduleManifestationNotification, cancelManifestationNotification } = useNotifications();
  const { addToInventory } = useInventory();

  const manifestationsQuery = useQuery({
    queryKey: ['manifestations'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Manifestation[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveMutate } = saveMutation;

  useEffect(() => {
    if (manifestationsQuery.data) {
      setManifestations(manifestationsQuery.data);
    }
  }, [manifestationsQuery.data]);

  const addManifestation = useCallback((manifestation: Omit<Manifestation, 'id' | 'stage' | 'energy' | 'maxEnergy' | 'createdAt' | 'lastNurtured'>) => {
    const position = generateSmartPosition(manifestations);
    
    const newManifestation: Manifestation = {
      ...manifestation,
      id: Date.now().toString(),
      stage: 'seed',
      energy: 0,
      maxEnergy: 100,
      createdAt: Date.now(),
      lastNurtured: Date.now(),
      position,
    };
    
    const updated = [...manifestations, newManifestation];
    setManifestations(updated);
    saveMutate(updated);
    
    scheduleManifestationNotification(
      newManifestation.id,
      newManifestation.intention,
      newManifestation.category
    );
  }, [manifestations, saveMutate, scheduleManifestationNotification]);

  const nurtureManifestation = useCallback((id: string) => {
    const energyGain = isPremium ? 15 : 10;
    const updated = manifestations.map(m => {
      if (m.id === id) {
        const newEnergy = Math.min(m.energy + energyGain, m.maxEnergy);
        return {
          ...m,
          energy: newEnergy,
          stage: getStageFromEnergy(newEnergy),
          lastNurtured: Date.now(),
        };
      }
      return m;
    });
    
    setManifestations(updated);
    saveMutate(updated);
  }, [manifestations, saveMutate, isPremium]);

  const deleteManifestation = useCallback((id: string) => {
    const updated = manifestations.filter(m => m.id !== id);
    setManifestations(updated);
    saveMutate(updated);
    cancelManifestationNotification(id);
  }, [manifestations, saveMutate, cancelManifestationNotification]);

  const harvestManifestation = useCallback((id: string) => {
    const manifestation = manifestations.find(m => m.id === id);
    
    if (!manifestation) return;
    
    if (manifestation.stage === 'sprout' || manifestation.stage === 'growing' || manifestation.stage === 'blooming') {
      addToInventory({
        intention: manifestation.intention,
        category: manifestation.category,
        stage: manifestation.stage,
        color: manifestation.color,
      });
    }
    
    const updated = manifestations.filter(m => m.id !== id);
    setManifestations(updated);
    saveMutate(updated);
    cancelManifestationNotification(id);
  }, [manifestations, saveMutate, cancelManifestationNotification, addToInventory]);

  return {
    manifestations,
    isLoading: manifestationsQuery.isLoading,
    addManifestation,
    nurtureManifestation,
    deleteManifestation,
    harvestManifestation,
  };
});
