import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Frown, Meh, Heart, Sparkles, Plus, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { JournalEntry } from '@/types/journal';
import { getEasternDateString, formatEasternDate } from '@/utils/dateUtils';

const MOODS = [
  { value: 'amazing' as const, icon: Sparkles, label: 'Amazing', color: '#FFD700' },
  { value: 'good' as const, icon: Heart, label: 'Good', color: '#FF69B4' },
  { value: 'neutral' as const, icon: Meh, label: 'Neutral', color: '#9370DB' },
  { value: 'low' as const, icon: Frown, label: 'Low', color: '#87CEEB' },
  { value: 'struggling' as const, icon: Frown, label: 'Struggling', color: '#B0C4DE' },
];

export default function JournalScreen() {
  const { entries, addEntry, updateEntry, deleteEntry, getTodayEntry } = useJournal();
  const today = getEasternDateString();
  const todayEntry = getTodayEntry();

  const [mood, setMood] = useState<JournalEntry['mood']>('neutral');
  const [thoughts, setThoughts] = useState('');
  const [gratitude, setGratitude] = useState<string[]>(['', '', '']);
  const [currentGratitudeInput, setCurrentGratitudeInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (todayEntry) {
      setMood(todayEntry.mood);
      setThoughts(todayEntry.thoughts);
      setGratitude(todayEntry.gratitude.length > 0 ? todayEntry.gratitude : ['', '', '']);
    }
  }, [todayEntry]);

  const handleSave = () => {
    const cleanedGratitude = gratitude.filter(g => g.trim().length > 0);
    
    if (cleanedGratitude.length === 0 && thoughts.trim().length === 0) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    const entry = {
      date: today,
      gratitude: cleanedGratitude,
      thoughts: thoughts.trim(),
      mood,
    };

    if (todayEntry) {
      updateEntry(todayEntry.id, entry);
      Alert.alert('Updated', 'Your journal entry has been updated.');
    } else {
      addEntry(entry);
      Alert.alert('Saved', 'Your journal entry has been saved.');
    }
  };

  const handleAddGratitude = () => {
    if (currentGratitudeInput.trim().length > 0) {
      setGratitude([...gratitude.filter(g => g.trim().length > 0), currentGratitudeInput.trim()]);
      setCurrentGratitudeInput('');
    }
  };

  const handleRemoveGratitude = (index: number) => {
    setGratitude(gratitude.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatEasternDate(date);
  };

  const renderHistoryEntry = (entry: JournalEntry) => {
    const moodData = MOODS.find(m => m.value === entry.mood);
    const MoodIcon = moodData?.icon || Meh;

    return (
      <View key={entry.id} style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.historyDateRow}>
            <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
            <View style={[styles.moodBadge, { backgroundColor: moodData?.color + '33' }]}>
              <MoodIcon size={14} color={moodData?.color} />
              <Text style={[styles.moodBadgeText, { color: moodData?.color }]}>{moodData?.label}</Text>
            </View>
          </View>
          <Pressable onPress={() => {
            Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(entry.id) }
            ]);
          }}>
            <X size={20} color="#ff6b6b" />
          </Pressable>
        </View>
        
        {entry.gratitude.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>Grateful For:</Text>
            {entry.gratitude.map((item, idx) => (
              <Text key={idx} style={styles.historyGratitude}>• {item}</Text>
            ))}
          </View>
        )}
        
        {entry.thoughts && (
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>Thoughts:</Text>
            <Text style={styles.historyThoughts}>{entry.thoughts}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0f0520', '#1a0a2e', '#2d1654']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Daily Journal</Text>
            <Text style={styles.subtitle}>{formatDate(today)}</Text>
          </View>

          <View style={styles.moodSection}>
            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((moodData) => {
                const MoodIcon = moodData.icon;
                return (
                  <Pressable
                    key={moodData.value}
                    style={[
                      styles.moodButton,
                      mood === moodData.value && styles.moodButtonActive,
                      { borderColor: moodData.color }
                    ]}
                    onPress={() => setMood(moodData.value)}
                  >
                    <MoodIcon 
                      size={32} 
                      color={mood === moodData.value ? moodData.color : '#b8a9d9'} 
                    />
                    <Text style={[
                      styles.moodLabel,
                      mood === moodData.value && { color: moodData.color }
                    ]}>
                      {moodData.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.gratitudeSection}>
            <Text style={styles.sectionTitle}>What are you grateful for?</Text>
            <View style={styles.gratitudeInputContainer}>
              <TextInput
                style={styles.gratitudeInput}
                value={currentGratitudeInput}
                onChangeText={setCurrentGratitudeInput}
                placeholder="Add something you're grateful for..."
                placeholderTextColor="#7d6ba8"
                onSubmitEditing={handleAddGratitude}
                returnKeyType="done"
              />
              <Pressable style={styles.addButton} onPress={handleAddGratitude}>
                <Plus size={20} color="#fff" />
              </Pressable>
            </View>

            {gratitude.filter(g => g.trim().length > 0).map((item, index) => (
              <View key={index} style={styles.gratitudeItem}>
                <Heart size={16} color="#FF69B4" />
                <Text style={styles.gratitudeText}>{item}</Text>
                <Pressable onPress={() => handleRemoveGratitude(index)}>
                  <X size={18} color="#ff6b6b" />
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.thoughtsSection}>
            <Text style={styles.sectionTitle}>Your thoughts & reflections</Text>
            <TextInput
              style={styles.thoughtsInput}
              value={thoughts}
              onChangeText={setThoughts}
              placeholder="Write about your day, your dreams, your manifestations..."
              placeholderTextColor="#7d6ba8"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={['#FF1493', '#FF69B4', '#FFB6C1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Sparkles size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {todayEntry ? 'Update Entry' : 'Save Entry'}
              </Text>
            </LinearGradient>
          </Pressable>

          {entries.length > 0 && (
            <View style={styles.historySection}>
              <Pressable 
                style={styles.historyToggle}
                onPress={() => setShowHistory(!showHistory)}
              >
                <Text style={styles.historyToggleText}>Past Entries ({entries.length})</Text>
                {showHistory ? (
                  <ChevronUp size={24} color="#FF69B4" />
                ) : (
                  <ChevronDown size={24} color="#FF69B4" />
                )}
              </Pressable>

              {showHistory && (
                <View style={styles.historyList}>
                  {entries.map(renderHistoryEntry)}
                </View>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#b8a9d9',
    fontWeight: '500' as const,
  },
  moodSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
  },
  moodLabel: {
    fontSize: 11,
    color: '#b8a9d9',
    marginTop: 6,
    fontWeight: '600' as const,
  },
  gratitudeSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  gratitudeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  gratitudeInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gratitudeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  gratitudeText: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    fontWeight: '500' as const,
  },
  thoughtsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  thoughtsInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: '#fff',
    minHeight: 160,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  historyToggleText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FF69B4',
  },
  historyList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyDateRow: {
    flex: 1,
    gap: 8,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  moodBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  historySectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FF69B4',
    marginBottom: 8,
  },
  historyGratitude: {
    fontSize: 14,
    color: '#e0d5f5',
    marginBottom: 4,
    lineHeight: 20,
  },
  historyThoughts: {
    fontSize: 14,
    color: '#e0d5f5',
    lineHeight: 20,
  },
  historySection: {
    marginBottom: 12,
  },
});
