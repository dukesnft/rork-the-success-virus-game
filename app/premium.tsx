import { StyleSheet, View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Crown, Zap, Infinity, Sparkles, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { usePremium } from '@/contexts/PremiumContext';
import { useQuery } from '@tanstack/react-query';
import { getOfferings } from '@/utils/revenuecat';
import { useState } from 'react';

const PREMIUM_BENEFITS = [
  { icon: Infinity, text: 'Unlimited manifestations', color: '#FFD700' },
  { icon: Zap, text: 'Faster energy growth', color: '#FF69B4' },
  { icon: Sparkles, text: 'Exclusive affirmations', color: '#9370DB' },
  { icon: Crown, text: 'Premium garden themes', color: '#00CED1' },
];

export default function PremiumScreen() {
  const router = useRouter();
  const { upgradeToPremium, restorePurchases, isPremium } = usePremium();
  const [loading, setLoading] = useState(false);

  const { data: offerings, isLoading } = useQuery({
    queryKey: ['revenuecat-offerings'],
    queryFn: getOfferings,
  });

  const handleSubscribe = async (packageToPurchase: any) => {
    if (loading) return;
    
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const success = await upgradeToPremium(packageToPurchase);
      
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('🎉 Welcome to Premium!', 'You now have access to all premium features!', [
          { text: 'Awesome!', onPress: () => router.back() }
        ]);
      }
    } catch {
      Alert.alert('Purchase Failed', 'Could not complete the purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const success = await restorePurchases();
      
      if (success) {
        Alert.alert('✅ Purchases Restored', 'Your premium access has been restored!');
      } else {
        Alert.alert('No Purchases Found', 'Could not find any previous purchases to restore.');
      }
    } catch {
      Alert.alert('Restore Failed', 'Could not restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a0a2e', '#2d1b4e', '#3d2b5e']} style={styles.gradient}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <X color="#fff" size={28} />
          </Pressable>
          <View style={styles.alreadyPremiumContainer}>
            <Crown color="#FFD700" size={80} fill="#FFD700" />
            <Text style={styles.alreadyPremiumTitle}>You&apos;re Premium!</Text>
            <Text style={styles.alreadyPremiumText}>Enjoy all the premium benefits</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const defaultOffering = offerings?.current;
  const monthlyPackage = defaultOffering?.availablePackages.find(p => p.identifier === 'monthly');
  const annualPackage = defaultOffering?.availablePackages.find(p => p.identifier === 'annual');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a0a2e', '#2d1b4e', '#3d2b5e']}
        style={styles.gradient}
      >
        <Pressable
          style={styles.closeButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <X color="#fff" size={28} />
        </Pressable>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.crownContainer}>
              <Crown color="#FFD700" size={64} fill="#FFD700" />
            </View>
            <Text style={styles.title}>Unlock Premium</Text>
            <Text style={styles.subtitle}>Manifest without limits</Text>
          </View>

          <View style={styles.benefitsContainer}>
            {PREMIUM_BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <View key={index} style={styles.benefitCard}>
                  <View style={[styles.iconCircle, { backgroundColor: benefit.color + '20' }]}>
                    <Icon color={benefit.color} size={28} />
                  </View>
                  <Text style={styles.benefitText}>{benefit.text}</Text>
                  <Check color="#98FB98" size={24} strokeWidth={3} />
                </View>
              );
            })}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingText}>Loading offers...</Text>
            </View>
          ) : (
            <View style={styles.pricingContainer}>
              {annualPackage && (
                <Pressable
                  style={styles.priceCard}
                  onPress={() => handleSubscribe(annualPackage)}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.priceGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>BEST VALUE</Text>
                    </View>
                    <Text style={styles.priceDuration}>Yearly</Text>
                    <Text style={styles.priceAmount}>{annualPackage.product.priceString}</Text>
                    <Text style={styles.priceDetail}>billed annually</Text>
                    {loading && <ActivityIndicator color="#fff" style={styles.buttonLoader} />}
                  </LinearGradient>
                </Pressable>
              )}

              {monthlyPackage && (
                <Pressable
                  style={styles.priceCard}
                  onPress={() => handleSubscribe(monthlyPackage)}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#9370DB', '#FF69B4']}
                    style={styles.priceGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.priceDuration}>Monthly</Text>
                    <Text style={styles.priceAmount}>{monthlyPackage.product.priceString}</Text>
                    <Text style={styles.priceDetail}>billed monthly</Text>
                    {loading && <ActivityIndicator color="#fff" style={styles.buttonLoader} />}
                  </LinearGradient>
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Sparkles color="#FFD700" size={20} />
              <Text style={styles.featureText}>No ads</Text>
            </View>
            <View style={styles.featureItem}>
              <Sparkles color="#FFD700" size={20} />
              <Text style={styles.featureText}>Priority support</Text>
            </View>
            <View style={styles.featureItem}>
              <Sparkles color="#FFD700" size={20} />
              <Text style={styles.featureText}>Early access</Text>
            </View>
            <View style={styles.featureItem}>
              <Sparkles color="#FFD700" size={20} />
              <Text style={styles.featureText}>Special rewards</Text>
            </View>
          </View>

          <Pressable
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={loading}
          >
            <Text style={styles.restoreButtonText}>
              {loading ? 'Restoring...' : 'Restore Purchases'}
            </Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            Premium subscription gives you unlimited access to all features. Cancel anytime.
          </Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  crownContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#b8a9d9',
  },
  benefitsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  pricingContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  priceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  priceGradient: {
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: 1,
  },
  priceDuration: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 4,
  },
  priceDetail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  savingsBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  disclaimer: {
    fontSize: 13,
    color: '#b8a9d9',
    textAlign: 'center' as const,
    paddingHorizontal: 32,
    marginBottom: 40,
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#b8a9d9',
  },
  buttonLoader: {
    marginTop: 12,
  },
  restoreButton: {
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  restoreButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#b8a9d9',
  },
  alreadyPremiumContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  alreadyPremiumTitle: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
  },
  alreadyPremiumText: {
    fontSize: 18,
    color: '#b8a9d9',
    textAlign: 'center' as const,
  },
});
