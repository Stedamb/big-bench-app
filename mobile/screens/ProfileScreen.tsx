import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useBenches } from "../lib/useBenches";
import { useVisitedBenches } from "../lib/useVisitedBenches";
import { colors } from "../lib/theme";
import AuthScreen from "./AuthScreen";

// The "menu"/account tab: login form when logged out, profile summary +
// progress + sign-out when logged in. The web app's full Progress page
// (region breakdown, charts) is roadmap phase 2.
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: benches = [] } = useBenches();
  const { visitedIds } = useVisitedBenches();

  if (!user) {
    return <AuthScreen />;
  }

  const total = benches.length;
  const visited = visitedIds.length;
  const pct = total > 0 ? Math.round((visited / total) * 100) : 0;
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ?? user.email ?? "Utente";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.card}>
        <Text style={styles.cardKicker}>IL TUO PASSAPORTO</Text>
        <Text style={styles.bigNumber}>
          {visited}
          <Text style={styles.bigNumberTotal}> / {total}</Text>
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.pctText}>{pct}% delle panchine visitate</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.85 }]}
        onPress={signOut}
        accessibilityRole="button"
      >
        <Text style={styles.signOutText}>Esci</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, alignItems: "center", gap: 8 },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  avatarInitial: { color: "white", fontSize: 28, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "700", color: colors.text, marginTop: 8 },
  email: { fontSize: 14, color: colors.mutedText },
  card: {
    width: "100%",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    gap: 10,
    marginTop: 24,
  },
  cardKicker: { fontSize: 10, letterSpacing: 3, color: colors.mutedText },
  bigNumber: { fontSize: 40, fontWeight: "800", color: colors.primary },
  bigNumberTotal: { fontSize: 22, fontWeight: "600", color: colors.mutedText },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.primary },
  pctText: { fontSize: 13, color: colors.mutedText },
  signOut: {
    marginTop: 24,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 32,
    paddingVertical: 10,
    backgroundColor: colors.card,
  },
  signOutText: { color: colors.danger, fontWeight: "600" },
});
