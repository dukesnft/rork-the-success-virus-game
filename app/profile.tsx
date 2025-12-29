import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Sparkles, Flame, Trophy, Plus, Check } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCommunity } from '@/contexts/CommunityContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useManifestations } from '@/contexts/ManifestationContext';
import { useRankings } from '@/contexts/RankingContext';
import { SeedRarity } from '@/types/manifestation';

export default function ProfileScreen() {
  const { username: otherUsername } = useLocalSearchParams();
  const { username: myUsername } = useCommunity();
  const { topManifestations, addToTopManifestations, removeFromTopManifestations } = useProfile();
  const { manifestations } = useManifestations();
  const { seedRankings, streakRankings } = useRankings();
  const [showManifestationPicker, setShowManifestationPicker] = useState(false);

  const isOwnProfile = !otherUsername || otherUsername === myUsername;
  const displayUsername = isOwnProfile ? myUsername : (Array.isArray(otherUsername) ? otherUsername[0] : otherUsername);

  const userRanking = seedRankings.find(r => r.username === displayUsername);
  const streakRanking = streakRankings.find(r => r.username === displayUsername);

  const getRarityColor = (rarity: SeedRarity) => {
    switch (rarity) {
      case 'common': return '#90EE90';
      case 'rare': return '#4169E1';
      case 'epic': return '#9370DB';
      case 'legendary': return '#FFD700';
      default: return '#90EE90';
    }
  };

  const getRarityGradient = (rarity: SeedRarity): [string, string] => {
    switch (rarity) {
      case 'common': return ['rgba(144,238,144,0.3)', 'rgba(144,238,144,0.1)'];
      case 'rare': return ['rgba(65,105,225,0.3)', 'rgba(65,105,225,0.1)'];
      case 'epic': return ['rgba(147,112,219,0.3)', 'rgba(147,112,219,0.1)'];
      case 'legendary': return ['rgba(255,215,0,0.3)', 'rgba(255,215,0,0.1)'];
      default: return ['rgba(144,238,144,0.3)', 'rgba(144,238,144,0.1)'];
    }
  };

  const getRarityLabel = (rarity: SeedRarity) => {
    if (!rarity) return 'Common';
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const handleAddManifestation = (manifestation: any) => {
    if (topManifestations.length >= 3) {
      Alert.alert('Limit Reached', 'You can only showcase 3 manifestations. Remove one first.');
      return;
    }

    addToTopManifestations({
      id: manifestation.id,
      intention: manifestation.intention,
      category: manifestation.category,
      color: manifestation.color,
      rarity: manifestation.rarity,
    });

    setShowManifestationPicker(false);
  };

  const handleRemoveManifestation = (id: string) => {
    Alert.alert(
      'Remove from Profile?',
      'This will remove the manifestation from your showcase.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromTopManifestations(id) },
      ]
    );
  };

  const bloomedManifestations = manifestations.filter(m => m.stage === 'blooming');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a0a2e', '#2d1b4e', '#1a0a2e']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>
                  {displayUsername?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.username}>{displayUsername}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Sparkles size={24} color="#FF69B4" />
                <Text style={styles.statValue}>{userRanking?.score || 0}</Text>
                <Text style={styles.statLabel}>Seeds</Text>
                <Text style={styles.statRank}>#{userRanking?.rank || '-'}</Text>
              </View>

              <View style={styles.statBox}>
                <Flame size={24} color="#FF6347" />
                <Text style={styles.statValue}>{streakRanking?.score || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
                <Text style={styles.statRank}>#{streakRanking?.rank || '-'}</Text>
              </View>

              <View style={styles.statBox}>
                <Trophy size={24} color="#FFD700" />
                <Text style={styles.statValue}>
                  {Math.max(userRanking?.rank || 99, streakRanking?.rank || 99) <= 3 ? '🏆' : '-'}
                </Text>
                <Text style={styles.statLabel}>Top 3</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>✨ Top 3 Manifestations</Text>
                {isOwnProfile && topManifestations.length < 3 && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowManifestationPicker(true)}
                  >
                    <Plus size={18} color="#FF69B4" />
                  </TouchableOpacity>
                )}
              </View>

              {topManifestations.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {isOwnProfile
                      ? 'Showcase your best manifestations! Tap + to add one.'
                      : 'No manifestations showcased yet'}
                  </Text>
                </View>
              ) : (
                <View style={styles.manifestationsList}>
                  {topManifestations.map((manifestation, index) => (
                    <View key={manifestation.id} style={styles.manifestationItem}>
                      <LinearGradient
                        colors={getRarityGradient(manifestation.rarity)}
                        style={styles.manifestationGradient}
                      >
                        <View style={styles.manifestationRank}>
                          <Text style={styles.rankNumber}>#{index + 1}</Text>
                        </View>

                        <View style={styles.manifestationContent}>
                          <View style={styles.manifestationHeader}>
                            <View
                              style={[
                                styles.rarityBadge,
                                { backgroundColor: getRarityColor(manifestation.rarity) + '40' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.rarityText,
                                  { color: getRarityColor(manifestation.rarity) },
                                ]}
                              >
                                {getRarityLabel(manifestation.rarity)}
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

                          <Text style={styles.intentionText}>
                            {manifestation.intention}
                          </Text>

                          {isOwnProfile && (
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => handleRemoveManifestation(manifestation.id)}
                            >
                              <X size={16} color="#FF69B4" />
                              <Text style={styles.removeButtonText}>Remove</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </LinearGradient>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <Modal
        visible={showManifestationPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowManifestationPicker(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1a0a2e', '#2d1b4e', '#1a0a2e']}
            style={styles.modalGradient}
          >
            <SafeAreaView style={styles.modalSafeArea} edges={['top']}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select a Manifestation</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowManifestationPicker(false)}
                >
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalSubtitle}>
                  Choose from your bloomed manifestations
                </Text>

                {bloomedManifestations.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      You don&apos;t have any bloomed manifestations yet. Keep nurturing your seeds!
                    </Text>
                  </View>
                ) : (
                  <View style={styles.pickerList}>
                    {bloomedManifestations.map((manifestation) => {
                      const isSelected = topManifestations.some(
                        t => t.id === manifestation.id
                      );

                      return (
                        <TouchableOpacity
                          key={manifestation.id}
                          style={styles.pickerItem}
                          onPress={() => handleAddManifestation(manifestation)}
                          disabled={isSelected}
                        >
                          <LinearGradient
                            colors={getRarityGradient(manifestation.rarity)}
                            style={[
                              styles.pickerGradient,
                              isSelected && styles.pickerGradientSelected,
                            ]}
                          >
                            <View style={styles.pickerLeft}>
                              <View
                                style={[
                                  styles.rarityBadge,
                                  {
                                    backgroundColor:
                                      getRarityColor(manifestation.rarity) + '40',
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.rarityText,
                                    { color: getRarityColor(manifestation.rarity) },
                                  ]}
                                >
                                  {getRarityLabel(manifestation.rarity)}
                                </Text>
                              </View>
                              <Text
                                style={styles.pickerIntention}
                                numberOfLines={2}
                              >
                                {manifestation.intention}
                              </Text>
                            </View>

                            {isSelected && (
                              <View style={styles.selectedBadge}>
                                <Check size={20} color="#fff" />
                              </View>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                <View style={styles.bottomSpacer} />
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </View>
      </Modal>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,105,180,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FF69B4',
  },
  avatarLargeText: {
    fontSize: 42,
    fontWeight: 'bold' as const,
    color: '#FF69B4',
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#b8a9d9',
    marginTop: 4,
  },
  statRank: {
    fontSize: 11,
    color: '#FF69B4',
    marginTop: 4,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,105,180,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF69B4',
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#b8a9d9',
    textAlign: 'center',
    lineHeight: 20,
  },
  manifestationsList: {
    gap: 16,
  },
  manifestationItem: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  manifestationGradient: {
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 16,
  },
  manifestationRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  manifestationContent: {
    flex: 1,
  },
  manifestationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  intentionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fff',
    fontWeight: '500' as const,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    fontSize: 13,
    color: '#FF69B4',
    fontWeight: '600' as const,
  },
  modalContainer: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollView: {
    flex: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#b8a9d9',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 16,
  },
  pickerList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  pickerItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  pickerGradient: {
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerGradientSelected: {
    opacity: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pickerLeft: {
    flex: 1,
    gap: 8,
  },
  pickerIntention: {
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
    fontWeight: '500' as const,
  },
  selectedBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});
