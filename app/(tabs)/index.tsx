import { StyleSheet, View, Text, Pressable, Animated, Dimensions, ScrollView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Plus, X, Trash2, Bell, Clock, Palette, Package, Share2, ShoppingBag, Gem } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useManifestations } from '@/contexts/ManifestationContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useBackgrounds } from '@/contexts/BackgroundContext';
import { useInventory } from '@/contexts/InventoryContext';
import { useRankings } from '@/contexts/RankingContext';
import { useCommunity } from '@/contexts/CommunityContext';
import InventoryScreen from '@/app/inventory';
import RankingsScreen from '@/app/rankings';
import { useEffect, useRef, useState, memo } from 'react';
import * as Haptics from 'expo-haptics';
import { Manifestation } from '@/types/manifestation';
import { Background } from '@/types/background';

const { width, height } = Dimensions.get('window');

const BackgroundStoreModal = memo(({ onClose }: { onClose: () => void }) => {
  const { backgrounds, selectedBackground, purchaseBackground, selectBackground, getBackgroundPrice } = useBackgrounds();
  const { isPremium } = usePremium();
  const [selectedBg, setSelectedBg] = useState<Background | null>(null);

  const handlePurchase = (bgId: string) => {
    purchaseBackground(bgId);
    selectBackground(bgId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedBg(null);
  };

  const handleSelect = (bg: Background) => {
    if (bg.isPurchased) {
      selectBackground(bg.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } else {
      setSelectedBg(bg);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.backgroundModal}>
        <View style={styles.modalHeader}>
          <Palette color="#FFD700" size={32} />
          <Pressable style={styles.closeButton} onPress={onClose}>
            <X color="#fff" size={24} />
          </Pressable>
        </View>

        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.notificationTitle}>Background Store</Text>
          <Text style={styles.notificationSubtitle}>Customize your manifestation garden</Text>

          <View style={styles.backgroundGrid}>
            {backgrounds.map((bg) => (
              <Pressable
                key={bg.id}
                style={[
                  styles.backgroundCard,
                  selectedBackground.id === bg.id && styles.backgroundCardSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleSelect(bg);
                }}
              >
                <LinearGradient
                  colors={bg.colors as any}
                  style={styles.backgroundPreview}
                >
                  <Text style={styles.backgroundPreviewEmoji}>{bg.preview}</Text>
                </LinearGradient>
                <Text style={styles.backgroundName}>{bg.name}</Text>
                {bg.isPurchased ? (
                  selectedBackground.id === bg.id ? (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedText}>Selected</Text>
                    </View>
                  ) : (
                    <View style={styles.ownedBadge}>
                      <Text style={styles.ownedText}>Owned</Text>
                    </View>
                  )
                ) : (
                  <View style={styles.bgPriceTag}>
                    {isPremium && (
                      <Text style={styles.bgOriginalPrice}>${bg.price.toFixed(2)}</Text>
                    )}
                    <Text style={styles.bgPriceText}>${getBackgroundPrice(bg).toFixed(2)}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {selectedBg && !selectedBg.isPurchased && (
          <View style={styles.purchasePrompt}>
            <Text style={styles.purchasePromptTitle}>Purchase {selectedBg.name}?</Text>
            {isPremium && (
              <Text style={styles.purchasePromptDiscount}>👑 Premium: 50% OFF</Text>
            )}
            <View style={styles.purchaseActions}>
              <Pressable
                style={styles.purchaseCancelButton}
                onPress={() => setSelectedBg(null)}
              >
                <Text style={styles.purchaseCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.purchaseConfirmButton}
                onPress={() => handlePurchase(selectedBg.id)}
              >
                <LinearGradient
                  colors={['#9370DB', '#FF69B4']}
                  style={styles.purchaseConfirmGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.purchaseConfirmText}>
                    Buy for ${getBackgroundPrice(selectedBg).toFixed(2)}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
});

BackgroundStoreModal.displayName = 'BackgroundStoreModal';

const Star = memo(({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [delay, opacity, scale]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          opacity,
          transform: [{ scale }],
          left: Math.random() * width,
          top: Math.random() * height * 0.6,
        },
      ]}
    />
  );
});

Star.displayName = 'Star';

const ManifestationPlant = memo(({ manifestation, onNurture, onBoost, onPress }: { manifestation: Manifestation; onNurture: () => void; onBoost: () => void; onPress: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim, rotateAnim, sparkleAnim, scaleAnim]);

  const handlePress = () => {
    const stage = manifestation.stage;
    if (stage === 'blooming') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000);
    
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    onPress();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onBoost();
  };

  const getEmoji = () => {
    if (manifestation.stage === 'blooming') return '🌸';
    if (manifestation.stage === 'growing') return '🌿';
    if (manifestation.stage === 'sprout') return '🌱';
    return '🌰';
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      style={[styles.plantContainer, { left: manifestation.position.x, top: manifestation.position.y }]}
    >
      <Animated.View 
        style={[
          styles.plantGlow, 
          { 
            opacity: glowOpacity, 
            backgroundColor: manifestation.color,
            transform: [{ scale: Animated.multiply(glowScale, pulseAnim) }]
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.plantSparkle,
          {
            opacity: sparkleOpacity,
            transform: [{ scale: sparkleScale }],
            backgroundColor: manifestation.color,
          }
        ]}
      />
      {showParticles && (
        <>
          <Animated.View style={[styles.particle, { backgroundColor: manifestation.color, top: -20, left: 10, opacity: sparkleOpacity }]} />
          <Animated.View style={[styles.particle, { backgroundColor: manifestation.color, top: -15, left: 70, opacity: sparkleOpacity }]} />
          <Animated.View style={[styles.particle, { backgroundColor: manifestation.color, top: 10, left: -10, opacity: sparkleOpacity }]} />
          <Animated.View style={[styles.particle, { backgroundColor: manifestation.color, top: 15, left: 85, opacity: sparkleOpacity }]} />
        </>
      )}
      <Animated.Text 
        style={[
          styles.plantEmoji, 
          { 
            transform: [
              { scale: scaleAnim },
              { rotate }
            ] 
          }
        ]}
      >
        {getEmoji()}
      </Animated.Text>
      <View style={styles.energyBarContainer}>
        <View style={styles.energyBar}>
          <Animated.View 
            style={[
              styles.energyFill, 
              { 
                width: `${manifestation.energy}%`, 
                backgroundColor: manifestation.color 
              }
            ]} 
          />
        </View>
        <Text style={styles.energyText}>{manifestation.energy}%</Text>
      </View>
      <Pressable
        style={styles.quickNurtureButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onNurture();
        }}
      >
        <Text style={styles.quickNurtureIcon}>💫</Text>
      </Pressable>
    </Pressable>
  );
});

ManifestationPlant.displayName = 'ManifestationPlant';

export default function GardenScreen() {
  const router = useRouter();
  const { manifestations, nurtureManifestation, deleteManifestation, harvestManifestation } = useManifestations();
  const { shareManifestation } = useCommunity();
  const { isPremium, energyBoosts, energy, maxEnergy, streak, gems, consumeEnergyBoost, purchaseEnergyBoost, consumeEnergy, refillEnergy, earnGems } = usePremium();
  const { settings, permissionStatus, requestPermissions, updateSettings, rescheduleAllNotifications } = useNotifications();
  const { selectedBackground } = useBackgrounds();
  const [stars] = useState(() => Array.from({ length: 20 }, (_, i) => i));
  const [showBoostPrompt, setShowBoostPrompt] = useState(false);
  const [showEnergyPrompt, setShowEnergyPrompt] = useState(false);
  const [selectedManifestationId, setSelectedManifestationId] = useState<string | null>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showBackgroundStore, setShowBackgroundStore] = useState(false);
  const [showStreakReward, setShowStreakReward] = useState(false);
  const [tempHour, setTempHour] = useState(settings.dailyTime.hour);
  const [tempMinute, setTempMinute] = useState(settings.dailyTime.minute);
  const [showInventory, setShowInventory] = useState(false);
  const [showRankings, setShowRankings] = useState(false);
  const { getTotalSeeds } = useInventory();
  const { checkInStreak, updateSeedRankings } = useRankings();

  const handleNurture = (id: string) => {
    if (energy >= 1) {
      const success = consumeEnergy(1);
      if (success) {
        nurtureManifestation(id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else {
      setShowEnergyPrompt(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleBoostRequest = (id: string) => {
    if (energyBoosts > 0) {
      const success = consumeEnergyBoost();
      if (success) {
        nurtureManifestation(id);
        nurtureManifestation(id);
        nurtureManifestation(id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setShowBoostPrompt(true);
    }
  };

  const handleRefillEnergy = () => {
    refillEnergy();
    setShowEnergyPrompt(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  useEffect(() => {
    if (streak > 0 && streak % 7 === 0) {
      setShowStreakReward(true);
    }
  }, [streak]);

  useEffect(() => {
    const checkDailyGems = async () => {
      const today = new Date().toISOString().split('T')[0];
      const stored = await AsyncStorage.getItem('daily_gems_claimed');
      if (stored !== today) {
        earnGems(5, 'Daily login bonus');
        await AsyncStorage.setItem('daily_gems_claimed', today);
      }
    };
    checkDailyGems();
  }, [earnGems]);

  useEffect(() => {
    checkInStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateSeedRankings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePurchaseBoost = () => {
    purchaseEnergyBoost();
    setShowBoostPrompt(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleToggleNotifications = async () => {
    if (!settings.enabled && permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) {
        return;
      }
    }

    const newEnabled = !settings.enabled;
    await updateSettings({ enabled: newEnabled });

    if (newEnabled) {
      await rescheduleAllNotifications(manifestations.map(m => ({
        id: m.id,
        intention: m.intention,
        category: m.category
      })));
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveTime = async () => {
    await updateSettings({ dailyTime: { hour: tempHour, minute: tempMinute } });
    
    if (settings.enabled) {
      await rescheduleAllNotifications(manifestations.map(m => ({
        id: m.id,
        intention: m.intention,
        category: m.category
      })));
    }

    setShowNotificationSettings(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={selectedBackground.colors as any}
        style={styles.gradient}
      >
        {stars.map((i) => (
          <Star key={i} delay={i * 100} />
        ))}

        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Sparkles color="#fff" size={28} />
            <Text style={styles.title}>Your Manifestation Garden</Text>
          </View>
          <Text style={styles.subtitle}>Nurture your intentions into reality</Text>
          
          <View style={styles.topStatsContainer}>
            <View style={styles.statusBar}>
              <Pressable 
                style={styles.gemCounter}
                onPress={() => router.push('/shop')}
              >
                <Gem color="#9370DB" size={18} />
                <Text style={styles.gemCount}>{gems}</Text>
              </Pressable>
              
              <Pressable 
                style={styles.energyCounter}
                onPress={() => setShowEnergyPrompt(true)}
              >
                <Text style={styles.energyIcon}>💫</Text>
                <Text style={styles.energyCount}>{energy}/{maxEnergy}</Text>
              </Pressable>
              
              {streak > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakIcon}>🔥</Text>
                  <Text style={styles.streakCount}>{streak}</Text>
                </View>
              )}
              
              <Pressable 
                style={styles.boostCounter}
                onPress={() => setShowBoostPrompt(true)}
              >
                <Text style={styles.boostIcon}>⚡</Text>
                <Text style={styles.boostCount}>{energyBoosts}</Text>
              </Pressable>
            </View>

            <View style={styles.secondaryBar}>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>👑 PREMIUM</Text>
                </View>
              )}
              
              <Pressable 
                style={styles.quickActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/shop');
                }}
              >
                <ShoppingBag color="#FFD700" size={18} />
                <Text style={styles.quickActionText}>Shop</Text>
              </Pressable>
              
              <Pressable 
                style={styles.quickActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowInventory(true);
                }}
              >
                <Package color="#FFD700" size={18} />
                <Text style={styles.quickActionText}>Seeds</Text>
                {getTotalSeeds() > 0 && (
                  <View style={styles.quickActionBadge}>
                    <Text style={styles.quickActionBadgeText}>{getTotalSeeds()}</Text>
                  </View>
                )}
              </Pressable>
              
              <Pressable 
                style={styles.iconButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowBackgroundStore(true);
                }}
              >
                <Palette color="#b8a9d9" size={18} />
              </Pressable>
              
              <Pressable 
                style={[styles.iconButton, settings.enabled && styles.iconButtonActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowNotificationSettings(true);
                }}
              >
                <Bell color={settings.enabled ? '#FFD700' : '#b8a9d9'} size={18} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.gardenArea}>
          <View style={styles.gardenGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>
          {manifestations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyText}>Your garden awaits</Text>
              <Text style={styles.emptySubtext}>Plant your first intention to begin</Text>
            </View>
          ) : (
            <>
              {manifestations.map((m) => (
                <ManifestationPlant
                  key={m.id}
                  manifestation={m}
                  onNurture={() => handleNurture(m.id)}
                  onBoost={() => handleBoostRequest(m.id)}
                  onPress={() => setSelectedManifestationId(m.id)}
                />
              ))}
            </>
          )}
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/create');
          }}
        >
          <LinearGradient
            colors={['#9370DB', '#FF69B4']}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Plus color="#fff" size={32} strokeWidth={3} />
          </LinearGradient>
        </Pressable>

        {selectedManifestationId && (() => {
          const selectedManifestation = manifestations.find(m => m.id === selectedManifestationId);
          if (!selectedManifestation) return null;
          
          return (
          <Modal
            visible={true}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedManifestationId(null)}
          >
            <View style={styles.modalOverlay}>
              <Pressable 
                style={styles.modalBackdrop}
                onPress={() => setSelectedManifestationId(null)}
              />
              <View style={styles.detailModal}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailEmoji}>{selectedManifestation.stage === 'blooming' ? '🌸' : selectedManifestation.stage === 'growing' ? '🌿' : selectedManifestation.stage === 'sprout' ? '🌱' : '🌰'}</Text>
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setSelectedManifestationId(null)}
                  >
                    <X color="#fff" size={24} />
                  </Pressable>
                </View>

                <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
                  <Text style={styles.detailTitle}>Your Manifestation</Text>
                  <Text style={styles.detailIntention}>{selectedManifestation.intention}</Text>

                  <View style={styles.detailStats}>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>Stage</Text>
                      <Text style={styles.statValue}>{selectedManifestation.stage}</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>Energy</Text>
                      <Text style={styles.statValue}>{selectedManifestation.energy}%</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>Category</Text>
                      <Text style={styles.statValue}>{selectedManifestation.category}</Text>
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <Text style={styles.progressLabel}>Growth Progress</Text>
                    <View style={styles.progressBarLarge}>
                      <LinearGradient
                        colors={[selectedManifestation.color, selectedManifestation.color + '80']}
                        style={[styles.progressFill, { width: `${selectedManifestation.energy}%` }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                  </View>

                  <Text style={styles.detailAge}>Planted {Math.floor((Date.now() - selectedManifestation.createdAt) / (1000 * 60 * 60 * 24))} days ago</Text>

                  <Pressable
                    style={styles.nurtureButton}
                    onPress={() => {
                      if (energy >= 1) {
                        handleNurture(selectedManifestation.id);
                      } else {
                        setSelectedManifestationId(null);
                        setShowEnergyPrompt(true);
                      }
                    }}
                  >
                    <LinearGradient
                      colors={[selectedManifestation.color, selectedManifestation.color + '80']}
                      style={styles.nurtureButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Sparkles color="#fff" size={20} />
                      <Text style={styles.nurtureButtonText}>Nurture with Love (1 💫)</Text>
                    </LinearGradient>
                  </Pressable>

                  {selectedManifestation.stage === 'blooming' && (
                    <>
                      <Pressable
                        style={styles.shareButton}
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          shareManifestation(
                            selectedManifestation.intention,
                            selectedManifestation.category,
                            selectedManifestation.color,
                            selectedManifestation.rarity
                          );
                          harvestManifestation(selectedManifestation.id);
                          setSelectedManifestationId(null);
                        }}
                      >
                        <LinearGradient
                          colors={['#FF69B4', '#9370DB']}
                          style={styles.nurtureButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Share2 color="#fff" size={20} />
                          <Text style={styles.nurtureButtonText}>Share to Community</Text>
                        </LinearGradient>
                      </Pressable>
                      <Pressable
                        style={styles.harvestButton}
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          harvestManifestation(selectedManifestation.id);
                          setSelectedManifestationId(null);
                        }}
                      >
                        <LinearGradient
                          colors={['#32CD32', '#228B22']}
                          style={styles.nurtureButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Package color="#fff" size={20} />
                          <Text style={styles.nurtureButtonText}>Harvest (Keep Private)</Text>
                        </LinearGradient>
                      </Pressable>
                    </>
                  )}

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                      deleteManifestation(selectedManifestation.id);
                      setSelectedManifestationId(null);
                    }}
                  >
                    <Trash2 color="#ff4444" size={18} />
                    <Text style={styles.deleteButtonText}>Release Manifestation</Text>
                  </Pressable>
                </ScrollView>
              </View>
            </View>
          </Modal>
          );
        })()}

        {showNotificationSettings && (
          <Modal
            visible={true}
            transparent
            animationType="fade"
            onRequestClose={() => setShowNotificationSettings(false)}
          >
            <View style={styles.modalOverlay}>
              <Pressable 
                style={styles.modalBackdrop}
                onPress={() => setShowNotificationSettings(false)}
              />
              <View style={styles.notificationModal}>
                <View style={styles.modalHeader}>
                  <Bell color="#FFD700" size={32} />
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setShowNotificationSettings(false)}
                  >
                    <X color="#fff" size={24} />
                  </Pressable>
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.notificationTitle}>Daily Reminders</Text>
                  <Text style={styles.notificationSubtitle}>Get daily notifications with your manifestation intentions</Text>

                  <Pressable
                    style={styles.toggleRow}
                    onPress={handleToggleNotifications}
                  >
                    <View>
                      <Text style={styles.toggleLabel}>Enable Reminders</Text>
                      <Text style={styles.toggleSubtext}>Receive daily manifestation reminders</Text>
                    </View>
                    <View style={[styles.toggle, settings.enabled && styles.toggleActive]}>
                      <View style={[styles.toggleThumb, settings.enabled && styles.toggleThumbActive]} />
                    </View>
                  </Pressable>

                  {permissionStatus !== 'granted' && (
                    <View style={styles.permissionWarning}>
                      <Text style={styles.permissionText}>⚠️ Notification permissions required</Text>
                    </View>
                  )}

                  <View style={styles.timeSection}>
                    <View style={styles.timeSectionHeader}>
                      <Clock color="#b8a9d9" size={20} />
                      <Text style={styles.timeSectionTitle}>Reminder Time</Text>
                    </View>

                    <View style={styles.timePickers}>
                      <View style={styles.timePicker}>
                        <Text style={styles.timeLabel}>Hour</Text>
                        <View style={styles.timePickerControls}>
                          <Pressable
                            style={styles.timeButton}
                            onPress={() => {
                              setTempHour((h) => (h === 0 ? 23 : h - 1));
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                          >
                            <Text style={styles.timeButtonText}>−</Text>
                          </Pressable>
                          <View style={styles.timeValue}>
                            <Text style={styles.timeValueText}>{tempHour.toString().padStart(2, '0')}</Text>
                          </View>
                          <Pressable
                            style={styles.timeButton}
                            onPress={() => {
                              setTempHour((h) => (h === 23 ? 0 : h + 1));
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                          >
                            <Text style={styles.timeButtonText}>+</Text>
                          </Pressable>
                        </View>
                      </View>

                      <Text style={styles.timeColon}>:</Text>

                      <View style={styles.timePicker}>
                        <Text style={styles.timeLabel}>Minute</Text>
                        <View style={styles.timePickerControls}>
                          <Pressable
                            style={styles.timeButton}
                            onPress={() => {
                              setTempMinute((m) => (m === 0 ? 59 : m - 1));
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                          >
                            <Text style={styles.timeButtonText}>−</Text>
                          </Pressable>
                          <View style={styles.timeValue}>
                            <Text style={styles.timeValueText}>{tempMinute.toString().padStart(2, '0')}</Text>
                          </View>
                          <Pressable
                            style={styles.timeButton}
                            onPress={() => {
                              setTempMinute((m) => (m === 59 ? 0 : m + 1));
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                          >
                            <Text style={styles.timeButtonText}>+</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    style={styles.saveButton}
                    onPress={handleSaveTime}
                  >
                    <LinearGradient
                      colors={['#9370DB', '#FF69B4']}
                      style={styles.saveButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.saveButtonText}>Save Settings</Text>
                    </LinearGradient>
                  </Pressable>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}

        {showBackgroundStore && (
          <Modal
            visible={true}
            transparent
            animationType="fade"
            onRequestClose={() => setShowBackgroundStore(false)}
          >
            <BackgroundStoreModal onClose={() => setShowBackgroundStore(false)} />
          </Modal>
        )}

        {showEnergyPrompt && (
          <Modal
            visible={true}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEnergyPrompt(false)}
          >
            <View style={styles.modalOverlay}>
              <Pressable 
                style={styles.modalBackdrop}
                onPress={() => setShowEnergyPrompt(false)}
              />
              <View style={styles.boostModal}>
                <Text style={styles.boostModalTitle}>Out of Energy</Text>
                <Text style={styles.boostModalText}>
                  Energy refills daily! Come back tomorrow or watch an ad to continue playing.
                </Text>
                
                <View style={styles.energyInfoBox}>
                  <Text style={styles.energyInfoIcon}>💫</Text>
                  <View>
                    <Text style={styles.energyInfoText}>Current: {energy}/{maxEnergy}</Text>
                    <Text style={styles.energyInfoSubtext}>Refills at midnight</Text>
                  </View>
                </View>

                <Pressable
                  style={styles.boostButton}
                  onPress={handleRefillEnergy}
                >
                  <LinearGradient
                    colors={['#9370DB', '#FF69B4']}
                    style={styles.boostButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.boostButtonText}>Watch Ad for Full Refill</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowEnergyPrompt(false)}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}

        {showStreakReward && (
          <Modal
            visible={true}
            transparent
            animationType="fade"
            onRequestClose={() => setShowStreakReward(false)}
          >
            <View style={styles.modalOverlay}>
              <Pressable 
                style={styles.modalBackdrop}
                onPress={() => setShowStreakReward(false)}
              />
              <View style={styles.streakModal}>
                <Text style={styles.streakModalEmoji}>🔥</Text>
                <Text style={styles.boostModalTitle}>{streak} Day Streak!</Text>
                <Text style={styles.boostModalText}>
                  Amazing dedication! You&apos;ve been manifesting for {streak} days in a row!
                </Text>
                
                <View style={styles.rewardBox}>
                  <Text style={styles.rewardText}>Reward: +10 Energy Boosts</Text>
                </View>

                <Pressable
                  style={styles.boostButton}
                  onPress={() => {
                    purchaseEnergyBoost();
                    setShowStreakReward(false);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.boostButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.boostButtonText}>Claim Reward</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}

        {showBoostPrompt && (
          <View style={styles.modalOverlay}>
            <Pressable 
              style={styles.modalBackdrop}
              onPress={() => setShowBoostPrompt(false)}
            />
            <View style={styles.boostModal}>
              <Text style={styles.boostModalTitle}>Energy Boost</Text>
              <Text style={styles.boostModalText}>
                {energyBoosts > 0 
                  ? 'Use an energy boost to give your manifestation a powerful surge of growth!' 
                  : 'Purchase energy boosts to accelerate your manifestations!'}
              </Text>
              
              <View style={styles.boostInfo}>
                <Text style={styles.boostInfoIcon}>⚡</Text>
                <Text style={styles.boostInfoText}>1 Boost = 3x Nurture Power</Text>
              </View>

              <Pressable
                style={styles.boostButton}
                onPress={handlePurchaseBoost}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.boostButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.boostButtonText}>Get 10 Boosts - $2.99</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowBoostPrompt(false)}
              >
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </Pressable>
            </View>
          </View>
        )}

        <InventoryScreen visible={showInventory} onClose={() => setShowInventory(false)} />
        <RankingsScreen visible={showRankings} onClose={() => setShowRankings(false)} />
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
    position: 'relative',
  },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 1.5,
    zIndex: 0,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    zIndex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#b8a9d9',
    marginLeft: 40,
  },
  gardenArea: {
    flex: 1,
    position: 'relative',
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 1,
  },
  gardenGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    opacity: 0.08,
    pointerEvents: 'none',
  },
  gridLine: {
    width: 1,
    height: '100%',
    backgroundColor: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#b8a9d9',
  },
  plantContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 100,
    height: 100,
    zIndex: 2,
  },
  plantGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    top: -10,
    left: 15,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  plantSparkle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    top: -20,
    left: 5,
    opacity: 0.3,
  },
  plantEmoji: {
    fontSize: 48,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginLeft: 26,
  },
  energyBarContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  energyBar: {
    width: 70,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  energyFill: {
    height: '100%',
    borderRadius: 3,
  },
  energyText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.3,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  quickNurtureButton: {
    position: 'absolute',
    top: -10,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  quickNurtureIcon: {
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  addButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topStatsContainer: {
    marginTop: 16,
    gap: 8,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    flexWrap: 'wrap',
  },
  secondaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    flexWrap: 'wrap',
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  boostCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.4)',
  },
  boostIcon: {
    fontSize: 14,
  },
  boostCount: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFA500',
  },
  gemCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 112, 219, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(147, 112, 219, 0.5)',
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  gemCount: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#9370DB',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(184, 169, 217, 0.4)',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1001,
  },
  boostModal: {
    backgroundColor: '#2d1b4e',
    borderRadius: 24,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(255, 165, 0, 0.4)',
    zIndex: 1002,
  },
  boostModalTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  boostModalText: {
    fontSize: 16,
    color: '#b8a9d9',
    textAlign: 'center' as const,
    marginBottom: 20,
    lineHeight: 22,
  },
  boostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  boostInfoIcon: {
    fontSize: 24,
  },
  boostInfoText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFA500',
  },
  boostButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  boostButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  boostButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#b8a9d9',
  },
  detailModal: {
    backgroundColor: '#2d1b4e',
    borderRadius: 24,
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1002,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailEmoji: {
    fontSize: 48,
  },
  closeButton: {
    padding: 8,
  },
  detailContent: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#b8a9d9',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  detailIntention: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    lineHeight: 32,
    marginBottom: 24,
  },
  detailStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#b8a9d9',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    textTransform: 'capitalize' as const,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#b8a9d9',
    marginBottom: 8,
  },
  progressBarLarge: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  detailAge: {
    fontSize: 14,
    color: '#b8a9d9',
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  nurtureButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  nurtureButtonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nurtureButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  shareButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  harvestButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: '600' as const,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(184, 169, 217, 0.4)',
  },
  notificationButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  notificationModal: {
    backgroundColor: '#2d1b4e',
    borderRadius: 24,
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.8,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    zIndex: 1002,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalScroll: {
    padding: 20,
  },
  notificationTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#b8a9d9',
    marginBottom: 24,
    lineHeight: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  toggleSubtext: {
    fontSize: 12,
    color: '#b8a9d9',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#FFD700',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  permissionWarning: {
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  permissionText: {
    fontSize: 14,
    color: '#FFA500',
    textAlign: 'center' as const,
  },
  timeSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  timeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  timeSectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  timePickers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  timePicker: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#b8a9d9',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  timePickerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600' as const,
  },
  timeValue: {
    width: 60,
    height: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  timeValueText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  timeColon: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFD700',
    marginTop: 24,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  backgroundModal: {
    backgroundColor: '#2d1b4e',
    borderRadius: 24,
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.85,
    borderWidth: 2,
    borderColor: 'rgba(147, 112, 219, 0.4)',
    zIndex: 1002,
  },
  backgroundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backgroundCard: {
    width: (width * 0.9 - 72) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  backgroundCardSelected: {
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  backgroundPreview: {
    height: 110,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  backgroundPreviewEmoji: {
    fontSize: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  backgroundName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  selectedBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  selectedText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFD700',
    textAlign: 'center' as const,
  },
  ownedBadge: {
    backgroundColor: 'rgba(50, 205, 50, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(50, 205, 50, 0.5)',
  },
  ownedText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#32CD32',
    textAlign: 'center' as const,
  },
  bgPriceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bgOriginalPrice: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#b8a9d9',
    textDecorationLine: 'line-through' as const,
  },
  bgPriceText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  purchasePrompt: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  purchasePromptTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  purchasePromptDiscount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFD700',
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  purchaseActions: {
    flexDirection: 'row',
    gap: 12,
  },
  purchaseCancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  purchaseCancelText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#b8a9d9',
  },
  purchaseConfirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  purchaseConfirmGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  purchaseConfirmText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
  energyCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 112, 219, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(147, 112, 219, 0.4)',
  },
  energyIcon: {
    fontSize: 14,
  },
  energyCount: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#9370DB',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.4)',
  },
  streakIcon: {
    fontSize: 14,
  },
  streakCount: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FF4500',
  },
  energyInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 112, 219, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 12,
  },
  energyInfoIcon: {
    fontSize: 32,
  },
  energyInfoText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#9370DB',
  },
  energyInfoSubtext: {
    fontSize: 12,
    color: '#b8a9d9',
    marginTop: 2,
  },
  streakModal: {
    backgroundColor: '#2d1b4e',
    borderRadius: 24,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(255, 69, 0, 0.4)',
    zIndex: 1002,
    alignItems: 'center',
  },
  streakModalEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  rewardBox: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  rewardText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFD700',
    textAlign: 'center' as const,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginLeft: 40,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  quickActionBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF69B4',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#2d1b4e',
  },
  quickActionBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
