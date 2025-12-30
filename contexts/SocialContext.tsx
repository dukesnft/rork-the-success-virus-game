import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { Friend, FriendRequest, Gift, Guild, WeeklyChallenge, GlobalEvent } from '@/types/social';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getEasternTime } from '@/utils/dateUtils';

const FRIENDS_KEY = 'friends';
const FRIEND_REQUESTS_KEY = 'friend_requests';
const GIFTS_KEY = 'gifts';
const GUILD_KEY = 'user_guild';
const CHALLENGES_KEY = 'weekly_challenges';
const EVENTS_KEY = 'global_events';

const generateMockFriends = (): Friend[] => {
  const names = [
    'CosmicDreamer', 'LunarLight', 'StellarSoul', 'MysticVibes', 'ZenMaster',
  ];

  const generateRandomLevel = (index: number) => {
    if (index === 0) return 45 + Math.floor(Math.random() * 10);
    if (index === 1) return 38 + Math.floor(Math.random() * 7);
    if (index === 2) return 30 + Math.floor(Math.random() * 8);
    return 10 + Math.floor(Math.random() * 30);
  };

  return names.map((name, i) => ({
    id: `friend_${i}`,
    username: name,
    level: generateRandomLevel(i),
    totalBloomed: 20 + Math.floor(Math.random() * 100),
    currentStreak: 5 + Math.floor(Math.random() * 50),
    addedAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
    lastActive: Date.now() - Math.floor(Math.random() * 3 * 60 * 60 * 1000),
  }));
};

const generateWeeklyChallenges = (): WeeklyChallenge[] => {
  const nextWeek = getEasternTime();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const expiresAt = nextWeek.getTime();

  return [
    {
      id: 'weekly_nurture',
      title: 'Nurture Master',
      description: 'Nurture plants 50 times this week',
      type: 'nurture',
      target: 50,
      progress: 0,
      reward: { gems: 200, energy: 15 },
      expiresAt,
      completed: false,
    },
    {
      id: 'weekly_harvest',
      title: 'Harvest Festival',
      description: 'Harvest 10 blooming plants',
      type: 'harvest',
      target: 10,
      progress: 0,
      reward: { gems: 300, seeds: 3, rarity: 'rare' },
      expiresAt,
      completed: false,
    },
    {
      id: 'weekly_legendary',
      title: 'Legendary Hunter',
      description: 'Bloom 1 legendary manifestation',
      type: 'bloom_legendary',
      target: 1,
      progress: 0,
      reward: { gems: 1000, seeds: 1, rarity: 'legendary' },
      expiresAt,
      completed: false,
    },
  ];
};

const generateGlobalEvent = (): GlobalEvent => {
  const now = Date.now();
  const endsAt = now + 7 * 24 * 60 * 60 * 1000;

  return {
    id: 'event_community_bloom',
    title: '🌸 Global Bloom Festival',
    description: 'Unite with manifestors worldwide! Help the community bloom 1,000,000 plants!',
    type: 'community_bloom',
    globalProgress: 347856,
    globalTarget: 1000000,
    userContribution: 0,
    rewards: {
      tier1: { gems: 100, seeds: 1 },
      tier2: { gems: 500, seeds: 3 },
      tier3: { gems: 2000, seeds: 10 },
    },
    startedAt: now,
    endsAt,
    active: true,
  };
};

