import { StyleSheet, View, Text, ScrollView, Pressable, Modal, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Package, Sparkles, Flame, Zap } from 'lucide-react-native';
import { useInventory } from '@/contexts/InventoryContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, memo, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { SeedRarity } from '@/types/inventory';

interface InventoryScreenProps {
  visible: boolean;
  onClose: () => void;
}

const getCategoryEmoji = (category: string): string => {
  switch (category) {
    case 'abundance': return '💰';
    case 'love': return '💕';
    case 'health': return '🌿';
    case 'success': return '⭐';
    case 'peace': return '☮️';
    default: return '✨';
  }
};

const getStageIcon = (stage: string): string => {
  switch (stage) {
    case 'sprout': return '🌱';
    case 'growing': return '🌿';
    case 'blooming': return '🌸';
    default: return '🌱';
  }
};

const getRarityFromColor = (color: string): SeedRarity => {
  if (color.toLowerCase().includes('ffd700') || color.toLowerCase().includes('ffa500')) return 'legendary';
  if (color.toLowerCase().includes('9370db') || color.toLowerCase().includes('8a2be2')) return 'epic';
  if (color.toLowerCase().includes('4169e1') || color.toLowerCase().includes('1e90ff')) return 'rare';
  return 'common';
};

const getRarityColor = (rarity: SeedRarity): string => {
  switch (rarity) {
    case 'legendary': return '#FFD700';
    case 'epic': return '#9370DB';
    case 'rare': return '#4169E1';
    case 'common': return '#90EE90';
  }
};

