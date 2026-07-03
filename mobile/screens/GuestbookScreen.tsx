import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useGuestbook } from "../lib/useGuestbook";
import { PostCard } from "../components/PostCard";
import { colors } from "../lib/theme";

// Global guestbook feed (port of src/pages/Guestbook.tsx). Posting happens
// from the bench detail screen, where the bench context is known — same as
// the web app.
export default function GuestbookScreen() {
  const { posts, isLoading } = useGuestbook();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.list}
      data={posts}
      keyExtractor={(post) => post.id}
      renderItem={({ item }) => <PostCard post={item} showBench />}
      ListEmptyComponent={
        <Text style={styles.empty}>
          Nessun messaggio ancora. Visita una panchina e lascia il primo!
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 12 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  empty: { textAlign: "center", color: colors.mutedText, marginTop: 48, paddingHorizontal: 24 },
});