export const [SocialProvider, useSocial] = createContextHook(() => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [globalEvent, setGlobalEvent] = useState<GlobalEvent | null>(null);

  const friendsQuery = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FRIENDS_KEY);
      if (stored) return JSON.parse(stored);
      return generateMockFriends();
    }
  });

  const friendRequestsQuery = useQuery({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FRIEND_REQUESTS_KEY);
      return stored ? JSON.parse(stored) : [];
    }
  });

  const giftsQuery = useQuery({
    queryKey: ['gifts'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(GIFTS_KEY);
      return stored ? JSON.parse(stored) : [];
    }
  });

  const guildQuery = useQuery({
    queryKey: ['guild'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(GUILD_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  });

  const challengesQuery = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CHALLENGES_KEY);
      if (stored) {
        const data: WeeklyChallenge[] = JSON.parse(stored);
        const now = Date.now();
        if (data.length === 0 || data[0].expiresAt < now) {
          return generateWeeklyChallenges();
        }
        return data;
      }
      return generateWeeklyChallenges();
    }
  });

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(EVENTS_KEY);
      if (stored) return JSON.parse(stored);
      return generateGlobalEvent();
    }
  });

  const { mutate: saveFriendsMutate } = useMutation({
    mutationFn: async (data: Friend[]) => {
      await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveFriendRequests } = useMutation({
    mutationFn: async (data: FriendRequest[]) => {
      await AsyncStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveGifts } = useMutation({
    mutationFn: async (data: Gift[]) => {
      await AsyncStorage.setItem(GIFTS_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveGuildMutate } = useMutation({
    mutationFn: async (data: Guild | null) => {
      if (data) {
        await AsyncStorage.setItem(GUILD_KEY, JSON.stringify(data));
      } else {
        await AsyncStorage.removeItem(GUILD_KEY);
      }
      return data;
    }
  });

  const { mutate: saveChallenges } = useMutation({
    mutationFn: async (data: WeeklyChallenge[]) => {
      await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveEvents } = useMutation({
    mutationFn: async (data: GlobalEvent) => {
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(data));
      return data;
    }
  });

  useEffect(() => {
    if (friendsQuery.data) setFriends(friendsQuery.data);
  }, [friendsQuery.data]);

  useEffect(() => {
    if (friendRequestsQuery.data) setFriendRequests(friendRequestsQuery.data);
  }, [friendRequestsQuery.data]);

  useEffect(() => {
    if (giftsQuery.data) setGifts(giftsQuery.data);
  }, [giftsQuery.data]);

  useEffect(() => {
    if (guildQuery.data) setGuild(guildQuery.data);
  }, [guildQuery.data]);

  useEffect(() => {
    if (challengesQuery.data) setChallenges(challengesQuery.data);
  }, [challengesQuery.data]);

  useEffect(() => {
    if (eventsQuery.data) setGlobalEvent(eventsQuery.data);
  }, [eventsQuery.data]);

  const addFriend = useCallback((username: string, level: number) => {
    const friend: Friend = {
      id: `friend_${Date.now()}`,
      username,
      level,
      totalBloomed: 0,
      currentStreak: 1,
      addedAt: Date.now(),
      lastActive: Date.now(),
    };
    const updated = [friend, ...friends];
    setFriends(updated);
    saveFriendsMutate(updated);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('✨ Friend Added!', `${username} is now your friend!`);
  }, [friends, saveFriendsMutate]);

  const sendFriendRequest = useCallback((username: string) => {
    const request: FriendRequest = {
      id: `req_${Date.now()}`,
      fromUsername: 'You',
      toUsername: username,
      sentAt: Date.now(),
      status: 'pending',
    };
    const updated = [request, ...friendRequests];
    setFriendRequests(updated);
    saveFriendRequests(updated);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [friendRequests, saveFriendRequests]);

  const joinGuild = useCallback((guildData: Guild) => {
    setGuild(guildData);
    saveGuildMutate(guildData);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('🏰 Joined Guild!', `Welcome to ${guildData.name}!`);
  }, [saveGuildMutate]);

  const sendGift = useCallback((friendId: string, type: Gift['type'], amount: number, message?: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;

    const gift: Gift = {
      id: `gift_${Date.now()}`,
      fromUsername: 'You',
      toUsername: friend.username,
      type,
      amount,
      message,
      sentAt: Date.now(),
      claimed: false,
    };

    const updated = [gift, ...gifts];
    setGifts(updated);
    saveGifts(updated);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('🎁 Gift Sent!', `Your gift has been sent to ${friend.username}!`);
  }, [friends, gifts, saveGifts]);

  const claimGift = useCallback((giftId: string) => {
    const updated = gifts.map(g => 
      g.id === giftId ? { ...g, claimed: true } : g
    );
    setGifts(updated);
    saveGifts(updated);
    return gifts.find(g => g.id === giftId);
  }, [gifts, saveGifts]);

  const updateChallengeProgress = useCallback((type: WeeklyChallenge['type'], amount: number = 1) => {
    setChallenges(prev => {
      const updated = prev.map(c => {
        if (c.type === type && !c.completed) {
          const newProgress = Math.min(c.progress + amount, c.target);
          if (newProgress >= c.target && !c.completed) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return { ...c, progress: newProgress, completed: true };
          }
          return { ...c, progress: newProgress };
        }
        return c;
      });
      saveChallenges(updated);
      return updated;
    });
  }, [saveChallenges]);

  const updateGlobalEventProgress = useCallback((amount: number = 1) => {
    if (!globalEvent) return;

    const updated: GlobalEvent = {
      ...globalEvent,
      globalProgress: globalEvent.globalProgress + amount,
      userContribution: globalEvent.userContribution + amount,
    };
    setGlobalEvent(updated);
    saveEvents(updated);
  }, [globalEvent, saveEvents]);

  const getUnclaimedGifts = useCallback(() => {
    return gifts.filter(g => !g.claimed);
  }, [gifts]);

  const getCompletedChallenges = useCallback(() => {
    return challenges.filter(c => c.completed);
  }, [challenges]);

  const getActiveChallenges = useCallback(() => {
    return challenges.filter(c => !c.completed);
  }, [challenges]);

  return {
    friends,
    friendRequests,
    gifts,
    guild,
    challenges,
    globalEvent,
    isLoading: friendsQuery.isLoading,
    addFriend,
    sendFriendRequest,
    sendGift,
    claimGift,
    joinGuild,
    updateChallengeProgress,
    updateGlobalEventProgress,
    getUnclaimedGifts,
    getCompletedChallenges,
    getActiveChallenges,
  };
});
