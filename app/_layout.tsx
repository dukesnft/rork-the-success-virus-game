import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { configureRevenueCat } from "@/utils/revenuecat";
import { ManifestationProvider } from "@/contexts/ManifestationContext";
import { PremiumProvider, usePremium } from "@/contexts/PremiumContext";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";
import { BookProvider } from "@/contexts/BookContext";
import { DailyManifestationProvider } from "@/contexts/DailyManifestationContext";
import { BackgroundProvider, useBackgrounds } from "@/contexts/BackgroundContext";
import { JournalProvider } from "@/contexts/JournalContext";
import { InventoryProvider, useInventory } from "@/contexts/InventoryContext";
import { RankingProvider } from "@/contexts/RankingContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { AchievementProvider } from "@/contexts/AchievementContext";
import { QuestProvider } from "@/contexts/QuestContext";
import { SocialProvider } from "@/contexts/SocialContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

function NotificationScheduler() {
  const { inventory } = useInventory();
  const { isPremium } = usePremium();
  const { scheduleManifestationReminders, permissionStatus } = useNotifications();

  useEffect(() => {
    const schedule = async () => {
      try {
        if (permissionStatus === 'granted' && inventory.length > 0) {
          const bloomedCount = inventory.filter(item => item.stage === 'blooming').length;
          if (bloomedCount > 0) {
            console.log(`Scheduling reminders for ${bloomedCount} bloomed manifestations`);
            await scheduleManifestationReminders(inventory, isPremium);
          }
        }
      } catch (error) {
        console.log('[NotificationScheduler] Error:', error);
      }
    };
    schedule();
  }, [inventory, isPremium, scheduleManifestationReminders, permissionStatus]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <NotificationScheduler />
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="create" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="premium" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="shop" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="inventory" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="rankings" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="profile" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="delete-account" options={{ presentation: "modal", headerShown: false }} />
      </Stack>
    </>
  );
}

function AppInitializer() {
  const { updatePremiumStatus } = useBackgrounds();
  const { isPremium } = usePremium();

  useEffect(() => {
    updatePremiumStatus(isPremium);
  }, [isPremium, updatePremiumStatus]);

  return null;
}

export default function RootLayout() {
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('[App] Starting initialization...');
        
        const timeoutId = setTimeout(() => {
          console.log('[App] Init timeout, forcing ready state');
          setIsReady(true);
        }, 3000);
        
        try {
          await configureRevenueCat();
          console.log('[App] RevenueCat configured');
        } catch (error: any) {
          console.log('[App] RevenueCat config skipped:', error?.message || 'Unknown error');
        }
        
        clearTimeout(timeoutId);
        setIsReady(true);
        
        setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
            console.log('[App] Splash screen hidden');
          } catch (error) {
            console.log('[App] Splash screen already hidden or error:', error);
          }
        }, 500);
      } catch (e) {
        console.error('[App] Init error:', e);
        setIsReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch {}
      }
    };
    
    init();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ErrorBoundary>
            <PremiumProvider>
              <ManifestationProvider>
                <InventoryProvider>
                  <BackgroundProvider>
                    <NotificationProvider>
                      <AchievementProvider>
                        <QuestProvider>
                          <DailyManifestationProvider>
                            <BookProvider>
                              <JournalProvider>
                                <SocialProvider>
                                  <RankingProvider>
                                    <CommunityProvider>
                                      <ProfileProvider>
                                        <AppInitializer />
                                        <RootLayoutNav />
                                      </ProfileProvider>
                                    </CommunityProvider>
                                  </RankingProvider>
                                </SocialProvider>
                              </JournalProvider>
                            </BookProvider>
                          </DailyManifestationProvider>
                        </QuestProvider>
                      </AchievementProvider>
                    </NotificationProvider>
                  </BackgroundProvider>
                </InventoryProvider>
              </ManifestationProvider>
            </PremiumProvider>
          </ErrorBoundary>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
