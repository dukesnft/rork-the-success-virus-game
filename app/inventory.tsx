import { StyleSheet, View, Text, ScrollView, Pressable, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Package, Sparkles } from 'lucide-react-native';
import { useInventory } from '@/contexts/InventoryContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, memo } from 'react';
import * as Haptics from 'expo-haptics';

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

const InventoryItem = memo(function InventoryItem({ item }: { item: any }) {return (
  <View style={styles.inventoryItem}>
    <LinearGradient
      colors={[item.color + '40', item.color + '20']}
      style={styles.itemGradient}
    >
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
  </View>
);});

export default function InventoryScreen({ visible, onClose }: InventoryScreenProps) {
  const insets = useSafeAreaInsets();
  const { inventory, getTotalSeeds, getBloomingSeeds } = useInventory();
  const slideAnim = useRef(new Animated.Value(0)).current;

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
                          <InventoryItem key={item.id} item={item} />
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
});
