import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_STORAGE_KEY = 'notification_settings';
const SCHEDULED_NOTIFICATIONS_KEY = 'scheduled_notifications';

interface NotificationSettings {
  enabled: boolean;
  dailyTime: { hour: number; minute: number };
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  dailyTime: { hour: 9, minute: 0 },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  const settingsQuery = useQuery({
    queryKey: ['notification_settings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: NotificationSettings) => {
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'web') {
      setPermissionStatus('denied');
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return false;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  }, []);

  const scheduleManifestationNotification = useCallback(async (
    manifestationId: string,
    intention: string,
    category: string
  ) => {
    if (Platform.OS === 'web' || !settings.enabled || permissionStatus !== 'granted') {
      return;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌟 Your Manifestation Reminder',
          body: intention,
          data: { manifestationId, category },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: settings.dailyTime.hour,
          minute: settings.dailyTime.minute,
          repeats: true,
        } as Notifications.DailyTriggerInput,
      });

      const stored = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
      const scheduled = stored ? JSON.parse(stored) : {};
      scheduled[manifestationId] = notificationId;
      await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduled));

      console.log('Scheduled notification:', notificationId, 'for manifestation:', manifestationId);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }, [settings, permissionStatus]);

  const cancelManifestationNotification = useCallback(async (manifestationId: string) => {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const stored = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
      const scheduled = stored ? JSON.parse(stored) : {};
      const notificationId = scheduled[manifestationId];

      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        delete scheduled[manifestationId];
        await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduled));
        console.log('Cancelled notification for manifestation:', manifestationId);
      }
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }, []);

  const cancelAllNotifications = useCallback(async () => {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify({}));
      console.log('Cancelled all notifications');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }, []);

  const { mutate: saveMutate } = saveSettingsMutation;

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveMutate(updated);

    if (!updated.enabled) {
      await cancelAllNotifications();
    }
  }, [settings, saveMutate, cancelAllNotifications]);

  const rescheduleAllNotifications = useCallback(async (manifestations: { id: string; intention: string; category: string }[]) => {
    if (Platform.OS === 'web' || !settings.enabled || permissionStatus !== 'granted') {
      return;
    }

    await cancelAllNotifications();

    for (const manifestation of manifestations) {
      await scheduleManifestationNotification(
        manifestation.id,
        manifestation.intention,
        manifestation.category
      );
    }
  }, [settings, permissionStatus, cancelAllNotifications, scheduleManifestationNotification]);

  return {
    settings,
    permissionStatus,
    isLoading: settingsQuery.isLoading,
    requestPermissions,
    updateSettings,
    scheduleManifestationNotification,
    cancelManifestationNotification,
    cancelAllNotifications,
    rescheduleAllNotifications,
  };
});