const InventoryItem = memo(function InventoryItem({ 
  item, 
  isSelected, 
  onSelect, 
  selectable 
}: { 
  item: any; 
  isSelected?: boolean; 
  onSelect?: () => void; 
  selectable?: boolean; 
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const content = (
    <Animated.View style={[styles.inventoryItem, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={[item.color + '40', item.color + '20']}
        style={[styles.itemGradient, isSelected && styles.itemSelected]}
      >
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>✓</Text>
          </View>
        )}
        <View style={styles.itemHeader}>
          <Text style={styles.itemEmoji}>{getCategoryEmoji(item.category)}</Text>
          <Text style={styles.itemStage}>{getStageIcon(item.stage)}</Text>
        </View>
        <Text style={styles.itemIntention} numberOfLines={2}>{item.intention}</Text>
        <View style={styles.itemFooter}>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.itemDate}>
            {new Date(item.collectedAt).toLocaleDateString()}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (selectable && onSelect) {
    return (
      <Pressable onPress={onSelect} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {content}
      </Pressable>
    );
  }

  return content;
});

export default function InventoryScreen({ visible, onClose }: InventoryScreenProps) {
  const insets = useSafeAreaInsets();
  const { inventory, getTotalSeeds, getBloomingSeeds, burnBloomsForSeed } = useInventory();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [burningMode, setBurningMode] = useState(false);
  const [selectedBlooms, setSelectedBlooms] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [burnResult, setBurnResult] = useState<SeedRarity | null>(null);
  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const groupedInventory = {
    sprout: inventory.filter(i => i.stage === 'sprout'),
    growing: inventory.filter(i => i.stage === 'growing'),
    blooming: inventory.filter(i => i.stage === 'blooming'),
  };

  const handleToggleBloom = (id: string) => {
    setSelectedBlooms(prev => {
      if (prev.includes(id)) {
        return prev.filter(bloomId => bloomId !== id);
      }
      if (prev.length < 5) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return [...prev, id];
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return prev;
    });
  };

  const getPredictedRarity = (): { dominant: SeedRarity; chance: number } => {
    if (selectedBlooms.length === 0) return { dominant: 'common', chance: 0 };
    
    const selectedItems = selectedBlooms.map(id => inventory.find(i => i.id === id)).filter(Boolean);
    const rarities = selectedItems.map(item => getRarityFromColor(item!.color));
    
    const rarityCounts = rarities.reduce((acc, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {} as Record<SeedRarity, number>);
    
    const dominant = Object.entries(rarityCounts).sort(([,a], [,b]) => b - a)[0]?.[0] as SeedRarity || 'common';
    const dominantCount = rarityCounts[dominant];
    
    let chance = 70;
    if (dominant === 'legendary' && dominantCount === 5) chance = 70;
    else if (dominant === 'legendary' && dominantCount >= 3) chance = 50;
    else if (dominant === 'legendary') chance = 25;
    
    return { dominant, chance };
  };

  const handleBurn = () => {
    if (selectedBlooms.length !== 5) {
      Alert.alert('Invalid Selection', 'You must select exactly 5 blooming manifestations to burn.');
      return;
    }

    Alert.alert(
      'Confirm Burning',
      'Are you sure you want to burn these 5 blooming manifestations? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Burn',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const result = burnBloomsForSeed(selectedBlooms);
            if (result) {
              setBurnResult(result);
              setShowResult(true);
              setSelectedBlooms([]);
              setBurningMode(false);
              
              Animated.sequence([
                Animated.spring(resultAnim, {
                  toValue: 1,
                  useNativeDriver: true,
                  tension: 50,
                  friction: 7,
                }),
                Animated.delay(3000),
                Animated.timing(resultAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                setShowResult(false);
                setBurnResult(null);
              });
            }
          },
        },
      ]
    );
  };

  const prediction = getPredictedRarity();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <Animated.View 
          style={[
            styles.modalContainer,
            { 
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY }],
            }
          ]}
        >
          <LinearGradient
            colors={['#2a0845', '#1a0a2e']}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Package color="#FFD700" size={32} />
                <Text style={styles.title}>Seed Inventory</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={handleClose}>
                <X color="#fff" size={28} />
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{getTotalSeeds()}</Text>
                <Text style={styles.statLabel}>Total Seeds</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{getBloomingSeeds()}</Text>
                <Text style={styles.statLabel}>Blooming</Text>
              </View>
            </View>

            {groupedInventory.blooming.length >= 5 && (
              <Pressable
                style={[styles.burnButton, burningMode && styles.burnButtonActive]}
                onPress={() => {
                  setBurningMode(!burningMode);
                  setSelectedBlooms([]);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <LinearGradient
                  colors={burningMode ? ['#FF4500', '#FF6347'] : ['#FF69B4', '#9370DB']}
                  style={styles.burnButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Flame color="#fff" size={24} />
                  <Text style={styles.burnButtonText}>
                    {burningMode ? 'Cancel Burning' : '🔥 Burning Station'}
                  </Text>
                </LinearGradient>
              </Pressable>
            )}

            {burningMode && (
              <View style={styles.burningPanel}>
                <LinearGradient
                  colors={['rgba(255, 69, 0, 0.2)', 'rgba(255, 99, 71, 0.2)']}
                  style={styles.burningPanelGradient}
                >
                  <Text style={styles.burningTitle}>Select 5 Blooms to Burn</Text>
                  <View style={styles.burningInfo}>
                    <View style={styles.burningCounter}>
                      <Text style={styles.burningCounterText}>{selectedBlooms.length}/5</Text>
                    </View>
                    {selectedBlooms.length === 5 && prediction.dominant && (
                      <View style={styles.predictionBox}>
                        <Zap color={getRarityColor(prediction.dominant)} size={16} />
                        <Text style={[styles.predictionText, { color: getRarityColor(prediction.dominant) }]}>
                          ~{prediction.chance}% {prediction.dominant}
                        </Text>
                      </View>
                    )}
                  </View>
                  {selectedBlooms.length === 5 && (
                    <Pressable style={styles.confirmBurnButton} onPress={handleBurn}>
                      <LinearGradient
                        colors={['#FF4500', '#FF6347']}
                        style={styles.confirmBurnGradient}
                      >
                        <Flame color="#fff" size={20} />
                        <Text style={styles.confirmBurnText}>Burn for Seed</Text>
                      </LinearGradient>
                    </Pressable>
                  )}
                </LinearGradient>
              </View>
            )}

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {inventory.length === 0 ? (
                <View style={styles.emptyState}>
                  <Sparkles color="#b8a9d9" size={64} />
                  <Text style={styles.emptyTitle}>No Seeds Yet</Text>
                  <Text style={styles.emptyText}>
                    Harvest your sprouted manifestations to add them to your inventory!
                  </Text>
                </View>
              ) : (
                <>
                  {groupedInventory.blooming.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>🌸 Blooming Seeds</Text>
                      <View style={styles.grid}>
                        {groupedInventory.blooming.map(item => (
                          <InventoryItem 
                            key={item.id} 
                            item={item}
                            isSelected={selectedBlooms.includes(item.id)}
                            onSelect={() => handleToggleBloom(item.id)}
                            selectable={burningMode}
                          />
                        ))}
                      </View>
                    </View>
                  )}

                  {groupedInventory.growing.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>🌿 Growing Seeds</Text>
                      <View style={styles.grid}>
                        {groupedInventory.growing.map(item => (
                          <InventoryItem key={item.id} item={item} />
                        ))}
                      </View>
                    </View>
                  )}

                  {groupedInventory.sprout.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>🌱 Sprout Seeds</Text>
                      <View style={styles.grid}>
                        {groupedInventory.sprout.map(item => (
                          <InventoryItem key={item.id} item={item} />
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
            
            {showResult && burnResult && (
              <Animated.View 
                style={[
                  styles.resultOverlay,
                  {
                    opacity: resultAnim,
                    transform: [
                      {
                        scale: resultAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.8)']}
                  style={styles.resultGradient}
                >
                  <Sparkles color={getRarityColor(burnResult)} size={64} />
                  <Text style={styles.resultTitle}>Burning Complete!</Text>
                  <Text style={[styles.resultRarity, { color: getRarityColor(burnResult) }]}>
                    {burnResult.toUpperCase()} SEED
                  </Text>
                  <Text style={styles.resultSubtext}>Check your seed inventory</Text>
                </LinearGradient>
              </Animated.View>
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    maxHeight: '90%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFD700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#b8a9d9',
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inventoryItem: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemGradient: {
    padding: 16,
    minHeight: 140,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemEmoji: {
    fontSize: 32,
  },
  itemStage: {
    fontSize: 24,
  },
  itemIntention: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 12,
    minHeight: 36,
  },
  itemFooter: {
    marginTop: 'auto',
  },
  itemCategory: {
    fontSize: 12,
    color: '#b8a9d9',
    fontWeight: '600' as const,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#b8a9d9',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  itemSelected: {
    borderWidth: 3,
    borderColor: '#FF4500',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF4500',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  burnButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  burnButtonActive: {
    shadowColor: '#FF4500',
    shadowOpacity: 0.6,
  },
  burnButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  burnButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  burningPanel: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  burningPanelGradient: {
    padding: 20,
  },
  burningTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  burningInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  burningCounter: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  burningCounterText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  predictionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  predictionText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  confirmBurnButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmBurnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  confirmBurnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  resultGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    minWidth: 280,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
  },
  resultRarity: {
    fontSize: 32,
    fontWeight: '800' as const,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
  },
  resultSubtext: {
    fontSize: 14,
    color: '#b8a9d9',
    textAlign: 'center' as const,
  },
});
