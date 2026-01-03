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
import { BackgroundProvider } from "@/contexts/BackgroundContext";
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
    if (permissionStatus === 'granted' && inventory.length > 0) {
      const bloomedCount = inventory.filter(item => item.stage === 'blooming').length;
      if (bloomedCount > 0) {
        console.log(`Scheduling reminders for ${bloomedCount} bloomed manifestations`);
        scheduleManifestationReminders(inventory, isPremium);
      }
    }
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

export default function RootLayout() {
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('[App] Starting initialization...');
        
        configureRevenueCat().catch(error => {
          console.log('[App] RevenueCat config skipped:', error.message);
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsReady(true);
        
        setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
            console.log('[App] Splash screen hidden');
          } catch {
            console.log('[App] Splash screen already hidden');
          }
        }, 300);
      } catch (e) {
        console.error('[App] Init error:', e);
        setIsReady(true);
        SplashScreen.hideAsync().catch(() => {});
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
            <ManifestationProvider>
              <InventoryProvider>
                <PremiumProvider>
                  <NotificationProvider>
                    <AchievementProvider>
                      <QuestProvider>
                        <DailyManifestationProvider>
                          <BookProvider>
                            <BackgroundProvider>
                              <JournalProvider>
                                <SocialProvider>
                                  <RankingProvider>
                                    <CommunityProvider>
                                      <ProfileProvider>
                                        <RootLayoutNav />
                                      </ProfileProvider>
                                    </CommunityProvider>
                                  </RankingProvider>
                                </SocialProvider>
                              </JournalProvider>
                            </BackgroundProvider>
                          </BookProvider>
                        </DailyManifestationProvider>
                      </QuestProvider>
                    </AchievementProvider>
                  </NotificationProvider>
                </PremiumProvider>
              </InventoryProvider>
            </ManifestationProvider>
          </ErrorBoundary>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
