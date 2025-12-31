import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Copy, Trophy, Flame, Sparkles, User } from 'lucide-react-native';
import { useCommunity } from '@/contexts/CommunityContext';
import { useRankings } from '@/contexts/RankingContext';
import { useManifestations } from '@/contexts/ManifestationContext';
import { useInventory } from '@/contexts/InventoryContext';
import { SeedRarity } from '@/types/community';

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<'feed' | 'rankings'>('feed');
  const [rankingType, setRankingType] = useState<'bloomed' | 'legendary' | 'streaks'>('bloomed');
  
  const { sharedManifestations, toggleLike } = useCommunity();
  const { bloomedRankings, legendaryRankings, streakRankings } = useRankings();
  const { addManifestation } = useManifestations();
  const { useSeed: consumeSeed, getSeedsByRarity } = useInventory();

  const getRarityColor = (rarity: SeedRarity) => {
    switch (rarity) {
      case 'common': return '#90EE90';
      case 'rare': return '#4169E1';
      case 'epic': return '#9370DB';
      case 'legendary': return '#FFD700';
      default: return '#90EE90';
    }
  };

  const getRarityLabel = (rarity: SeedRarity) => {
    if (!rarity) return 'Common';
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const handleCopyToGarden = (manifestation: any) => {
    const rarityToUse = manifestation.rarity || 'common';
    const availableSeeds = getSeedsByRarity(rarityToUse);
    
    if (availableSeeds === 0) {
      Alert.alert(
        '🌱 Need Seeds!',
        `You need a ${getRarityLabel(rarityToUse)} seed to plant this manifestation. Visit the Shop to get more seeds!`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      '🌱 Plant Manifestation?',
      `This will use 1 ${getRarityLabel(rarityToUse)} seed. You have ${availableSeeds} ${getRarityLabel(rarityToUse)} seeds available.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Plant',
          style: 'default',
          onPress: () => {
            const seedWasUsed = consumeSeed(rarityToUse);
            if (seedWasUsed) {
              addManifestation({
                intention: manifestation.intention,
                category: manifestation.category,
                color: manifestation.color,
                position: { x: 0, y: 0 },
                rarity: rarityToUse,
              });
              Alert.alert(
                '✨ Planted!',
                `"${manifestation.intention}" has been planted in your garden!`,
                [{ text: 'Great!', style: 'default' }]
              );
            } else {
              Alert.alert('Error', 'Failed to use seed. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderFeedTab = () => (
    <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>🌸 Bloomed Manifestations</Text>
        <Text style={styles.feedSubtitle}>
          Discover and plant manifestations from the community
        </Text>
      </View>

      {sharedManifestations.map((manifestation) => (
        <View key={manifestation.id} style={styles.manifestationCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <TouchableOpacity
                style={styles.userInfo}
                onPress={() => router.push({ pathname: '/profile', params: { username: manifestation.username } })}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {manifestation.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.username}>{manifestation.username}</Text>
                  <Text style={styles.category}>
                    {manifestation.category.charAt(0).toUpperCase() + manifestation.category.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.categoryBadgeContainer}>
                <View
                  style={[
                    styles.rarityBadge,
                    { backgroundColor: getRarityColor(manifestation.rarity || 'common') + '30' },
                  ]}
                >
                  <Text style={[styles.rarityText, { color: getRarityColor(manifestation.rarity || 'common') }]}>
                    {getRarityLabel(manifestation.rarity || 'common')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: manifestation.color + '30' },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: manifestation.color },
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.intentionContainer}>
              <Text style={styles.intentionText}>{manifestation.intention}</Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleLike(manifestation.id)}
              >
                <Heart
                  size={20}
                  color={manifestation.likedByUser ? '#FF69B4' : '#b8a9d9'}
                  fill={manifestation.likedByUser ? '#FF69B4' : 'transparent'}
                />
                <Text
                  style={[
                    styles.actionText,
                    manifestation.likedByUser && styles.likedText,
                  ]}
                >
                  {manifestation.likes}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.plantButton}
                onPress={() => handleCopyToGarden(manifestation)}
              >
                <Copy size={18} color="#fff" />
                <Text style={styles.plantButtonText}>Plant in My Garden</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      ))}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

  const renderRankingsTab = () => {
    const rankings = rankingType === 'bloomed' ? bloomedRankings : 
                     rankingType === 'legendary' ? legendaryRankings : 
                     streakRankings;
    
    return (
      <ScrollView style={styles.rankingsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.rankingHeader}>
          <Text style={styles.rankingTitle}>🏆 Global Rankings</Text>
          <View style={styles.rankingToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                rankingType === 'bloomed' && styles.toggleButtonActive,
              ]}
              onPress={() => setRankingType('bloomed')}
            >
              <Sparkles
                size={16}
                color={rankingType === 'bloomed' ? '#fff' : '#b8a9d9'}
              />
              <Text
                style={[
                  styles.toggleText,
                  rankingType === 'bloomed' && styles.toggleTextActive,
                ]}
              >
                Bloomed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                rankingType === 'legendary' && styles.toggleButtonActive,
              ]}
              onPress={() => setRankingType('legendary')}
            >
              <Trophy
                size={16}
                color={rankingType === 'legendary' ? '#fff' : '#b8a9d9'}
              />
              <Text
                style={[
                  styles.toggleText,
                  rankingType === 'legendary' && styles.toggleTextActive,
                ]}
              >
                Legendary
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                rankingType === 'streaks' && styles.toggleButtonActive,
              ]}
              onPress={() => setRankingType('streaks')}
            >
              <Flame
                size={16}
                color={rankingType === 'streaks' ? '#fff' : '#b8a9d9'}
              />
              <Text
                style={[
                  styles.toggleText,
                  rankingType === 'streaks' && styles.toggleTextActive,
                ]}
              >
                Streaks
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {rankings.slice(0, 3).map((ranking, index) => {
          const isUser = ranking.id === 'user';
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
          
          return (
            <View key={ranking.id} style={styles.topRankCard}>
              <LinearGradient
                colors={
                  index === 0
                    ? ['rgba(255,215,0,0.3)', 'rgba(255,215,0,0.1)']
                    : index === 1
                    ? ['rgba(192,192,192,0.3)', 'rgba(192,192,192,0.1)']
                    : ['rgba(205,127,50,0.3)', 'rgba(205,127,50,0.1)']
                }
                style={styles.topRankGradient}
              >
                <View style={styles.rankLeft}>
                  <Text style={styles.medal}>{medal}</Text>
                  <View>
                    <Text style={styles.rankNumber}>#{ranking.rank}</Text>
                    <Text style={[styles.rankUsername, isUser && styles.userRank]}>
                      {ranking.username}
                    </Text>
                  </View>
                </View>
                <View style={styles.rankRight}>
                  <Text style={styles.rankScore}>{ranking.score}</Text>
                  <Text style={styles.rankLabel}>
                    {rankingType === 'bloomed' ? 'Bloomed' : rankingType === 'legendary' ? 'Legendary' : 'Days'}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          );
        })}

        <View style={styles.otherRanksList}>
          {rankings.slice(3).map((ranking) => {
            const isUser = ranking.id === 'user';
            
            return (
              <View
                key={ranking.id}
                style={[styles.rankItem, isUser && styles.userRankItem]}
              >
                <View style={styles.rankLeft}>
                  <Text style={styles.rankNumber}>#{ranking.rank}</Text>
                  <Text style={[styles.rankUsername, isUser && styles.userRank]}>
                    {ranking.username}
                  </Text>
                </View>
                <View style={styles.rankRight}>
                  <Text style={styles.rankScore}>{ranking.score}</Text>
                  <Text style={styles.rankLabel}>
                    {rankingType === 'bloomed' ? 'Bloomed' : rankingType === 'legendary' ? 'Legendary' : 'Days'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
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
              <Text style={styles.title}>Community</Text>
              <Text style={styles.subtitle}>Connect & Share Manifestations</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <User size={20} color="#FF69B4" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'feed' && styles.tabActive]}
              onPress={() => setActiveTab('feed')}
            >
              <Sparkles
                size={20}
                color={activeTab === 'feed' ? '#FF69B4' : '#b8a9d9'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'feed' && styles.tabTextActive,
                ]}
              >
                Feed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'rankings' && styles.tabActive]}
              onPress={() => setActiveTab('rankings')}
            >
              <Trophy
                size={20}
                color={activeTab === 'rankings' ? '#FF69B4' : '#b8a9d9'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'rankings' && styles.tabTextActive,
                ]}
              >
                Rankings
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'feed' ? renderFeedTab() : renderRankingsTab()}
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,105,180,0.2)',
    borderWidth: 2,
    borderColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#b8a9d9',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabActive: {
    backgroundColor: 'rgba(255,105,180,0.25)',
    borderColor: 'rgba(255,105,180,0.5)',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#b8a9d9',
  },
  tabTextActive: {
    color: '#FF69B4',
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  feedHeader: {
    marginBottom: 20,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  feedSubtitle: {
    fontSize: 13,
    color: '#b8a9d9',
  },
  manifestationCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,105,180,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FF69B4',
  },
  username: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  category: {
    fontSize: 12,
    color: '#b8a9d9',
  },
  categoryBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
  },
  categoryBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  intentionContainer: {
    paddingVertical: 12,
    marginBottom: 12,
  },
  intentionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
    fontWeight: '500' as const,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#b8a9d9',
  },
  likedText: {
    color: '#FF69B4',
  },
  plantButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF69B4',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  plantButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  rankingsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  rankingHeader: {
    marginBottom: 20,
  },
  rankingTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 12,
  },
  rankingToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(255,105,180,0.3)',
    borderColor: 'rgba(255,105,180,0.5)',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#b8a9d9',
  },
  toggleTextActive: {
    color: '#fff',
  },
  topRankCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  topRankGradient: {
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  medal: {
    fontSize: 28,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#b8a9d9',
    minWidth: 40,
  },
  rankUsername: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    flex: 1,
  },
  userRank: {
    color: '#FF69B4',
  },
  rankRight: {
    alignItems: 'flex-end',
  },
  rankScore: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  rankLabel: {
    fontSize: 12,
    color: '#b8a9d9',
    marginTop: 2,
  },
  otherRanksList: {
    gap: 8,
    marginTop: 8,
  },
  rankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  userRankItem: {
    backgroundColor: 'rgba(255,105,180,0.1)',
    borderColor: 'rgba(255,105,180,0.3)',
  },
  bottomSpacer: {
    height: 100,
  },
});
