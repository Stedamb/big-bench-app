import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../contexts/AuthContext";
import { useBench } from "../lib/useBenches";
import { useVisitedBenches } from "../lib/useVisitedBenches";
import { useGuestbook, type PickedImage } from "../lib/useGuestbook";
import { BenchPin } from "../components/BenchPin";
import { PostCard } from "../components/PostCard";
import { Stars } from "../components/Stars";
import { colors } from "../lib/theme";
import type { BenchDetailProps } from "../navigation/types";

// Port of src/pages/BenchDetailPage.tsx: header, stats, visited toggle,
// stamp locations, per-bench guestbook with composer. Web fixes carried
// over: rating starts at 0 (no silent 5-star default) and submit failures
// are caught rather than escaping as unhandled rejections.
export default function BenchDetailScreen({ route }: BenchDetailProps) {
  const { id } = route.params;
  const { user } = useAuth();
  const { data: bench, isLoading } = useBench(id);
  const { visitedIds, toggleVisited } = useVisitedBenches();
  const { posts, isLoading: isLoadingPosts, createPost } = useGuestbook(id);

  const [newContent, setNewContent] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [images, setImages] = useState<PickedImage[]>([]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!bench) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Panchina non trovata</Text>
      </View>
    );
  }

  const visited = visitedIds.includes(bench.id);
  const ratedReviews = posts.filter((p) => p.rating != null);
  const avgRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((sum, p) => sum + (p.rating ?? 0), 0) / ratedReviews.length
      : null;

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImages(
        result.assets.map((a) => ({ uri: a.uri, mimeType: a.mimeType ?? null }))
      );
    }
  };

  const handleSubmit = async () => {
    if (!newContent.trim() && images.length === 0 && newRating === 0) {
      Alert.alert("Recensione vuota", "Aggiungi un testo, una foto o una valutazione.");
      return;
    }
    try {
      await createPost.mutateAsync({
        benchId: bench.id,
        content: newContent.trim() || undefined,
        rating: newRating > 0 ? newRating : undefined,
        images,
      });
      setNewContent("");
      setNewRating(0);
      setImages([]);
    } catch (err) {
      Alert.alert("Errore", err instanceof Error ? err.message : "Pubblicazione fallita");
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <BenchPin colors={bench.colors} />
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>PANCHINA #{bench.id}</Text>
          <Text style={styles.title}>{bench.name}</Text>
          <Text style={styles.location}>
            {bench.location}
            {bench.province ? ` (${bench.province})` : ""}
            {bench.region ? ` — ${bench.region}` : ""}
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.visitedButton,
          visited && styles.visitedButtonActive,
          pressed && { opacity: 0.85 },
        ]}
        onPress={() => toggleVisited(bench.id)}
        accessibilityRole="button"
      >
        <Text style={visited ? styles.visitedTextActive : styles.visitedText}>
          {visited ? "✓ Visitata" : "Segna come visitata"}
        </Text>
      </Pressable>

      {bench.image_url && (
        <Image
          source={{ uri: bench.image_url }}
          style={styles.heroImage}
          accessibilityLabel={`Foto di ${bench.name}`}
        />
      )}

      <View style={styles.statsRow}>
        {bench.altitude_m != null && (
          <View style={styles.stat}>
            <Text style={styles.statValue}>{bench.altitude_m} m</Text>
            <Text style={styles.statLabel}>ALTITUDINE</Text>
          </View>
        )}
        {bench.installed_on && (
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {parseInt(bench.installed_on.slice(0, 4), 10)}
            </Text>
            <Text style={styles.statLabel}>INSTALLATA</Text>
          </View>
        )}
        {avgRating != null && (
          <View style={styles.stat}>
            <Text style={styles.statValue}>{avgRating.toFixed(1)} ★</Text>
            <Text style={styles.statLabel}>
              {ratedReviews.length} {ratedReviews.length === 1 ? "VOTO" : "VOTI"}
            </Text>
          </View>
        )}
      </View>

      {bench.artist && (
        <Text style={styles.artist}>
          Artista: <Text style={{ fontWeight: "600" }}>{bench.artist}</Text>
        </Text>
      )}
      {bench.description ? <Text style={styles.description}>{bench.description}</Text> : null}

      {(bench.stamp_locations ?? []).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dove timbrare il passaporto</Text>
          {(bench.stamp_locations ?? []).map((loc) => (
            <View key={loc.id} style={styles.stampCard}>
              <Text style={styles.stampName}>{loc.name}</Text>
              {loc.address ? <Text style={styles.stampDetail}>{loc.address}</Text> : null}
              {loc.opening_hours ? (
                <Text style={styles.stampDetail}>{loc.opening_hours}</Text>
              ) : null}
              {loc.notes ? <Text style={styles.stampNotes}>{loc.notes}</Text> : null}
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Guestbook</Text>

        {user ? (
          <View style={styles.composer}>
            <TextInput
              style={styles.composerInput}
              value={newContent}
              onChangeText={setNewContent}
              placeholder="Racconta la tua visita…"
              multiline
              maxLength={2000}
            />
            <View style={styles.composerRow}>
              <Stars value={newRating} onSelect={setNewRating} size={22} />
              <Pressable onPress={pickImages} hitSlop={8} accessibilityRole="button">
                <Text style={styles.photoButton}>
                  {images.length > 0 ? `📷 ${images.length}` : "📷 Foto"}
                </Text>
              </Pressable>
            </View>
            <Pressable
              style={({ pressed }) => [styles.submit, pressed && { opacity: 0.85 }]}
              onPress={handleSubmit}
              disabled={createPost.isPending}
              accessibilityRole="button"
            >
              {createPost.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitText}>Pubblica</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <Text style={styles.muted}>Accedi dal tab Profilo per lasciare una recensione.</Text>
        )}

        {isLoadingPosts ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
        ) : posts.length === 0 ? (
          <Text style={styles.muted}>Nessuna recensione ancora. Sii il primo!</Text>
        ) : (
          <View style={{ gap: 12 }}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, gap: 16, paddingBottom: 48 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  header: { flexDirection: "row", gap: 12, alignItems: "center" },
  kicker: { fontSize: 10, letterSpacing: 3, color: colors.mutedText },
  title: { fontSize: 24, fontWeight: "700", color: colors.text },
  location: { fontSize: 14, color: colors.mutedText, marginTop: 2 },
  visitedButton: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.card,
  },
  visitedButtonActive: { backgroundColor: colors.primary },
  visitedText: { color: colors.primary, fontWeight: "600" },
  visitedTextActive: { color: "white", fontWeight: "600" },
  heroImage: { width: "100%", height: 200, borderRadius: 8 },
  statsRow: { flexDirection: "row", gap: 12 },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    gap: 2,
  },
  statValue: { fontSize: 18, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: 9, letterSpacing: 1.5, color: colors.mutedText },
  artist: { fontSize: 14, color: colors.text },
  description: { fontSize: 15, lineHeight: 22, color: colors.text },
  section: { gap: 10, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  stampCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 2,
  },
  stampName: { fontWeight: "600", color: colors.text },
  stampDetail: { fontSize: 13, color: colors.mutedText },
  stampNotes: { fontSize: 13, fontStyle: "italic", color: colors.mutedText },
  composer: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  composerInput: {
    minHeight: 72,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: "top",
  },
  composerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  photoButton: { color: colors.primary, fontWeight: "600" },
  submit: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "white", fontWeight: "600" },
  muted: { color: colors.mutedText, fontSize: 14 },
});
