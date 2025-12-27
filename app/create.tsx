import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useManifestations } from '@/contexts/ManifestationContext';
import { usePremium } from '@/contexts/PremiumContext';
import { CATEGORY_COLORS, AFFIRMATIONS } from '@/constants/manifestation';

const FREE_MANIFESTATION_LIMIT = 3;

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
  const { manifestations, addManifestation } = useManifestations();
  const { isPremium } = usePremium();
  const [intention, setIntention] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('abundance');

  const handleCreate = () => {
    if (!isPremium && manifestations.length >= FREE_MANIFESTATION_LIMIT) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      router.push('/premium' as any);
      return;
    }
    
    if (intention.trim()) {
      const x = Math.random() * (width - 100) + 20;
      const y = Math.random() * (height * 0.4) + height * 0.2;
      
      addManifestation({
        intention: intention.trim(),
        category: selectedCategory,
        position: { x, y },
        color: CATEGORY_COLORS[selectedCategory],
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
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

          {!isPremium && manifestations.length >= FREE_MANIFESTATION_LIMIT && (
            <View style={styles.limitWarning}>
              <Text style={styles.limitText}>🔒 Free limit reached: {manifestations.length}/{FREE_MANIFESTATION_LIMIT}</Text>
              <Text style={styles.limitSubtext}>Upgrade to Premium for unlimited manifestations</Text>
            </View>
          )}

          <Pressable
            style={[styles.createButton, !intention.trim() && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={!intention.trim()}
          >
            <LinearGradient
              colors={intention.trim() ? ['#9370DB', '#FF69B4'] : ['#4a4a4a', '#3a3a3a']}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Sparkles color="#fff" size={24} />
              <Text style={styles.createButtonText}>Plant Intention</Text>
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
});
