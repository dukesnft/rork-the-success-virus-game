import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { SharedManifestation, SeedRarity } from '@/types/community';
import { Alert } from 'react-native';
import { usePremium } from '@/contexts/PremiumContext';

const STORAGE_KEY_SHARED = 'shared_manifestations';
const STORAGE_KEY_USER_SHARED = 'user_shared_manifestations';
const STORAGE_KEY_LIKED = 'liked_manifestations';
const STORAGE_KEY_USERNAME = 'user_username';

const getRandomRarity = (): SeedRarity => {
  const rand = Math.random();
  if (rand < 0.5) return 'common';
  if (rand < 0.8) return 'rare';
  if (rand < 0.95) return 'epic';
  return 'legendary';
};

const generateMockSharedManifestations = (): SharedManifestation[] => {
  const names = [
    'CosmicDreamer', 'LunarLight', 'StellarSoul', 'MysticVibes', 'ZenMaster',
    'AuraGlow', 'ChakraWarrior', 'SpiritSeeker', 'ManifestKing', 'IntentionQueen',
    'CrystalHeart', 'MindfulOne', 'SacredPath', 'DivinePurpose', 'EnlightenedBeing'
  ];

  const intentions = {
    abundance: [
      'Financial freedom flows to me effortlessly',
      'I attract wealth and prosperity',
      'Abundance surrounds me daily',
      'Money comes to me in expected and unexpected ways'
    ],
    love: [
      'I am worthy of deep, meaningful love',
      'My relationships are filled with joy and harmony',
      'Love flows freely in my life',
      'I attract loving and supportive people'
    ],
    health: [
      'My body is strong, healthy, and vibrant',
      'I radiate energy and vitality',
      'Every cell in my body is healing',
      'I honor my body with healthy choices'
    ],
    success: [
      'I achieve my goals with ease',
      'Success is my natural state',
      'I am confident and capable',
      'Opportunities come to me effortlessly'
    ],
    peace: [
      'I am calm and centered in every moment',
      'Peace flows through my mind and body',
      'I release all worry and embrace tranquility',
      'Inner peace is my foundation'
    ]
  };

  const colors = {
    abundance: ['#FFD700', '#F4C430', '#FFDF00', '#FFC000'],
    love: ['#FF69B4', '#FF1493', '#FF6FBF', '#FF85C1'],
    health: ['#00FF7F', '#32CD32', '#7FFF00', '#90EE90'],
    success: ['#FF6347', '#FF4500', '#FF7F50', '#FFA07A'],
    peace: ['#87CEEB', '#4682B4', '#6495ED', '#5F9EA0']
  };

  const categories: ('abundance' | 'love' | 'health' | 'success' | 'peace')[] = 
    ['abundance', 'love', 'health', 'success', 'peace'];

  const shared: SharedManifestation[] = [];

  for (let i = 0; i < 30; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const categoryIntentions = intentions[category];
    const categoryColors = colors[category];
    
    shared.push({
      id: `shared_${i}`,
      username: names[Math.floor(Math.random() * names.length)],
      intention: categoryIntentions[Math.floor(Math.random() * categoryIntentions.length)],
      category,
      color: categoryColors[Math.floor(Math.random() * categoryColors.length)],
      likes: Math.floor(Math.random() * 200) + 5,
      sharedAt: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      likedByUser: false,
      rarity: getRandomRarity(),
      level: Math.floor(Math.random() * 30) + 1,
    });
  }

  shared.sort((a, b) => b.likes - a.likes);

  return shared;
};

