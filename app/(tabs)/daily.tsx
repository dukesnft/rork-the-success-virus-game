import { StyleSheet, View, Text, ScrollView, Pressable, Dimensions, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sun, Sparkles, Plus, X, RefreshCw } from 'lucide-react-native';
import { useDailyManifestations } from '@/contexts/DailyManifestationContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useManifestations } from '@/contexts/ManifestationContext';
import { useState, useRef } from 'react';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

function DailyCard({ text, category, used, onPress }: { text: string; category: string; used: boolean; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (used) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacityAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress();
  };

  return (
    <Pressable onPress={handlePress} disabled={used}>
      <Animated.View style={[styles.card, used && styles.cardUsed, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <LinearGradient
          colors={used ? ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'] : ['rgba(255, 215, 0, 0.15)', 'rgba(255, 105, 180, 0.15)']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, used && styles.categoryBadgeUsed]}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
            {used && (
              <View style={styles.usedBadge}>
                <Text style={styles.usedText}>✓ Used</Text>
              </View>
            )}
          </View>
          <Text style={[styles.cardText, used && styles.cardTextUsed]}>{text}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export default function WeeklyManifestationsScreen() {
  const { manifestations, baseCount, totalCount, extraSlots, markAsUsed, purchaseExtraSlots, refreshWeekly } = useDailyManifestations();
  const { isPremium } = usePremium();
  const { addManifestation } = useManifestations();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedManifestation, setSelectedManifestation] = useState<string>('');

  const handleUse = (id: string, text: string, category: string) => {
    markAsUsed(id);
    
    const validCategories = ['abundance', 'love', 'health', 'success', 'peace'] as const;
    const manifestationCategory = validCategories.includes(category.toLowerCase() as any)
      ? (category.toLowerCase() as 'abundance' | 'love' | 'health' | 'success' | 'peace')
      : 'abundance';
    
    addManifestation({
      intention: text,
      category: manifestationCategory,
      color: '#FFD700',
      position: {
        x: Math.random() * (width - 80),
        y: Math.random() * 300 + 100,
      },
    });
    setSelectedManifestation(text);
    setShowSuccessModal(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handlePurchase = (count: number) => {
    purchaseExtraSlots(count);
    setShowPurchaseModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1a', '#1a0a2e', '#2d1b4e']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Sun color="#FFD700" size={32} />
              <Text style={styles.title}>Weekly Manifestations</Text>
            </View>
            <Text style={styles.subtitle}>Personalized affirmations for this week</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{baseCount}</Text>
                <Text style={styles.statLabel}>{isPremium ? 'Premium' : 'Free'}</Text>
              </View>
              {extraSlots > 0 && (
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>+{extraSlots}</Text>
                  <Text style={styles.statLabel}>Extra</Text>
                </View>
              )}
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalCount}</Text>
                <Text style={styles.statLabel}>Total This Week</Text>
              </View>
            </View>

            {!isPremium && (
              <Pressable 
                style={styles.upgradePrompt}
                onPress={() => {}}
              >
                <Text style={styles.upgradeText}>👑 Upgrade to Premium for 5 weekly manifestations</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.cardsContainer}>
            {manifestations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>✨</Text>
                <Text style={styles.emptyText}>Generating your weekly manifestations...</Text>
                <Pressable
                  style={styles.refreshButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    refreshWeekly();
                  }}
                >
                  <RefreshCw color="#FFD700" size={20} />
                  <Text style={styles.refreshText}>Refresh</Text>
                </Pressable>
              </View>
            ) : (
              manifestations.map((m) => (
                <DailyCard
                  key={m.id}
                  text={m.text}
                  category={m.category}
                  used={m.used}
                  onPress={() => handleUse(m.id, m.text, m.category)}
                />
              ))
            )}

            <Pressable
              style={styles.addMoreButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowPurchaseModal(true);
              }}
            >
              <LinearGradient
                colors={['#9370DB', '#FF69B4']}
                style={styles.addMoreGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Plus color="#fff" size={24} strokeWidth={3} />
                <Text style={styles.addMoreText}>Get More Manifestations</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>How it works</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoEmoji}>📅</Text>
              <Text style={styles.infoText}>New manifestations generated weekly (every Monday)</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoEmoji}>✨</Text>
              <Text style={styles.infoText}>Personalized based on your planted intentions</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoEmoji}>🌱</Text>
              <Text style={styles.infoText}>Tap to plant in your garden</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoEmoji}>💫</Text>
              <Text style={styles.infoText}>Premium users get 5 weekly, free users get 1</Text>
            </View>
          </View>
        </ScrollView>

        {showPurchaseModal && (
          <Modal
            visible={true}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPurchaseModal(false)}
          >
            <View style={styles.modalOverlay}>
              <Pressable 
                style={styles.modalBackdrop}
                onPress={() => setShowPurchaseModal(false)}
              />
              <View style={styles.purchaseModal}>
                <View style={styles.modalHeader}>
                  <Sparkles color="#FFD700" size={32} />
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setShowPurchaseModal(false)}
                  >
                    <X color="#fff" size={24} />
                  </Pressable>
                </View>

                <Text style={styles.modalTitle}>Get More Manifestations</Text>
                <Text style={styles.modalSubtitle}>Purchase extra slots for this week</Text>

                <View style={styles.purchaseOptions}>
                  <Pressable
                    style={styles.purchaseOption}
                    onPress={() => handlePurchase(3)}
                  >
                    <LinearGradient
                      colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.1)']}
                      style={styles.purchaseOptionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.purchaseCount}>+3</Text>
                      <Text style={styles.purchaseLabel}>Manifestations</Text>
                      <Text style={styles.purchasePrice}>$1.99</Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    style={styles.purchaseOption}
                    onPress={() => handlePurchase(5)}
                  >
                    <LinearGradient
                      colors={['rgba(255, 105, 180, 0.2)', 'rgba(255, 105, 180, 0.1)']}
                      style={styles.purchaseOptionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>POPULAR</Text>
                      </View>
                      <Text style={styles.purchaseCount}>+5</Text>
                      <Text style={styles.purchaseLabel}>Manifestations</Text>
                      <Text style={styles.purchasePrice}>$2.99</Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    style={styles.purchaseOption}
                    onPress={() => handlePurchase(10)}
                  >
                    <LinearGradient
                      colors={['rgba(147, 112, 219, 0.2)', 'rgba(147, 112, 219, 0.1)']}
                      style={styles.purchaseOptionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.purchaseCount}>+10</Text>
                      <Text style={styles.purchaseLabel}>Manifestations</Text>
                      <Text style={styles.purchasePrice}>$4.99</Text>
                    </LinearGradient>
                  </Pressable>
                </View>

                <Text style={styles.purchaseNote}>Extra slots are added for this week only</Text>
              </View>
            </View>
          </Modal>
        )}

        {showSuccessModal && (
          <Modal
            visible={true}
            transparent
            animationType="fade"
            onRequestClose={() => setShowSuccessModal(false)}
          >
            <View style={styles.modalOverlay}>
              <Pressable 
                style={styles.modalBackdrop}
                onPress={() => setShowSuccessModal(false)}
              />
              <View style={styles.successModal}>
                <Text style={styles.successEmoji}>🌟</Text>
                <Text style={styles.successTitle}>Planted in Your Garden!</Text>
                <Text style={styles.successText}>{selectedManifestation}</Text>
                <Pressable
                  style={styles.successButton}
                  onPress={() => setShowSuccessModal(false)}
                >
                  <LinearGradient
                    colors={['#9370DB', '#FF69B4']}
                    style={styles.successButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.successButtonText}>Continue</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  titleRow: {
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
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFD700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#b8a9d9',
  },
  upgradePrompt: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  upgradeText: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center' as const,
  },
  cardsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  cardUsed: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  categoryBadgeUsed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFD700',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  usedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  usedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#4CAF50',
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    lineHeight: 26,
  },
  cardTextUsed: {
    color: '#b8a9d9',
  },
  addMoreButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addMoreGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoEmoji: {
    fontSize: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#b8a9d9',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#b8a9d9',
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  refreshText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  purchaseModal: {
    backgroundColor: '#2d1b4e',
    borderRadius: 24,
    width: width * 0.9,
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    textAlign: 'center' as const,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#b8a9d9',
    textAlign: 'center' as const,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  purchaseOptions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  purchaseOption: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  purchaseOptionGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF69B4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  purchaseCount: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  purchaseLabel: {
    fontSize: 14,
    color: '#b8a9d9',
    marginBottom: 8,
  },
  purchasePrice: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  purchaseNote: {
    fontSize: 12,
    color: '#b8a9d9',
    textAlign: 'center' as const,
    padding: 20,
  },
  successModal: {
    backgroundColor: '#2d1b4e',
    borderRadius: 24,
    padding: 32,
    width: width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  successText: {
    fontSize: 16,
    color: '#b8a9d9',
    textAlign: 'center' as const,
    lineHeight: 24,
    marginBottom: 24,
  },
  successButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  successButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
