import { StyleSheet, View, Text, ScrollView, Pressable, Modal, Animated, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Trophy, Flame, Award, Edit2 } from 'lucide-react-native';
import { useRankings } from '@/contexts/RankingContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState, memo } from 'react';
import * as Haptics from 'expo-haptics';

interface RankingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

const RankingItem = memo(function RankingItem({ 
  rank, 
  username, 
  score, 
  isUser,
  subtitle,
  totalSpent 
}: { 
  rank: number; 
  username: string; 
  score: number; 
  isUser: boolean;
  subtitle?: string;
  totalSpent: number;
}) {
  const getRankColor = (rank: number): string => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#b8a9d9';
  };

  const getRankIcon = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const meetsSpendRequirement = () => {
    if (rank === 1) return totalSpent >= 700;
    if (rank === 2) return totalSpent >= 500;
    if (rank === 3) return totalSpent >= 300;
    return true;
  };

  const getSpendRequirement = () => {
    if (rank === 1) return 700;
    if (rank === 2) return 500;
    if (rank === 3) return 300;
    return 0;
  };

  return (
    <View style={[styles.rankingItem, isUser && styles.rankingItemUser]}>
      <Text style={[styles.rankNumber, { color: getRankColor(rank) }]}>
        {getRankIcon(rank)}
      </Text>
      <View style={styles.rankingInfo}>
        <Text style={[styles.rankUsername, isUser && styles.rankUsernameUser]}>
          {username} {isUser && '👑'}
        </Text>
        {subtitle && <Text style={styles.rankSubtitle}>{subtitle}</Text>}
        {rank <= 3 && (
          <Text style={[styles.spendBadge, meetsSpendRequirement() ? styles.spendMet : styles.spendNotMet]}>
            ${totalSpent.toFixed(0)} / ${getSpendRequirement()} spent
          </Text>
        )}
      </View>
      <Text style={[styles.rankScore, isUser && styles.rankScoreUser]}>{score}</Text>
    </View>
  );
});

export default function RankingsScreen({ visible, onClose }: RankingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { 
    seedRankings, 
    streakRankings, 
    userData, 
    setUsername,
    getUserSeedRank,
    getUserStreakRank 
  } = useRankings();
  const [activeTab, setActiveTab] = useState<'seeds' | 'streaks'>('seeds');
  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(userData.username);
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

  const handleTabChange = (tab: 'seeds' | 'streaks') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleSaveUsername = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      setEditingUsername(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const currentRankings = activeTab === 'seeds' ? seedRankings : streakRankings;
  const userRank = activeTab === 'seeds' ? getUserSeedRank() : getUserStreakRank();

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
                <Trophy color="#FFD700" size={32} />
                <Text style={styles.title}>Global Rankings</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={handleClose}>
                <X color="#fff" size={28} />
              </Pressable>
            </View>

            <View style={styles.usernameCard}>
              {editingUsername ? (
                <View style={styles.usernameEdit}>
                  <TextInput
                    style={styles.usernameInput}
                    value={tempUsername}
                    onChangeText={setTempUsername}
                    placeholder="Enter username"
                    placeholderTextColor="#b8a9d9"
                    maxLength={20}
                    autoFocus
                  />
                  <Pressable style={styles.saveButton} onPress={handleSaveUsername}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable 
                  style={styles.usernameDisplay}
                  onPress={() => setEditingUsername(true)}
                >
                  <Text style={styles.usernameText}>{userData.username}</Text>
                  <Edit2 color="#b8a9d9" size={20} />
                </Pressable>
              )}
            </View>

            <View style={styles.tabsContainer}>
              <Pressable 
                style={[styles.tab, activeTab === 'seeds' && styles.tabActive]}
                onPress={() => handleTabChange('seeds')}
              >
                <Award color={activeTab === 'seeds' ? '#FFD700' : '#b8a9d9'} size={24} />
                <Text style={[styles.tabText, activeTab === 'seeds' && styles.tabTextActive]}>
                  Seeds
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.tab, activeTab === 'streaks' && styles.tabActive]}
                onPress={() => handleTabChange('streaks')}
              >
                <Flame color={activeTab === 'streaks' ? '#FFD700' : '#b8a9d9'} size={24} />
                <Text style={[styles.tabText, activeTab === 'streaks' && styles.tabTextActive]}>
                  Streaks
                </Text>
              </Pressable>
            </View>

            {userRank > 0 && (
              <View style={styles.userRankCard}>
                <Text style={styles.userRankLabel}>Your Rank</Text>
                <Text style={styles.userRankValue}>#{userRank}</Text>
              </View>
            )}

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {currentRankings.length === 0 ? (
                <View style={styles.emptyState}>
                  <Trophy color="#b8a9d9" size={64} />
                  <Text style={styles.emptyTitle}>No Rankings Yet</Text>
                  <Text style={styles.emptyText}>
                    Start collecting seeds to appear on the leaderboard!
                  </Text>
                </View>
              ) : (
                <View style={styles.rankingsList}>
                  {currentRankings.map((ranking) => {
                    const isUser = ranking.id === 'user';
                    let subtitle = '';
                    
                    if (activeTab === 'seeds') {
                      const seedRanking = ranking as any;
                      subtitle = `${seedRanking.bloomingSeeds} blooming`;
                    } else {
                      const streakRanking = ranking as any;
                      subtitle = `Longest: ${streakRanking.longestStreak} days`;
                    }

                    return (
                      <RankingItem
                        key={ranking.id}
                        rank={ranking.rank}
                        username={ranking.username}
                        score={ranking.score}
                        isUser={isUser}
                        subtitle={subtitle}
                        totalSpent={ranking.totalSpent}
                      />
                    );
                  })}
                </View>
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
    marginBottom: 20,
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
  usernameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  usernameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  usernameText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  usernameEdit: {
    flexDirection: 'row',
    gap: 12,
  },
  usernameInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600' as const,
  },
  saveButton: {
    backgroundColor: '#FF69B4',
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#b8a9d9',
  },
  tabTextActive: {
    color: '#FFD700',
  },
  userRankCard: {
    backgroundColor: 'rgba(255, 105, 180, 0.2)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  userRankLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  userRankValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  scrollView: {
    flex: 1,
  },
  rankingsList: {
    gap: 12,
    paddingBottom: 20,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  rankingItemUser: {
    backgroundColor: 'rgba(255, 105, 180, 0.2)',
    borderWidth: 2,
    borderColor: '#FF69B4',
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    minWidth: 50,
  },
  rankingInfo: {
    flex: 1,
  },
  rankUsername: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 2,
  },
  rankUsernameUser: {
    color: '#FFD700',
  },
  rankSubtitle: {
    fontSize: 12,
    color: '#b8a9d9',
  },
  spendBadge: {
    fontSize: 11,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  spendMet: {
    color: '#4ade80',
  },
  spendNotMet: {
    color: '#f87171',
  },
  rankScore: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  rankScoreUser: {
    color: '#FF69B4',
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