export const [CommunityProvider, useCommunity] = createContextHook(() => {
  const { gardenLevel } = usePremium();
  const [sharedManifestations, setSharedManifestations] = useState<SharedManifestation[]>([]);
  const [userSharedManifestations, setUserSharedManifestations] = useState<SharedManifestation[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [username, setUsername] = useState<string>('Dreamer');

  const sharedQuery = useQuery({
    queryKey: ['sharedManifestations'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_SHARED);
      if (stored) {
        return JSON.parse(stored);
      }
      const mock = generateMockSharedManifestations();
      return mock;
    }
  });

  const userSharedQuery = useQuery({
    queryKey: ['userSharedManifestations'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_USER_SHARED);
      return stored ? JSON.parse(stored) : [];
    }
  });

  const likedQuery = useQuery({
    queryKey: ['likedManifestations'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_LIKED);
      return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    }
  });

  const usernameQuery = useQuery({
    queryKey: ['username'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_USERNAME);
      return stored || 'Dreamer';
    }
  });

  const { mutate: saveSharedMutate } = useMutation({
    mutationFn: async (data: SharedManifestation[]) => {
      await AsyncStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveUserSharedMutate } = useMutation({
    mutationFn: async (data: SharedManifestation[]) => {
      await AsyncStorage.setItem(STORAGE_KEY_USER_SHARED, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveLikedMutate } = useMutation({
    mutationFn: async (data: Set<string>) => {
      await AsyncStorage.setItem(STORAGE_KEY_LIKED, JSON.stringify(Array.from(data)));
      return data;
    }
  });

  const { mutate: saveUsernameMutate } = useMutation({
    mutationFn: async (name: string) => {
      await AsyncStorage.setItem(STORAGE_KEY_USERNAME, name);
      return name;
    }
  });

  useEffect(() => {
    if (sharedQuery.data) {
      setSharedManifestations(sharedQuery.data);
    }
  }, [sharedQuery.data]);

  useEffect(() => {
    if (userSharedQuery.data) {
      setUserSharedManifestations(userSharedQuery.data);
    }
  }, [userSharedQuery.data]);

  useEffect(() => {
    if (likedQuery.data) {
      setLikedIds(likedQuery.data);
    }
  }, [likedQuery.data]);

  useEffect(() => {
    if (usernameQuery.data) {
      setUsername(usernameQuery.data);
    }
  }, [usernameQuery.data]);

  const shareManifestation = useCallback((
    intention: string,
    category: 'abundance' | 'love' | 'health' | 'success' | 'peace',
    color: string,
    rarity: SeedRarity
  ) => {
    const newShared: SharedManifestation = {
      id: `user_${Date.now()}`,
      username,
      intention,
      category,
      color,
      likes: 0,
      sharedAt: Date.now(),
      likedByUser: false,
      rarity,
      level: gardenLevel,
    };

    const updatedShared = [newShared, ...sharedManifestations];
    setSharedManifestations(updatedShared);
    saveSharedMutate(updatedShared);

    const updatedUserShared = [newShared, ...userSharedManifestations];
    setUserSharedManifestations(updatedUserShared);
    saveUserSharedMutate(updatedUserShared);

    Alert.alert('✨ Shared!', 'Your manifestation has been shared with the community!');
  }, [username, gardenLevel, sharedManifestations, userSharedManifestations, saveSharedMutate, saveUserSharedMutate]);

  const updateUsername = useCallback((newName: string) => {
    setUsername(newName);
    saveUsernameMutate(newName);
  }, [saveUsernameMutate]);

  const toggleLike = useCallback((id: string) => {
    const updatedShared = sharedManifestations.map(m => {
      if (m.id === id) {
        const isLiked = likedIds.has(id);
        return {
          ...m,
          likes: isLiked ? m.likes - 1 : m.likes + 1,
          likedByUser: !isLiked,
        };
      }
      return m;
    });

    setSharedManifestations(updatedShared);
    saveSharedMutate(updatedShared);

    const newLikedIds = new Set(likedIds);
    if (newLikedIds.has(id)) {
      newLikedIds.delete(id);
    } else {
      newLikedIds.add(id);
    }
    setLikedIds(newLikedIds);
    saveLikedMutate(newLikedIds);
  }, [sharedManifestations, likedIds, saveSharedMutate, saveLikedMutate]);

  const getSharedManifestationsWithLikes = useCallback(() => {
    return sharedManifestations.map(m => ({
      ...m,
      likedByUser: likedIds.has(m.id),
    }));
  }, [sharedManifestations, likedIds]);

  return {
    sharedManifestations: getSharedManifestationsWithLikes(),
    userSharedManifestations,
    username,
    isLoading: sharedQuery.isLoading,
    shareManifestation,
    toggleLike,
    updateUsername,
  };
});
