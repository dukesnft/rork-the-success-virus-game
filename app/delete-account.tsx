import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Trash2, AlertCircle } from 'lucide-react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your app data including manifestations, progress, and purchases (stored locally). This action cannot be undone.\n\nNote: In-app purchases are managed by your Apple/Google account and cannot be deleted from this app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              
              await AsyncStorage.clear();
              
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              Alert.alert(
                'Data Deleted',
                'All your local data has been deleted. The app will restart.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.replace('/');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error deleting data:', error);
              Alert.alert('Error', 'Failed to delete data. Please try again.');
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Delete Account & Data</Text>
          <Pressable
            style={styles.closeButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <X color="#fff" size={28} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Trash2 color="#ff4757" size={48} />
            </View>
          </View>

          <Text style={styles.title}>Account Deletion Request</Text>
          <Text style={styles.subtitle}>
            We&apos;re sorry to see you go. This page allows you to delete all your data from the app.
          </Text>

          <View style={styles.warningBox}>
            <AlertCircle color="#ffa502" size={24} />
            <Text style={styles.warningText}>
              This action is irreversible. All your data will be permanently deleted.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What will be deleted:</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• All manifestations and progress</Text>
              <Text style={styles.listItem}>• Inventory and collected blooms</Text>
              <Text style={styles.listItem}>• Energy, gems, and special seeds</Text>
              <Text style={styles.listItem}>• Daily streaks and garden level</Text>
              <Text style={styles.listItem}>• Community posts and rankings</Text>
              <Text style={styles.listItem}>• Journal entries and books</Text>
              <Text style={styles.listItem}>• All app settings and preferences</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What will NOT be deleted:</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • In-app purchases are managed by Apple/Google and remain tied to your Apple ID/Google account
              </Text>
              <Text style={styles.listItem}>
                • You can restore purchases if you reinstall the app
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Storage Information:</Text>
            <Text style={styles.infoText}>
              This app stores all data locally on your device using AsyncStorage. We do not collect or store your personal information on external servers. Deleting data from this page removes it from your device only.
            </Text>
          </View>

          <Pressable
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            <LinearGradient
              colors={isDeleting ? ['#666', '#444'] : ['#ff4757', '#ff3838']}
              style={styles.deleteButtonGradient}
            >
              <Trash2 color="#fff" size={24} />
              <Text style={styles.deleteButtonText}>
                {isDeleting ? 'Deleting...' : 'Delete All My Data'}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              If you have questions or concerns, please contact support at:
            </Text>
            <Text style={styles.emailText}>support@rork.app</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 60,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 2, 0.15)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 2, 0.3)',
    marginBottom: 32,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#ffa502',
    fontWeight: '600',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  list: {
    gap: 8,
  },
  listItem: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  infoText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
  },
  deleteButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 32,
    marginBottom: 16,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
});
