// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ManifestationProvider } from "@/contexts/ManifestationContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { BookProvider } from "@/contexts/BookContext";
import { WeeklyManifestationProvider } from "@/contexts/DailyManifestationContext";
import { BackgroundProvider } from "@/contexts/BackgroundContext";
import { JournalProvider } from "@/contexts/JournalContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { RankingProvider } from "@/contexts/RankingContext";
import { CommunityProvider } from "@/contexts/CommunityContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="premium" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PremiumProvider>
        <NotificationProvider>
          <InventoryProvider>
            <RankingProvider>
              <CommunityProvider>
                <ManifestationProvider>
                  <WeeklyManifestationProvider>
                    <BookProvider>
                      <BackgroundProvider>
                        <JournalProvider>
                          <GestureHandlerRootView>
                            <RootLayoutNav />
                          </GestureHandlerRootView>
                        </JournalProvider>
                      </BackgroundProvider>
                    </BookProvider>
                  </WeeklyManifestationProvider>
                </ManifestationProvider>
              </CommunityProvider>
            </RankingProvider>
          </InventoryProvider>
        </NotificationProvider>
      </PremiumProvider>
    </QueryClientProvider>
  );
}
