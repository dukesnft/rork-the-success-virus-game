import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Crown, Zap, Infinity, Sparkles, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { usePremium } from '@/contexts/PremiumContext';

const PREMIUM_BENEFITS = [
  { icon: Infinity, text: 'Unlimited manifestations', color: '#FFD700' },
  { icon: Zap, text: 'Faster energy growth', color: '#FF69B4' },
  { icon: Sparkles, text: 'Exclusive affirmations', color: '#9370DB' },
  { icon: Crown, text: 'Premium garden themes', color: '#00CED1' },
];

export default function PremiumScreen() {
  const router = useRouter();
  const { upgradeToPremium } = usePremium();

  const handleSubscribe = (duration: 'month' | 'year') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    upgradeToPremium(duration);
    setTimeout(() => router.back(), 500);
  };

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

          <View style={styles.pricingContainer}>
            <Pressable
              style={styles.priceCard}
              onPress={() => handleSubscribe('year')}
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
                <Text style={styles.priceAmount}>$29.99</Text>
                <Text style={styles.priceDetail}>$2.50/month</Text>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>Save 50%</Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.priceCard}
              onPress={() => handleSubscribe('month')}
            >
              <LinearGradient
                colors={['#9370DB', '#FF69B4']}
                style={styles.priceGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.priceDuration}>Monthly</Text>
                <Text style={styles.priceAmount}>$4.99</Text>
                <Text style={styles.priceDetail}>billed monthly</Text>
              </LinearGradient>
            </Pressable>
          </View>

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
});
