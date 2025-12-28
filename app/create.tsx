import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Sparkles, ShoppingBag, Sprout } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useManifestations } from '@/contexts/ManifestationContext';
import { usePremium } from '@/contexts/PremiumContext';
import { CATEGORY_COLORS, AFFIRMATIONS } from '@/constants/manifestation';

const { width, height } = Dimensions.get('window');

type Category = keyof typeof CATEGORY_COLORS;

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: 'abundance', label: 'Abundance', emoji: '💰' },
  { key: 'love', label: 'Love', emoji: '💖' },
  { key: 'health', label: 'Health', emoji: '🌟' },
  { key: 'success', label: 'Success', emoji: '🎯' },
  { key: 'peace', label: 'Peace', emoji: '🕊️' },
];

export default function CreateScreen() {
  const router = useRouter();
  const { addManifestation } = useManifestations();
  const { specialSeeds, useSpecialSeed: consumeSpecialSeed } = usePremium();
  const [intention, setIntention] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('abundance');

  const handleCreate = () => {
    if (!intention.trim()) {
      Alert.alert('Missing Intention', 'Please enter your intention before planting.');
      return;
    }

    if (specialSeeds <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'No Seeds Available',
        'You need seeds to plant an intention. Visit the shop to get more seeds!',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Go to Shop', 
            onPress: () => {
              router.back();
              setTimeout(() => router.push('/shop' as any), 100);
            }
          }
        ]
      );
      return;
    }
    
    const seedConsumed = consumeSpecialSeed();
    if (!seedConsumed) {
      Alert.alert('Error', 'Failed to consume seed. Please try again.');
      return;
    }
    
    const x = Math.random() * (width - 100) + 20;
    const y = Math.random() * (height * 0.4) + height * 0.2;
    
    addManifestation({
      intention: intention.trim(),
      category: selectedCategory,
      position: { x, y },
      color: CATEGORY_COLORS[selectedCategory],
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Success!', `Your intention has been planted! Seeds remaining: ${specialSeeds - 1}`);
    router.back();
  };

  const randomAffirmation = AFFIRMATIONS[selectedCategory][
    Math.floor(Math.random() * AFFIRMATIONS[selectedCategory].length)
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1a', '#1a0a2e', '#2d1b4e']}
        style={styles.gradient}
      >
        <Pressable
          style={styles.closeButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <X color="#fff" size={28} />
        </Pressable>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Sparkles color="#FFD700" size={40} />
            <Text style={styles.title}>Plant a New Intention</Text>
            <Text style={styles.subtitle}>Set your manifestation into motion</Text>
            
            <View style={styles.seedsAvailable}>
              <LinearGradient
                colors={['#32CD32', '#228B22']}
                style={styles.seedsGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Sprout color="#fff" size={24} />
                <Text style={styles.seedsCount}>{specialSeeds}</Text>
                <Text style={styles.seedsLabel}>seeds available</Text>
              </LinearGradient>
              {specialSeeds === 0 && (
                <Pressable
                  style={styles.shopButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.back();
                    setTimeout(() => router.push('/shop' as any), 100);
                  }}
                >
                  <ShoppingBag color="#FFD700" size={20} />
                  <Text style={styles.shopButtonText}>Get Seeds</Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>What do you wish to manifest?</Text>
            <TextInput
              style={styles.input}
              placeholder="I am attracting..."
              placeholderTextColor="#7a6b9e"
              value={intention}
              onChangeText={setIntention}
              multiline
              autoFocus
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Choose your energy</Text>
            <View style={styles.categories}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  style={[
                    styles.categoryCard,
                    selectedCategory === cat.key && styles.categoryCardSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCategory(cat.key);
                  }}
                >
                  {selectedCategory === cat.key && (
                    <LinearGradient
                      colors={[CATEGORY_COLORS[cat.key], CATEGORY_COLORS[cat.key] + '80']}
                      style={styles.categoryGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  )}
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.affirmationBox}>
            <Text style={styles.affirmationLabel}>Affirmation</Text>
            <Text style={styles.affirmation}>{randomAffirmation}</Text>
          </View>

          {specialSeeds === 0 && (
            <View style={styles.limitWarning}>
              <Text style={styles.limitText}>🌱 No Seeds Available</Text>
              <Text style={styles.limitSubtext}>You need seeds to plant intentions. Visit the shop to get free daily seeds or purchase more!</Text>
            </View>
          )}

          {specialSeeds > 0 && (
            <View style={styles.seedInfo}>
              <Text style={styles.seedInfoTitle}>🌱 Seed Required</Text>
              <Text style={styles.seedInfoText}>Planting this intention will use 1 seed from your inventory</Text>
            </View>
          )}

          <Pressable
            style={[styles.createButton, (!intention.trim() || specialSeeds === 0) && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={!intention.trim() || specialSeeds === 0}
          >
            <LinearGradient
              colors={(intention.trim() && specialSeeds > 0) ? ['#9370DB', '#FF69B4'] : ['#4a4a4a', '#3a3a3a']}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Sparkles color="#fff" size={24} />
              <Text style={styles.createButtonText}>
                {specialSeeds === 0 ? 'No Seeds Available' : 'Plant Intention (1 seed)'}
              </Text>
            </LinearGradient>
          </Pressable>
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
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#b8a9d9',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 72) / 3,
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  categoryCardSelected: {
    borderColor: '#fff',
  },
  categoryGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  affirmationBox: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    marginBottom: 32,
  },
  affirmationLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFD700',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  affirmation: {
    fontSize: 18,
    fontStyle: 'italic' as const,
    color: '#fff',
    lineHeight: 26,
  },
  createButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  limitWarning: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(255, 105, 180, 0.15)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 105, 180, 0.4)',
    marginBottom: 20,
    alignItems: 'center',
  },
  limitText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 6,
  },
  limitSubtext: {
    fontSize: 14,
    color: '#FF69B4',
    textAlign: 'center' as const,
  },
  seedsAvailable: {
    marginTop: 24,
    width: '100%',
  },
  seedsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  seedsCount: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
  },
  seedsLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
    opacity: 0.9,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.4)',
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  seedInfo: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(50,205,50,0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(50,205,50,0.3)',
    marginBottom: 20,
  },
  seedInfoTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#32CD32',
    marginBottom: 6,
  },
  seedInfoText: {
    fontSize: 13,
    color: '#b8a9d9',
    lineHeight: 18,
  },
});
