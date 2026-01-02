import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Sparkles, Flame, Plus, Check, Edit2 } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCommunity } from '@/contexts/CommunityContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useInventory } from '@/contexts/InventoryContext';
import { useRankings } from '@/contexts/RankingContext';
import { SeedRarity } from '@/types/manifestation';

export default function ProfileScreen() {
  const { username: otherUsername } = useLocalSearchParams();
  const { username: communityUsername, updateUsername: updateCommunityUsername } = useCommunity();
  const { topManifestations, addToTopManifestations, removeFromTopManifestations, lastUsernameChange, setLastUsernameChange } = useProfile();
  const { inventory, getBloomingSeeds } = useInventory();
  const { bloomedRankings, streakRankings, userData, setUsername: setRankingUsername } = useRankings();
  const [showManifestationPicker, setShowManifestationPicker] = useState(false);
  const [showUsernameEdit, setShowUsernameEdit] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  const myUsername = userData.username !== 'You' ? userData.username : communityUsername;
  const isOwnProfile = !otherUsername || otherUsername === myUsername;
  const displayUsername = isOwnProfile ? myUsername : (Array.isArray(otherUsername) ? otherUsername[0] : otherUsername);

  const userRanking = isOwnProfile 
    ? bloomedRankings.find((r: any) => r.id === 'user') || { score: getBloomingSeeds(), rank: 0 }
    : bloomedRankings.find((r: any) => r.username === displayUsername);
  
  const streakRanking = isOwnProfile
    ? streakRankings.find((r: any) => r.id === 'user') || { score: userData.currentStreak, rank: 0, longestStreak: userData.longestStreak }
    : streakRankings.find((r: any) => r.username === displayUsername);

  const generateMockTopManifestations = useCallback((username: string) => {
    const intentions = {
      abundance: [
        'Financial freedom flows to me effortlessly',
        'I attract wealth and prosperity',
        'Abundance surrounds me daily',
        'Money comes to me in expected and unexpected ways'
      ],
      love: [
        'I am worthy of deep, meaningful love',
        'My relationships are filled with joy and harmony',
        'Love flows freely in my life',
        'I attract loving and supportive people'
      ],
      health: [
        'My body is strong, healthy, and vibrant',
        'I radiate energy and vitality',
        'Every cell in my body is healing',
        'I honor my body with healthy choices'
      ],
      success: [
        'I achieve my goals with ease',
        'Success is my natural state',
        'I am confident and capable',
        'Opportunities come to me effortlessly'
      ],
      peace: [
        'I am calm and centered in every moment',
        'Peace flows through my mind and body',
        'I release all worry and embrace tranquility',
        'Inner peace is my foundation'
      ]
    };

    const colors = {
      abundance: ['#FFD700', '#F4C430', '#FFDF00'],
      love: ['#FF69B4', '#FF1493', '#FF6FBF'],
      health: ['#00FF7F', '#32CD32', '#7FFF00'],
      success: ['#FF6347', '#FF4500', '#FF7F50'],
      peace: ['#87CEEB', '#4682B4', '#6495ED']
    };

    const rarities: SeedRarity[] = ['common', 'rare', 'epic', 'legendary'];
    const categories: ('abundance' | 'love' | 'health' | 'success' | 'peace')[] = ['abundance', 'love', 'health', 'success', 'peace'];

    const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockManifestations: typeof topManifestations = [];

    for (let i = 0; i < 3; i++) {
      const catIndex = (seed + i * 17) % categories.length;
      const category = categories[catIndex];
      const categoryIntentions = intentions[category];
      const categoryColors = colors[category];
      const intentionIndex = (seed + i * 23) % categoryIntentions.length;
      const colorIndex = (seed + i * 31) % categoryColors.length;
      const rarityIndex = (seed + i * 13) % rarities.length;

      mockManifestations.push({
        id: `mock_${username}_${i}`,
        intention: categoryIntentions[intentionIndex],
        category,
        color: categoryColors[colorIndex],
        rarity: rarities[rarityIndex],
      });
    }

    return mockManifestations;
  }, []);

  const displayedTopManifestations = useMemo(() => {
    if (isOwnProfile) {
      return topManifestations;
    }
    return generateMockTopManifestations(displayUsername as string);
  }, [isOwnProfile, topManifestations, displayUsername, generateMockTopManifestations]);

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

  const getRarityFromColor = (color: string): SeedRarity => {
    if (color.toLowerCase().includes('ffd700') || color.toLowerCase().includes('ffa500')) return 'legendary';
    if (color.toLowerCase().includes('9370db') || color.toLowerCase().includes('8a2be2')) return 'epic';
    if (color.toLowerCase().includes('4169e1') || color.toLowerCase().includes('1e90ff')) return 'rare';
    return 'common';
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
      rarity: getRarityFromColor(manifestation.color),
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

  const bloomedManifestations = inventory.filter(item => item.stage === 'blooming');

  const canChangeUsername = () => {
    if (!lastUsernameChange) return true;
    const monthsSinceChange = (Date.now() - lastUsernameChange) / (1000 * 60 * 60 * 24 * 30);
    return monthsSinceChange >= 1;
  };

  const getDaysUntilNextChange = () => {
    if (!lastUsernameChange) return 0;
    const daysSinceChange = (Date.now() - lastUsernameChange) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(30 - daysSinceChange));
  };

  const handleUsernameChange = () => {
    if (!isOwnProfile) return;

    if (!canChangeUsername()) {
      Alert.alert(
        'Username Change Locked',
        `You can change your username again in ${getDaysUntilNextChange()} days.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setNewUsername(myUsername);
    setShowUsernameEdit(true);
  };

  const confirmUsernameChange = () => {
    const trimmed = newUsername.trim();
    
    if (!trimmed) {
      Alert.alert('Invalid Name', 'Username cannot be empty.');
      return;
    }

    if (trimmed.length < 3) {
      Alert.alert('Invalid Name', 'Username must be at least 3 characters.');
      return;
    }

    if (trimmed.length > 20) {
      Alert.alert('Invalid Name', 'Username cannot exceed 20 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      Alert.alert('Invalid Name', 'Username can only contain letters, numbers, and underscores.');
      return;
    }

    Alert.alert(
      'Confirm Username Change',
      `Change your username to "${trimmed}"? You won\'t be able to change it again for 30 days.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            updateCommunityUsername(trimmed);
            setRankingUsername(trimmed);
            setLastUsernameChange(Date.now());
            setShowUsernameEdit(false);
            Alert.alert('Success', 'Your username has been updated!');
          },
        },
      ]
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
              <View style={styles.usernameRow}>
                <Text style={styles.username}>{displayUsername}</Text>
                {isOwnProfile && (
                  <TouchableOpacity
                    style={styles.editUsernameButton}
                    onPress={handleUsernameChange}
                  >
                    <Edit2 size={18} color="#FF69B4" />
                  </TouchableOpacity>
                )}
              </View>
              {isOwnProfile && !canChangeUsername() && (
                <Text style={styles.usernameChangeInfo}>
                  Next change available in {getDaysUntilNextChange()} days
                </Text>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Sparkles size={24} color="#FF69B4" />
                <Text style={styles.statValue}>{userRanking?.score || 0}</Text>
                <Text style={styles.statLabel}>Bloomed</Text>
                <Text style={styles.statRank}>#{userRanking?.rank || '-'}</Text>
              </View>

              <View style={styles.statBox}>
                <Flame size={24} color="#FF6347" />
                <Text style={styles.statValue}>{streakRanking?.score || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
                <Text style={styles.statRank}>#{streakRanking?.rank || '-'}</Text>
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

              {displayedTopManifestations.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {isOwnProfile
                      ? 'Showcase your best manifestations! Tap + to add one.'
                      : 'No manifestations showcased yet'}
                  </Text>
                </View>
              ) : (
                <View style={styles.manifestationsList}>
                  {displayedTopManifestations.map((manifestation, index) => (
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

            {isOwnProfile && (
              <View style={styles.dangerSection}>
                <Text style={styles.dangerSectionTitle}>Account Management</Text>
                <TouchableOpacity
                  style={styles.deleteAccountButton}
                  onPress={() => router.push('/delete-account')}
                >
                  <Text style={styles.deleteAccountText}>Delete Account & Data</Text>
                </TouchableOpacity>
              </View>
            )}
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
                  Choose from your harvested bloomed manifestations
                </Text>

                {bloomedManifestations.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      You haven&apos;t harvested any bloomed manifestations yet. Harvest blooms from your garden to add them here!
                    </Text>
                  </View>
                ) : (
                  <View style={styles.pickerList}>
                    {bloomedManifestations.map((manifestation) => {
                      const isSelected = topManifestations.some(
                        t => t.id === manifestation.id
                      );
                      const itemRarity = getRarityFromColor(manifestation.color);

                      return (
                        <TouchableOpacity
                          key={manifestation.id}
                          style={styles.pickerItem}
                          onPress={() => handleAddManifestation(manifestation)}
                          disabled={isSelected}
                        >
                          <LinearGradient
                            colors={getRarityGradient(itemRarity)}
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
                                      getRarityColor(itemRarity) + '40',
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.rarityText,
                                    { color: getRarityColor(itemRarity) },
                                  ]}
                                >
                                  {getRarityLabel(itemRarity)}
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

      <Modal
        visible={showUsernameEdit}
        animationType="fade"
        transparent
        onRequestClose={() => setShowUsernameEdit(false)}
      >
        <View style={styles.usernameModalOverlay}>
          <View style={styles.usernameModalContainer}>
            <LinearGradient
              colors={['#2d1b4e', '#1a0a2e']}
              style={styles.usernameModalGradient}
            >
              <Text style={styles.usernameModalTitle}>Change Username</Text>
              <Text style={styles.usernameModalSubtitle}>
                You can change your username once every 30 days
              </Text>

              <TextInput
                style={styles.usernameInput}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Enter new username"
                placeholderTextColor="#666"
                maxLength={20}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.usernameRules}>
                • 3-20 characters
                {`\n`}• Letters, numbers, and underscores only
              </Text>

              <View style={styles.usernameModalButtons}>
                <TouchableOpacity
                  style={styles.usernameCancelButton}
                  onPress={() => setShowUsernameEdit(false)}
                >
                  <Text style={styles.usernameCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.usernameConfirmButton}
                  onPress={confirmUsernameChange}
                >
                  <LinearGradient
                    colors={['#FF69B4', '#9370DB']}
                    style={styles.usernameConfirmGradient}
                  >
                    <Text style={styles.usernameConfirmText}>Confirm</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
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
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  editUsernameButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,105,180,0.2)',
    borderWidth: 2,
    borderColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameChangeInfo: {
    fontSize: 12,
    color: '#b8a9d9',
    marginTop: 8,
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
  usernameModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  usernameModalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FF69B4',
  },
  usernameModalGradient: {
    padding: 24,
  },
  usernameModalTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  usernameModalSubtitle: {
    fontSize: 14,
    color: '#b8a9d9',
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 20,
  },
  usernameInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(255,105,180,0.3)',
    marginBottom: 16,
  },
  usernameRules: {
    fontSize: 13,
    color: '#b8a9d9',
    marginBottom: 24,
    lineHeight: 20,
  },
  usernameModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  usernameCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  usernameCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#b8a9d9',
  },
  usernameConfirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  usernameConfirmGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  usernameConfirmText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  dangerSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  dangerSectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  deleteAccountButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
    alignItems: 'center',
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ff4757',
  },
});
