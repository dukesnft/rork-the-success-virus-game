import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Gem, Sparkles, Zap, Crown, Infinity, Rocket, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { usePremium } from '@/contexts/PremiumContext';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: any;
  color: string;
  type: 'gems' | 'seeds' | 'booster' | 'auto' | 'energy';
  amount?: number;
  popular?: boolean;
  bestValue?: boolean;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'gems_small',
    name: '100 Gems',
    description: 'Perfect starter pack',
    price: 0.99,
    icon: Gem,
    color: '#9370DB',
    type: 'gems',
    amount: 100,
  },
  {
    id: 'gems_medium',
    name: '500 Gems',
    description: 'Popular choice',
    price: 3.99,
    icon: Gem,
    color: '#9370DB',
    type: 'gems',
    amount: 500,
    popular: true,
  },
  {
    id: 'gems_large',
    name: '1,200 Gems',
    description: 'Best value! +200 bonus',
    price: 7.99,
    icon: Gem,
    color: '#9370DB',
    type: 'gems',
    amount: 1200,
    bestValue: true,
  },
  {
    id: 'gems_huge',
    name: '2,500 Gems',
    description: '+500 bonus gems',
    price: 14.99,
    icon: Gem,
    color: '#FFD700',
    type: 'gems',
    amount: 2500,
  },
  {
    id: 'gems_mega',
    name: '6,000 Gems',
    description: '+1,500 bonus gems',
    price: 29.99,
    icon: Gem,
    color: '#FFD700',
    type: 'gems',
    amount: 6000,
  },
  {
    id: 'gems_ultra',
    name: '15,000 Gems',
    description: '+5,000 bonus gems',
    price: 69.99,
    icon: Gem,
    color: '#FF1493',
    type: 'gems',
    amount: 15000,
  },
  {
    id: 'gems_ultimate',
    name: '40,000 Gems',
    description: '+15,000 bonus gems',
    price: 149.99,
    icon: Gem,
    color: '#FF1493',
    type: 'gems',
    amount: 40000,
  },
  {
    id: 'gems_legendary',
    name: '100,000 Gems',
    description: '+50,000 bonus gems - Legendary!',
    price: 299.99,
    icon: Gem,
    color: '#00FFFF',
    type: 'gems',
    amount: 100000,
  },
  {
    id: 'seeds_small',
    name: '5 Special Seeds',
    description: 'Guaranteed rare manifestations',
    price: 4.99,
    icon: Sparkles,
    color: '#32CD32',
    type: 'seeds',
    amount: 5,
  },
  {
    id: 'seeds_medium',
    name: '15 Special Seeds',
    description: '+3 bonus seeds',
    price: 11.99,
    icon: Sparkles,
    color: '#32CD32',
    type: 'seeds',
    amount: 15,
    popular: true,
  },
  {
    id: 'seeds_large',
    name: '50 Special Seeds',
    description: '+15 bonus seeds',
    price: 34.99,
    icon: Sparkles,
    color: '#FFD700',
    type: 'seeds',
    amount: 50,
  },
  {
    id: 'booster_small',
    name: '10 Growth Boosters',
    description: 'Instant growth for your plants',
    price: 2.99,
    icon: Rocket,
    color: '#FF69B4',
    type: 'booster',
    amount: 10,
  },
  {
    id: 'booster_medium',
    name: '30 Growth Boosters',
    description: '+5 bonus boosters',
    price: 7.99,
    icon: Rocket,
    color: '#FF69B4',
    type: 'booster',
    amount: 30,
  },
  {
    id: 'booster_large',
    name: '100 Growth Boosters',
    description: '+25 bonus boosters',
    price: 19.99,
    icon: Rocket,
    color: '#FFD700',
    type: 'booster',
    amount: 100,
    bestValue: true,
  },
  {
    id: 'energy_pack',
    name: '10 Energy Refills',
    description: 'Never run out of energy',
    price: 4.99,
    icon: Zap,
    color: '#FFA500',
    type: 'energy',
    amount: 10,
  },
  {
    id: 'auto_nurture',
    name: 'Auto-Nurture Forever',
    description: 'Your plants grow automatically',
    price: 49.99,
    icon: Infinity,
    color: '#00CED1',
    type: 'auto',
  },
];

