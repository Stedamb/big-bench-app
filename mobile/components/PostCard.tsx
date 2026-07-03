import { Image, StyleSheet, Text, View } from "react-native";
import type { GuestbookPost } from "../lib/useGuestbook";
import { colors } from "../lib/theme";
import { Stars } from "./Stars";

interface PostCardProps {
  post: GuestbookPost;
  showBench?: boolean;
}

export function PostCard({ post, showBench = false }: PostCardProps) {
  const author = post.profiles?.display_name ?? "Anonimo";
  const date = new Date(post.created_at).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {post.profiles?.avatar_url ? (
          <Image
            source={{ uri: post.profiles.avatar_url }}
            style={styles.avatar}
            accessibilityLabel={`Avatar di ${author}`}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>{author.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.author}>{author}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        {post.rating != null && <Stars value={post.rating} size={14} />}
      </View>

      {showBench && post.benches && (
        <Text style={styles.benchName}>
          {post.benches.name} — {post.benches.location}
        </Text>
      )}

      {post.content ? <Text style={styles.content}>{post.content}</Text> : null}

      {post.community_post_images.length > 0 && (
        <View style={styles.imagesRow}>
          {post.community_post_images.map((img) => (
            <Image
              key={img.id}
              source={{ uri: img.image_url }}
              style={styles.postImage}
              accessibilityLabel="Foto della panchina"
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: "white", fontWeight: "700" },
  author: { fontWeight: "600", color: colors.text },
  date: { fontSize: 12, color: colors.mutedText },
  benchName: { fontSize: 13, fontWeight: "600", color: colors.primary },
  content: { color: colors.text, lineHeight: 20 },
  imagesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  postImage: { width: 96, height: 96, borderRadius: 6 },
});
