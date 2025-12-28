import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Gem, Sparkles, Zap, Crown, Infinity, Rocket, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { usePremium } from '@/contexts/PremiumContext';
import { useInventory } from '@/contexts/InventoryContext';
import { SeedRarity } from '@/types/inventory';

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
  rarity?: SeedRarity;
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
    id: 'seeds_common',
    name: '10 Common Seeds',
    description: 'Standard quality seeds',
    price: 2.99,
    icon: Sparkles,
    color: '#90EE90',
    type: 'seeds',
    amount: 10,
    rarity: 'common',
  },
  {
    id: 'seeds_rare',
    name: '5 Rare Seeds',
    description: 'Higher quality manifestations',
    price: 4.99,
    icon: Sparkles,
    color: '#4169E1',
    type: 'seeds',
    amount: 5,
    rarity: 'rare',
    popular: true,
  },
  {
    id: 'seeds_epic',
    name: '3 Epic Seeds',
    description: 'Powerful manifestations',
    price: 9.99,
    icon: Sparkles,
    color: '#9370DB',
    type: 'seeds',
    amount: 3,
    rarity: 'epic',
  },
  {
    id: 'seeds_legendary',
    name: '1 Legendary Seed',
    description: 'The most powerful seed',
    price: 19.99,
    icon: Sparkles,
    color: '#FFD700',
    type: 'seeds',
    amount: 1,
    rarity: 'legendary',
    bestValue: true,
  },
  {
    id: 'seeds_bundle',
    name: 'Mixed Seed Bundle',
    description: '5 Common, 3 Rare, 1 Epic',
    price: 12.99,
    icon: Sparkles,
    color: '#32CD32',
    type: 'seeds',
    amount: 9,
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
    purchaseGrowthBooster, 
    purchaseEnergyBoost,
    purchaseAutoNurture,
    autoNurtureActive,
    purchaseItem,
    spendGems,
    refillEnergy,
  } = usePremium();
  
  const {
    addSeeds,
    getTotalSeedsCount,
  } = useInventory();

  const [freeSeeds, setFreeSeeds] = React.useState({ claimed: 0, lastClaim: '' });

  React.useEffect(() => {
    const loadFreeSeeds = async () => {
      const stored = await AsyncStorage.getItem('free_seeds_daily');
      const today = new Date().toISOString().split('T')[0];
      if (stored) {
        const data = JSON.parse(stored);
        if (data.lastClaim === today) {
          setFreeSeeds(data);
        } else {
          setFreeSeeds({ claimed: 0, lastClaim: today });
        }
      } else {
        setFreeSeeds({ claimed: 0, lastClaim: today });
      }
    };
    loadFreeSeeds();
  }, []);

  const getFreeSeedsRemaining = () => {
    const max = isPremium ? 5 : 3;
    return Math.max(0, max - freeSeeds.claimed);
  };

  const claimFreeSeeds = async (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newClaimed = freeSeeds.claimed + amount;
    const newData = { claimed: newClaimed, lastClaim: today };
    setFreeSeeds(newData);
    await AsyncStorage.setItem('free_seeds_daily', JSON.stringify(newData));
    addSeeds('common', amount);
  };

  const handlePurchase = (item: ShopItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    switch (item.type) {
      case 'gems':
        purchaseGems(item.amount!, item.price);
        Alert.alert('Success!', `${item.amount} gems added to your account!`);
        break;
      case 'seeds':
        if (item.id === 'seeds_bundle') {
          addSeeds('common', 5);
          addSeeds('rare', 3);
          addSeeds('epic', 1);
          purchaseItem(item.price);
          Alert.alert('Success!', 'Mixed seed bundle added to your inventory!');
        } else if (item.rarity) {
          addSeeds(item.rarity, item.amount!);
          purchaseItem(item.price);
          const rarityName = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1);
          Alert.alert('Success!', `${item.amount} ${rarityName} seeds added to your inventory!`);
        }
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
              <View style={styles.headerStats}>
                <View style={styles.gemsDisplay}>
                  <Gem color="#9370DB" size={20} />
                  <Text style={styles.gemsText}>{gems.toLocaleString()}</Text>
                </View>
                <View style={styles.seedsDisplay}>
                  <Sparkles color="#32CD32" size={20} />
                  <Text style={styles.seedsText}>{getTotalSeedsCount()}</Text>
                </View>
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
            <View style={styles.freeSeedsSection}>
              <LinearGradient
                colors={['#32CD32', '#228B22']}
                style={styles.freeSeedsCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.freeSeedsHeader}>
                  <Text style={styles.freeSeedsTitle}>🎁 Free Daily Seeds</Text>
                  {isPremium && (
                    <View style={styles.premiumFreeBadge}>
                      <Crown size={12} color="#FFD700" />
                      <Text style={styles.premiumFreeText}>+2 EXTRA</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.freeSeedsDescription}>
                  Claim your free seeds every day! {isPremium ? '5' : '3'} seeds available daily.
                </Text>
                <View style={styles.freeSeedsProgress}>
                  <View style={styles.freeSeedsCounter}>
                    <Sparkles color="#fff" size={24} />
                    <Text style={styles.freeSeedsCountText}>{getFreeSeedsRemaining()}</Text>
                  </View>
                  <Text style={styles.freeSeedsRemaining}>seeds remaining today</Text>
                </View>
                {getFreeSeedsRemaining() > 0 ? (
                  <Pressable
                    style={styles.claimButton}
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      claimFreeSeeds(1);
                      Alert.alert('Success!', '1 free seed claimed!');
                    }}
                  >
                    <Text style={styles.claimButtonText}>Claim 1 Free Seed</Text>
                  </Pressable>
                ) : (
                  <View style={styles.claimedButton}>
                    <Text style={styles.claimedButtonText}>Come back tomorrow!</Text>
                  </View>
                )}
              </LinearGradient>
            </View>

            <Text style={styles.sectionTitle}>💎 Gem Store</Text>
            <Text style={styles.sectionSubtitle}>Spend your gems on powerful items</Text>
            
            <Pressable
              style={styles.gemStoreCard}
              onPress={() => {
                if (gems >= 200) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  spendGems(200);
                  addSeeds('common', 10);
                  Alert.alert('✨ Success!', '10 Common seeds added to your inventory!');
                } else {
                  Alert.alert('Not Enough Gems', 'You need 200 gems to purchase this item.');
                }
              }}
            >
              <LinearGradient
                colors={['#90EE90', '#32CD32']}
                style={styles.gemStoreGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gemStoreIcon}>
                  <Sparkles color="#32CD32" size={32} />
                </View>
                <View style={styles.gemStoreInfo}>
                  <Text style={styles.gemStoreTitle}>10 Common Seeds</Text>
                  <Text style={styles.gemStoreDescription}>Standard quality seeds</Text>
                </View>
                <View style={styles.gemStorePriceBox}>
                  <Gem color="#FFD700" size={20} />
                  <Text style={styles.gemStorePrice}>200</Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.gemStoreCard}
              onPress={() => {
                if (gems >= 350) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  spendGems(350);
                  addSeeds('rare', 5);
                  Alert.alert('💎 Success!', '5 Rare seeds added to your inventory!');
                } else {
                  Alert.alert('Not Enough Gems', 'You need 350 gems to purchase this item.');
                }
              }}
            >
              <LinearGradient
                colors={['#4169E1', '#1E90FF']}
                style={styles.gemStoreGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gemStoreIcon}>
                  <Sparkles color="#4169E1" size={32} />
                </View>
                <View style={styles.gemStoreInfo}>
                  <Text style={styles.gemStoreTitle}>5 Rare Seeds</Text>
                  <Text style={styles.gemStoreDescription}>Higher quality manifestations</Text>
                </View>
                <View style={styles.gemStorePriceBox}>
                  <Gem color="#FFD700" size={20} />
                  <Text style={styles.gemStorePrice}>350</Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.gemStoreCard}
              onPress={() => {
                if (gems >= 700) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  spendGems(700);
                  addSeeds('epic', 3);
                  Alert.alert('⚡ Success!', '3 Epic seeds added to your inventory!');
                } else {
                  Alert.alert('Not Enough Gems', 'You need 700 gems to purchase this item.');
                }
              }}
            >
              <LinearGradient
                colors={['#9370DB', '#8A2BE2']}
                style={styles.gemStoreGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gemStoreIcon}>
                  <Sparkles color="#9370DB" size={32} />
                </View>
                <View style={styles.gemStoreInfo}>
                  <Text style={styles.gemStoreTitle}>3 Epic Seeds</Text>
                  <Text style={styles.gemStoreDescription}>Powerful manifestations</Text>
                </View>
                <View style={styles.gemStorePriceBox}>
                  <Gem color="#FFD700" size={20} />
                  <Text style={styles.gemStorePrice}>700</Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.gemStoreCard}
              onPress={() => {
                if (gems >= 1400) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  spendGems(1400);
                  addSeeds('legendary', 1);
                  Alert.alert('👑 Legendary!', '1 Legendary seed added to your inventory!');
                } else {
                  Alert.alert('Not Enough Gems', 'You need 1,400 gems to purchase this item.');
                }
              }}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.gemStoreGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gemStoreIcon}>
                  <Sparkles color="#FFD700" size={32} />
                </View>
                <View style={styles.gemStoreInfo}>
                  <Text style={styles.gemStoreTitle}>1 Legendary Seed</Text>
                  <Text style={styles.gemStoreDescription}>The ultimate manifestation</Text>
                </View>
                <View style={styles.gemStorePriceBox}>
                  <Gem color="#FFD700" size={20} />
                  <Text style={styles.gemStorePrice}>1,400</Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.gemStoreCard}
              onPress={() => {
                if (gems >= 350) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  spendGems(350);
                  for (let i = 0; i < 10; i++) {
                    refillEnergy();
                  }
                  Alert.alert('💫 Energy Refilled!', '10 Energy refills added!');
                } else {
                  Alert.alert('Not Enough Gems', 'You need 350 gems to purchase this item.');
                }
              }}
            >
              <LinearGradient
                colors={['#FFA500', '#FF8C00']}
                style={styles.gemStoreGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gemStoreIcon}>
                  <Zap color="#FFA500" size={32} />
                </View>
                <View style={styles.gemStoreInfo}>
                  <Text style={styles.gemStoreTitle}>10 Energy Refills</Text>
                  <Text style={styles.gemStoreDescription}>Never run out of energy</Text>
                </View>
                <View style={styles.gemStorePriceBox}>
                  <Gem color="#FFD700" size={20} />
                  <Text style={styles.gemStorePrice}>350</Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.gemStoreCard}
              onPress={() => {
                if (gems >= 200) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  spendGems(200);
                  purchaseGrowthBooster(10, 0);
                  Alert.alert('🚀 Boosted!', '10 Growth boosters added!');
                } else {
                  Alert.alert('Not Enough Gems', 'You need 200 gems to purchase this item.');
                }
              }}
            >
              <LinearGradient
                colors={['#FF69B4', '#FF1493']}
                style={styles.gemStoreGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gemStoreIcon}>
                  <Rocket color="#FF69B4" size={32} />
                </View>
                <View style={styles.gemStoreInfo}>
                  <Text style={styles.gemStoreTitle}>10 Growth Boosters</Text>
                  <Text style={styles.gemStoreDescription}>Instant growth for your plants</Text>
                </View>
                <View style={styles.gemStorePriceBox}>
                  <Gem color="#FFD700" size={20} />
                  <Text style={styles.gemStorePrice}>200</Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.gemStoreCard}
              onPress={() => {
                if (gems >= 1000) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  spendGems(1000);
                  addSeeds('common', 10);
                  addSeeds('rare', 5);
                  addSeeds('epic', 3);
                  Alert.alert('🌟 Amazing!', 'Mega seed bundle added to your inventory!');
                } else {
                  Alert.alert('Not Enough Gems', 'You need 1,000 gems to purchase this item.');
                }
              }}
            >
              <LinearGradient
                colors={['#32CD32', '#228B22']}
                style={styles.gemStoreGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gemStoreIcon}>
                  <Star color="#FFD700" size={32} fill="#FFD700" />
                </View>
                <View style={styles.gemStoreInfo}>
                  <Text style={styles.gemStoreTitle}>Mega Seed Bundle</Text>
                  <Text style={styles.gemStoreDescription}>10 Common + 5 Rare + 3 Epic</Text>
                </View>
                <View style={styles.gemStorePriceBox}>
                  <Gem color="#FFD700" size={20} />
                  <Text style={styles.gemStorePrice}>1,000</Text>
                </View>
              </LinearGradient>
            </Pressable>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💎 Earn Gems Daily</Text>
              <Text style={styles.infoText}>
                • Daily login: +10 gems{"\n"}
                • Complete manifestations: +20-100 gems{"\n"}
                • Weekly streak bonus: +50 gems{"\n"}
                • Share to community: +30 gems{"\n"}
                • Daily quests: +30-70 gems{"\n"}
                • Achievements: +20-500 gems
              </Text>
            </View>

            <Text style={styles.sectionTitle}>💰 Buy Gems</Text>
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
  headerStats: {
    flexDirection: 'row',
    gap: 8,
  },
  seedsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(50,205,50,0.2)',
    borderRadius: 20,
  },
  seedsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#32CD32',
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
  freeSeedsSection: {
    marginBottom: 24,
  },
  freeSeedsCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  freeSeedsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  freeSeedsTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  premiumFreeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,215,0,0.3)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  premiumFreeText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: '#FFD700',
  },
  freeSeedsDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 16,
    opacity: 0.9,
  },
  freeSeedsProgress: {
    alignItems: 'center',
    marginBottom: 16,
  },
  freeSeedsCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  freeSeedsCountText: {
    fontSize: 48,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  freeSeedsRemaining: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  claimButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  claimButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#228B22',
  },
  claimedButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  claimedButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    opacity: 0.7,
  },
  gemStoreCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  gemStoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  gemStoreIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gemStoreIconEmoji: {
    fontSize: 32,
  },
  gemStoreInfo: {
    flex: 1,
  },
  gemStoreTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  gemStoreDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  gemStorePriceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  gemStorePrice: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
});
