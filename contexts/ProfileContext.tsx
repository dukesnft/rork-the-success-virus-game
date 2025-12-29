import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { TopManifestation } from '@/types/profile';

const STORAGE_KEY_TOP_MANIFESTATIONS = 'top_manifestations';

export const [ProfileProvider, useProfile] = createContextHook(() => {
  const [topManifestations, setTopManifestations] = useState<TopManifestation[]>([]);

  const topManifestationsQuery = useQuery({
    queryKey: ['topManifestations'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_TOP_MANIFESTATIONS);
      return stored ? JSON.parse(stored) : [];
    }
  });

  const { mutate: saveTopManifestations } = useMutation({
    mutationFn: async (data: TopManifestation[]) => {
      await AsyncStorage.setItem(STORAGE_KEY_TOP_MANIFESTATIONS, JSON.stringify(data));
      return data;
    }
  });

  useEffect(() => {
    if (topManifestationsQuery.data) {
      setTopManifestations(topManifestationsQuery.data);
    }
  }, [topManifestationsQuery.data]);

  const updateTopManifestations = useCallback((manifestations: TopManifestation[]) => {
    const limited = manifestations.slice(0, 3);
    setTopManifestations(limited);
    saveTopManifestations(limited);
  }, [saveTopManifestations]);

  const addToTopManifestations = useCallback((manifestation: TopManifestation) => {
    setTopManifestations(prev => {
      const exists = prev.find(m => m.id === manifestation.id);
      if (exists) return prev;
      
      const updated = [...prev, manifestation].slice(0, 3);
      saveTopManifestations(updated);
      return updated;
    });
  }, [saveTopManifestations]);

  const removeFromTopManifestations = useCallback((id: string) => {
    setTopManifestations(prev => {
      const updated = prev.filter(m => m.id !== id);
      saveTopManifestations(updated);
      return updated;
    });
  }, [saveTopManifestations]);

  return {
    topManifestations,
    isLoading: topManifestationsQuery.isLoading,
    updateTopManifestations,
    addToTopManifestations,
    removeFromTopManifestations,
  };
});
