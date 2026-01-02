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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
      refetchOnWindowFocus: false,
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
  useEffect(() => {
    const init = async () => {
      try {
        console.log('[App] Starting initialization...');
        
        setTimeout(() => {
          configureRevenueCat().catch(error => {
            console.log('[App] RevenueCat config skipped:', error.message);
          });
        }, 100);
        
        setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
            console.log('[App] Splash screen hidden');
          } catch (e) {
            console.log('[App] Splash hide error:', e);
          }
        }, 500);
      } catch (e) {
        console.error('[App] Init error:', e);
      }
    };
    
    init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
        <PremiumProvider>
        <AchievementProvider>
          <QuestProvider>
            <NotificationProvider>
              <InventoryProvider>
                <SocialProvider>
                  <RankingProvider>
                    <CommunityProvider>
                      <ProfileProvider>
                        <ManifestationProvider>
                  <DailyManifestationProvider>
                    <BookProvider>
                      <BackgroundProvider>
                        <JournalProvider>
                          <GestureHandlerRootView>
                            <RootLayoutNav />
                          </GestureHandlerRootView>
                        </JournalProvider>
                      </BackgroundProvider>
                    </BookProvider>
                  </DailyManifestationProvider>
                        </ManifestationProvider>
                      </ProfileProvider>
                    </CommunityProvider>
                  </RankingProvider>
                </SocialProvider>
              </InventoryProvider>
            </NotificationProvider>
          </QuestProvider>
        </AchievementProvider>
        </PremiumProvider>
      </QueryClientProvider>
  );
}
