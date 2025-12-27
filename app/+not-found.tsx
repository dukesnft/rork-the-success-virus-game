import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a1a', '#1a0a2e', '#2d1b4e']}
          style={styles.gradient}
        >
          <Sparkles color="#9370DB" size={60} />
          <Text style={styles.title}>Lost in the cosmos?</Text>
          <Text style={styles.subtitle}>This path doesn&apos;t exist in your manifestation journey</Text>

          <Link href="/" style={styles.link}>
            <LinearGradient
              colors={['#9370DB', '#FF69B4']}
              style={styles.linkGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.linkText}>Return to Garden</Text>
            </LinearGradient>
          </Link>
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
    marginTop: 20,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#b8a9d9",
    textAlign: "center" as const,
  },
  link: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  linkGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  linkText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
