import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { List, Sparkles, Calendar, TrendingUp } from 'lucide-react-native';
import { useManifestations } from '@/contexts/ManifestationContext';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Manifestation } from '@/types/manifestation';



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
  const getEmoji = () => {
    if (manifestation.stage === 'blooming') return '🌸';
    if (manifestation.stage === 'growing') return '🌿';
    if (manifestation.stage === 'sprout') return '🌱';
    return '🌰';
  };

  const daysPlanted = Math.floor((Date.now() - manifestation.createdAt) / (1000 * 60 * 60 * 24));

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
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
    </Pressable>
  );
}

export default function ManifestationsScreen() {
  const { manifestations } = useManifestations();
  const [filter, setFilter] = useState<'all' | 'seed' | 'sprout' | 'growing' | 'blooming'>('all');

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
  }) => (
    <Pressable
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => {
        setFilter(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <Text style={styles.filterEmoji}>{emoji}</Text>
      <Text style={[styles.filterLabel, filter === value && styles.filterLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );

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
    borderRadius: 20,
    overflow: 'hidden',
  },
  statsGradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 105, 180, 0.2)',
    borderColor: '#FF69B4',
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
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
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
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
});
