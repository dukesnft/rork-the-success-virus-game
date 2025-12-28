import { StyleSheet, View, Text, Pressable, ScrollView, Animated, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { List, Sparkles, Calendar, TrendingUp, Trophy, Target, Package, X } from 'lucide-react-native';
import { useManifestations } from '@/contexts/ManifestationContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { useQuests } from '@/contexts/QuestContext';
import { useInventory } from '@/contexts/InventoryContext';
import { useState, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { Manifestation } from '@/types/manifestation';
import InventoryScreen from '@/app/inventory';



const CATEGORY_COLORS = {
  abundance: '#FFD700',
  love: '#FF69B4',
  health: '#32CD32',
  success: '#9370DB',
  peace: '#87CEEB',
};

const CATEGORY_EMOJIS = {
  abundance: '💰',
  love: '💗',
  health: '🌿',
  success: '🎯',
  peace: '☮️',
};

function ManifestationCard({ manifestation }: { manifestation: Manifestation }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getEmoji = () => {
    if (manifestation.stage === 'blooming') return '🌸';
    if (manifestation.stage === 'growing') return '🌿';
    if (manifestation.stage === 'sprout') return '🌱';
    return '🌰';
  };

  const daysPlanted = Math.floor((Date.now() - manifestation.createdAt) / (1000 * 60 * 60 * 24));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={[manifestation.color + '20', manifestation.color + '10']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>{getEmoji()}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[manifestation.category] + '30' }]}>
            <Text style={styles.categoryEmoji}>{CATEGORY_EMOJIS[manifestation.category]}</Text>
            <Text style={[styles.categoryText, { color: CATEGORY_COLORS[manifestation.category] }]}>
              {manifestation.category}
            </Text>
          </View>
        </View>

        <Text style={styles.cardIntention}>{manifestation.intention}</Text>

        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <TrendingUp color="#b8a9d9" size={16} />
            <Text style={styles.statText}>{manifestation.stage}</Text>
          </View>
          <View style={styles.statItem}>
            <Sparkles color="#b8a9d9" size={16} />
            <Text style={styles.statText}>{manifestation.energy}% Energy</Text>
          </View>
          <View style={styles.statItem}>
            <Calendar color="#b8a9d9" size={16} />
            <Text style={styles.statText}>{daysPlanted}d ago</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${manifestation.energy}%`, 
                backgroundColor: manifestation.color 
              }
            ]} 
          />
        </View>
      </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export default function ManifestationsScreen() {
  const { manifestations } = useManifestations();
  const { achievements, getUnlockedCount, getTotalCount } = useAchievements();
  const { quests, getCompletedCount, getTotalCount: getQuestsTotalCount } = useQuests();
  const { getTotalSeedsCount } = useInventory();
  const [filter, setFilter] = useState<'all' | 'seed' | 'sprout' | 'growing' | 'blooming'>('all');
  const [showInventory, setShowInventory] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showQuests, setShowQuests] = useState(false);

  const filteredManifestations = filter === 'all' 
    ? manifestations 
    : manifestations.filter(m => m.stage === filter);

  const stats = {
    total: manifestations.length,
    seed: manifestations.filter(m => m.stage === 'seed').length,
    sprout: manifestations.filter(m => m.stage === 'sprout').length,
    growing: manifestations.filter(m => m.stage === 'growing').length,
    blooming: manifestations.filter(m => m.stage === 'blooming').length,
  };

  const FilterButton = ({ 
    label, 
    value, 
    emoji 
  }: { 
    label: string; 
    value: 'all' | 'seed' | 'sprout' | 'growing' | 'blooming'; 
    emoji: string;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
    <Pressable
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => {
        setFilter(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Text style={styles.filterEmoji}>{emoji}</Text>
      <Text style={[styles.filterLabel, filter === value && styles.filterLabelActive]}>
        {label}
      </Text>
    </Pressable>
    </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1a', '#1a0a2e', '#2d1b4e']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <List color="#fff" size={32} />
              <Text style={styles.title}>Your Manifestations</Text>
            </View>
            <Text style={styles.subtitle}>Track and review your planted intentions</Text>
          </View>

          <View style={styles.quickAccessRow}>
            <Pressable 
              style={styles.quickAccessCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowQuests(true);
              }}
            >
              <LinearGradient
                colors={['rgba(147, 112, 219, 0.3)', 'rgba(255, 105, 180, 0.3)']}
                style={styles.quickAccessGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Target color="#FFD700" size={24} />
                <Text style={styles.quickAccessLabel}>Quests</Text>
                <Text style={styles.quickAccessValue}>{getCompletedCount()}/{getQuestsTotalCount()}</Text>
              </LinearGradient>
            </Pressable>
            
            <Pressable 
              style={styles.quickAccessCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAchievements(true);
              }}
            >
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.3)', 'rgba(255, 165, 0, 0.3)']}
                style={styles.quickAccessGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Trophy color="#FFD700" size={24} />
                <Text style={styles.quickAccessLabel}>Achievements</Text>
                <Text style={styles.quickAccessValue}>{getUnlockedCount()}/{getTotalCount()}</Text>
              </LinearGradient>
            </Pressable>
            
            <Pressable 
              style={styles.quickAccessCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowInventory(true);
              }}
            >
              <LinearGradient
                colors={['rgba(50, 205, 50, 0.3)', 'rgba(34, 139, 34, 0.3)']}
                style={styles.quickAccessGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Package color="#32CD32" size={24} />
                <Text style={styles.quickAccessLabel}>Seeds</Text>
                <Text style={styles.quickAccessValue}>{getTotalSeedsCount()}</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.statsContainer}>
            <LinearGradient
              colors={['rgba(147, 112, 219, 0.2)', 'rgba(255, 105, 180, 0.2)']}
              style={styles.statsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.blooming}</Text>
                <Text style={styles.statLabel}>Blooming</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.growing}</Text>
                <Text style={styles.statLabel}>Growing</Text>
              </View>
            </LinearGradient>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            <FilterButton label="All" value="all" emoji="✨" />
            <FilterButton label="Seeds" value="seed" emoji="🌰" />
            <FilterButton label="Sprouts" value="sprout" emoji="🌱" />
            <FilterButton label="Growing" value="growing" emoji="🌿" />
            <FilterButton label="Blooming" value="blooming" emoji="🌸" />
          </ScrollView>

          <View style={styles.listContainer}>
            {filteredManifestations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🌙</Text>
                <Text style={styles.emptyText}>
                  {filter === 'all' 
                    ? 'No manifestations planted yet' 
                    : `No ${filter} manifestations`}
                </Text>
                <Text style={styles.emptySubtext}>
                  {filter === 'all'
                    ? 'Visit the Garden tab to plant your first intention'
                    : 'Try a different filter'}
                </Text>
              </View>
            ) : (
              filteredManifestations.map((manifestation) => (
                <ManifestationCard key={manifestation.id} manifestation={manifestation} />
              ))
            )}
          </View>
        </ScrollView>

        <InventoryScreen visible={showInventory} onClose={() => setShowInventory(false)} />

        {showAchievements && (
          <Modal visible={true} transparent animationType="fade" onRequestClose={() => setShowAchievements(false)}>
            <View style={styles.modalOverlay}>
              <Pressable style={styles.modalBackdrop} onPress={() => setShowAchievements(false)} />
              <View style={styles.modal}>
                <View style={styles.modalHeader}>
                  <Trophy color="#FFD700" size={32} />
                  <Pressable style={styles.closeButton} onPress={() => setShowAchievements(false)}>
                    <X color="#fff" size={24} />
                  </Pressable>
                </View>
                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalTitle}>Achievements</Text>
                  <Text style={styles.modalSubtitle}>
                    {getUnlockedCount()}/{getTotalCount()} Unlocked
                  </Text>
                  {achievements.map((achievement) => (
                    <View
                      key={achievement.id}
                      style={[
                        styles.achievementCard,
                        achievement.unlocked && styles.achievementCardUnlocked,
                      ]}
                    >
                      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                      <View style={styles.achievementInfo}>
                        <Text style={styles.achievementTitle}>{achievement.title}</Text>
                        <Text style={styles.achievementDescription}>{achievement.description}</Text>
                        <View style={styles.achievementProgress}>
                          <View style={styles.achievementProgressBar}>
                            <View
                              style={[
                                styles.achievementProgressFill,
                                {
                                  width: `${(achievement.currentValue / achievement.targetValue) * 100}%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.achievementProgressText}>
                            {achievement.currentValue}/{achievement.targetValue}
                          </Text>
                        </View>
                        {achievement.unlocked && (
                          <View style={styles.achievementRewardBadge}>
                            <Text style={styles.achievementRewardText}>✓ Unlocked</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}

        {showQuests && (
          <Modal visible={true} transparent animationType="fade" onRequestClose={() => setShowQuests(false)}>
            <View style={styles.modalOverlay}>
              <Pressable style={styles.modalBackdrop} onPress={() => setShowQuests(false)} />
              <View style={styles.modal}>
                <View style={styles.modalHeader}>
                  <Target color="#FFD700" size={32} />
                  <Pressable style={styles.closeButton} onPress={() => setShowQuests(false)}>
                    <X color="#fff" size={24} />
                  </Pressable>
                </View>
                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalTitle}>Daily Quests</Text>
                  <Text style={styles.modalSubtitle}>
                    {getCompletedCount()}/{getQuestsTotalCount()} Completed Today
                  </Text>
                  {quests.map((quest) => (
                    <View
                      key={quest.id}
                      style={[styles.questCard, quest.completed && styles.questCardCompleted]}
                    >
                      <View style={styles.questHeader}>
                        <Text style={styles.questTitle}>{quest.title}</Text>
                        {quest.completed && <Text style={styles.questCompletedBadge}>✓</Text>}
                      </View>
                      <Text style={styles.questDescription}>{quest.description}</Text>
                      <View style={styles.questProgress}>
                        <View style={styles.questProgressBar}>
                          <LinearGradient
                            colors={['#9370DB', '#FF69B4']}
                            style={[
                              styles.questProgressFill,
                              { width: `${(quest.currentValue / quest.targetValue) * 100}%` },
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          />
                        </View>
                        <Text style={styles.questProgressText}>
                          {quest.currentValue}/{quest.targetValue}
                        </Text>
                      </View>
                      <View style={styles.questReward}>
                        <Sparkles color="#9370DB" size={16} />
                        <Text style={styles.questRewardText}>+{quest.reward.gems} gems</Text>
                        {quest.reward.energy && (
                          <>
                            <Text style={styles.questRewardSeparator}>•</Text>
                            <Text style={styles.questRewardText}>+{quest.reward.energy} energy</Text>
                          </>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
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
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#b8a9d9',
    marginLeft: 44,
  },
  statsContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGradient: {
    flexDirection: 'row',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#b8a9d9',
    fontWeight: '600' as const,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 105, 180, 0.25)',
    borderColor: '#FF69B4',
    borderWidth: 3,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  filterEmoji: {
    fontSize: 18,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#b8a9d9',
  },
  filterLabelActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  card: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardEmoji: {
    fontSize: 48,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700' as const,
    textTransform: 'capitalize' as const,
  },
  cardIntention: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    lineHeight: 28,
    marginBottom: 16,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#b8a9d9',
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#b8a9d9',
    textAlign: 'center' as const,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  quickAccessCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAccessGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
  },
  quickAccessLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#b8a9d9',
  },
  quickAccessValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#fff',
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
  modal: {
    backgroundColor: '#2d1b4e',
    borderRadius: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
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
  closeButton: {
    padding: 8,
  },
  modalScroll: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#b8a9d9',
    marginBottom: 24,
    lineHeight: 20,
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  achievementCardUnlocked: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  achievementIcon: {
    fontSize: 40,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 13,
    color: '#b8a9d9',
    marginBottom: 8,
  },
  achievementProgress: {
    marginBottom: 8,
  },
  achievementProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#9370DB',
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#b8a9d9',
    textAlign: 'right' as const,
  },
  achievementRewardBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  achievementRewardText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  questCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  questCardCompleted: {
    borderColor: '#32CD32',
    backgroundColor: 'rgba(50, 205, 50, 0.1)',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  questCompletedBadge: {
    fontSize: 20,
    color: '#32CD32',
  },
  questDescription: {
    fontSize: 14,
    color: '#b8a9d9',
    marginBottom: 12,
  },
  questProgress: {
    marginBottom: 12,
  },
  questProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  questProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  questProgressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#b8a9d9',
    textAlign: 'right' as const,
  },
  questReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  questRewardText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#9370DB',
  },
  questRewardSeparator: {
    fontSize: 13,
    color: '#b8a9d9',
  },
});