export default function ShopScreen() {
  const router = useRouter();
  const { 
    gems, 
    isPremium, 
    purchaseGems, 
    purchaseSpecialSeeds, 
    purchaseGrowthBooster, 
    purchaseEnergyBoost,
    purchaseAutoNurture,
    autoNurtureActive,
  } = usePremium();

  const handlePurchase = (item: ShopItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    switch (item.type) {
      case 'gems':
        purchaseGems(item.amount!, item.price);
        Alert.alert('Success!', `${item.amount} gems added to your account!`);
        break;
      case 'seeds':
        purchaseSpecialSeeds(item.amount!, item.price);
        Alert.alert('Success!', `${item.amount} special seeds added!`);
        break;
      case 'booster':
        purchaseGrowthBooster(item.amount!, item.price);
        Alert.alert('Success!', `${item.amount} growth boosters added!`);
        break;
      case 'energy':
        for (let i = 0; i < item.amount!; i++) {
          purchaseEnergyBoost();
        }
        Alert.alert('Success!', `${item.amount} energy refills added!`);
        break;
      case 'auto':
        if (autoNurtureActive) {
          Alert.alert('Already Owned', 'You already have Auto-Nurture!');
        } else {
          purchaseAutoNurture(item.price);
          Alert.alert('Success!', 'Auto-Nurture activated forever!');
        }
        break;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a0a2e', '#2d1b4e', '#1a0a2e']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>✨ Cosmic Shop</Text>
              <View style={styles.gemsDisplay}>
                <Gem color="#9370DB" size={20} />
                <Text style={styles.gemsText}>{gems.toLocaleString()}</Text>
              </View>
            </View>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <X color="#fff" size={28} />
            </Pressable>
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.sectionTitle}>💎 Gems</Text>
            <Text style={styles.sectionSubtitle}>Premium currency for special items</Text>
            
            <View style={styles.itemsGrid}>
              {SHOP_ITEMS.filter(item => item.type === 'gems').map(item => {
                const Icon = item.icon;
                const discount = isPremium ? 0.75 : 1;
                const finalPrice = item.price * discount;
                
                return (
                  <Pressable
                    key={item.id}
                    style={styles.itemCard}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handlePurchase(item);
                    }}
                  >
                    <LinearGradient
                      colors={[item.color + '30', item.color + '10']}
                      style={styles.itemGradient}
                    >
                      {item.popular && (
                        <View style={styles.popularBadge}>
                          <Star size={12} color="#FFD700" fill="#FFD700" />
                          <Text style={styles.popularText}>POPULAR</Text>
                        </View>
                      )}
                      {item.bestValue && (
                        <View style={styles.bestValueBadge}>
                          <Text style={styles.bestValueText}>BEST VALUE</Text>
                        </View>
                      )}
                      <View style={[styles.itemIconCircle, { backgroundColor: item.color + '40' }]}>
                        <Icon color={item.color} size={32} />
                      </View>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDescription}>{item.description}</Text>
                      <View style={styles.priceContainer}>
                        {isPremium && (
                          <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>
                        )}
                        <Text style={styles.itemPrice}>${finalPrice.toFixed(2)}</Text>
                      </View>
                      {isPremium && (
                        <View style={styles.discountBadge}>
                          <Crown size={10} color="#FFD700" />
                          <Text style={styles.discountText}>25% OFF</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>🌟 Special Seeds</Text>
            <Text style={styles.sectionSubtitle}>Grow rare and powerful manifestations</Text>
            
            <View style={styles.itemsGrid}>
              {SHOP_ITEMS.filter(item => item.type === 'seeds').map(item => {
                const Icon = item.icon;
                const discount = isPremium ? 0.75 : 1;
                const finalPrice = item.price * discount;
                
                return (
                  <Pressable
                    key={item.id}
                    style={styles.itemCard}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handlePurchase(item);
                    }}
                  >
                    <LinearGradient
                      colors={[item.color + '30', item.color + '10']}
                      style={styles.itemGradient}
                    >
                      {item.popular && (
                        <View style={styles.popularBadge}>
                          <Star size={12} color="#FFD700" fill="#FFD700" />
                          <Text style={styles.popularText}>POPULAR</Text>
                        </View>
                      )}
                      <View style={[styles.itemIconCircle, { backgroundColor: item.color + '40' }]}>
                        <Icon color={item.color} size={32} />
                      </View>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDescription}>{item.description}</Text>
                      <View style={styles.priceContainer}>
                        {isPremium && (
                          <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>
                        )}
                        <Text style={styles.itemPrice}>${finalPrice.toFixed(2)}</Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>🚀 Growth Boosters</Text>
            <Text style={styles.sectionSubtitle}>Speed up your manifestation growth</Text>
            
            <View style={styles.itemsGrid}>
              {SHOP_ITEMS.filter(item => item.type === 'booster').map(item => {
                const Icon = item.icon;
                const discount = isPremium ? 0.75 : 1;
                const finalPrice = item.price * discount;
                
                return (
                  <Pressable
                    key={item.id}
                    style={styles.itemCard}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handlePurchase(item);
                    }}
                  >
                    <LinearGradient
                      colors={[item.color + '30', item.color + '10']}
                      style={styles.itemGradient}
                    >
                      {item.bestValue && (
                        <View style={styles.bestValueBadge}>
                          <Text style={styles.bestValueText}>BEST VALUE</Text>
                        </View>
                      )}
                      <View style={[styles.itemIconCircle, { backgroundColor: item.color + '40' }]}>
                        <Icon color={item.color} size={32} />
                      </View>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDescription}>{item.description}</Text>
                      <View style={styles.priceContainer}>
                        {isPremium && (
                          <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>
                        )}
                        <Text style={styles.itemPrice}>${finalPrice.toFixed(2)}</Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>⚡ Utilities</Text>
            <Text style={styles.sectionSubtitle}>Enhance your experience</Text>
            
            <View style={styles.itemsGrid}>
              {SHOP_ITEMS.filter(item => item.type === 'energy' || item.type === 'auto').map(item => {
                const Icon = item.icon;
                const discount = isPremium ? 0.75 : 1;
                const finalPrice = item.price * discount;
                const isOwned = item.type === 'auto' && autoNurtureActive;
                
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.itemCard, isOwned && styles.ownedCard]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handlePurchase(item);
                    }}
                    disabled={isOwned}
                  >
                    <LinearGradient
                      colors={[item.color + '30', item.color + '10']}
                      style={styles.itemGradient}
                    >
                      {isOwned && (
                        <View style={styles.ownedBadge}>
                          <Text style={styles.ownedText}>OWNED</Text>
                        </View>
                      )}
                      <View style={[styles.itemIconCircle, { backgroundColor: item.color + '40' }]}>
                        <Icon color={item.color} size={32} />
                      </View>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDescription}>{item.description}</Text>
                      {!isOwned && (
                        <View style={styles.priceContainer}>
                          {isPremium && (
                            <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>
                          )}
                          <Text style={styles.itemPrice}>${finalPrice.toFixed(2)}</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💳 Safe & Secure</Text>
              <Text style={styles.infoText}>
                All purchases are processed securely. Premium members get 25% off all shop items!
              </Text>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </SafeAreaView>
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 8,
  },
  gemsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(147,112,219,0.2)',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  gemsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#9370DB',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginTop: 24,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#b8a9d9',
    marginBottom: 16,
  },
  itemsGrid: {
    gap: 12,
  },
  itemCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ownedCard: {
    opacity: 0.6,
  },
  itemGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFD700',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: '#1a0a2e',
  },
  bestValueBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#32CD32',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  ownedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#98FB98',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  ownedText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: '#1a0a2e',
  },
  itemIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#b8a9d9',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through' as const,
  },
  itemPrice: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFD700',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 11,
    fontWeight: 'bold' as const,
    color: '#FFD700',
  },
  infoBox: {
    marginTop: 32,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#b8a9d9',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
});
