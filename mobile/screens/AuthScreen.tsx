import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";

const emailSchema = z.string().trim().email("Email non valida").max(255);
const passwordSchema = z
  .string()
  .min(6, "La password deve avere almeno 6 caratteri")
  .max(72, "Password troppo lunga");

// Ported from src/pages/Auth.tsx. Google sign-in is intentionally absent:
// the web OAuth redirect flow doesn't apply on native, and the proper
// replacement (@react-native-google-signin + signInWithIdToken) requires a
// dev build + native OAuth client IDs — roadmap phase 2, can't work in Expo
// Go anyway.
export default function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const emailParsed = emailSchema.safeParse(email);
    const passwordParsed = passwordSchema.safeParse(password);
    if (!emailParsed.success) return Alert.alert("Errore", emailParsed.error.issues[0].message);
    if (!passwordParsed.success) return Alert.alert("Errore", passwordParsed.error.issues[0].message);

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: emailParsed.data,
          password: passwordParsed.data,
          options: {
            data: { display_name: displayName.trim() || emailParsed.data.split("@")[0] },
          },
        });
        if (error) throw error;
        Alert.alert("Quasi fatto", "Controlla la tua email per confermare l'account");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailParsed.data,
          password: passwordParsed.data,
        });
        if (error) throw error;
        // Success needs no navigation: AuthContext flips `user` and the
        // Profile tab re-renders into the logged-in state.
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore sconosciuto";
      if (message.toLowerCase().includes("invalid login")) {
        Alert.alert("Errore", "Email o password non corretti");
      } else if (message.toLowerCase().includes("already registered")) {
        Alert.alert("Errore", "Un account con questa email esiste già");
      } else {
        Alert.alert("Errore", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.kicker}>BIGBENCHAPP</Text>
        <Text style={styles.title}>{mode === "signin" ? "Bentornato" : "Unisciti a noi"}</Text>
        <Text style={styles.subtitle}>
          {mode === "signin"
            ? "Accedi per continuare la tua collezione di panchine"
            : "Crea un account per salvare il tuo passaporto"}
        </Text>

        <View style={styles.form}>
          {mode === "signup" && (
            <View style={styles.field}>
              <Text style={styles.label}>NOME</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Mario Rossi"
                maxLength={100}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@esempio.it"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              maxLength={255}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              maxLength={72}
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.submit, pressed && styles.pressed]}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>
                {mode === "signin" ? "Accedi" : "Crea account"}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
            accessibilityRole="button"
          >
            <Text style={styles.switchText}>
              {mode === "signin" ? "Non hai un account? " : "Hai già un account? "}
              <Text style={styles.switchLink}>
                {mode === "signin" ? "Registrati" : "Accedi"}
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingTop: 48, alignItems: "center" },
  kicker: { fontSize: 10, letterSpacing: 4, color: colors.mutedText, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: "700", color: colors.text },
  subtitle: {
    fontSize: 14,
    fontStyle: "italic",
    color: colors.mutedText,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    gap: 16,
  },
  field: { gap: 6 },
  label: { fontSize: 10, letterSpacing: 2, color: colors.mutedText },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  submit: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.85 },
  submitText: { color: "white", fontWeight: "600", fontSize: 16 },
  switchText: { textAlign: "center", color: colors.mutedText, fontSize: 14 },
  switchLink: { color: colors.primary, fontWeight: "600" },
});
