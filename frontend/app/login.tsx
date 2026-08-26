import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BrandLogo } from "@/src/components/BrandLogo";
import { useAuth } from "@/src/context/AuthContext";
import { useLang } from "@/src/context/LanguageContext";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";

export default function Login() {
  const { loginWithGoogle, loginMock } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [guestName, setGuestName] = useState("");
  const [busy, setBusy] = useState(false);

  const doGoogle = async () => {
    setBusy(true);
    try { await loginWithGoogle(); router.replace("/(tabs)"); } finally { setBusy(false); }
  };
  const doGuest = async () => {
    setBusy(true);
    try { await loginMock(guestName.trim() || "Tetamu"); router.replace("/(tabs)"); } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} testID="login-screen">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={[colors.brandTertiary, colors.surface]} style={styles.hero}>
            <BrandLogo width={200} height={56} />
            <Text style={styles.title}>{t("login_hero")}</Text>
            <Text style={styles.sub}>{t("login_sub")}</Text>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1647221597996-54f3d0f73809?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxkZWxpdmVyeSUyMHBhcmNlbCUyMGJveCUyMDNkJTIwaWxsdXN0cmF0aW9ufGVufDB8fHx8MTc4NzIzMjQ2MHww&ixlib=rb-4.1.0&q=85" }}
              style={styles.heroImg}
              contentFit="contain"
            />
          </LinearGradient>

          <View style={styles.body}>
            <Pressable
              testID="login-google-button"
              onPress={doGoogle}
              disabled={busy}
              style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="logo-google" size={20} color="#000" />
              <Text style={styles.googleTxt}>{t("login_google")}</Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.line} /><Text style={styles.dividerTxt}>atau</Text><View style={styles.line} />
            </View>

            <TextInput
              testID="guest-name-input"
              placeholder="Nama anda (pilihan)"
              placeholderTextColor={colors.muted}
              value={guestName}
              onChangeText={setGuestName}
              style={styles.input}
            />
            <Pressable
              testID="login-mock-button"
              onPress={doGuest}
              disabled={busy}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.primaryTxt}>{t("login_mock")}</Text>
            </Pressable>

            <Pressable
              testID="login-phone-button"
              disabled
              style={[styles.ghostBtn, { opacity: 0.5 }]}
            >
              <Ionicons name="call-outline" size={18} color={colors.onSurface} />
              <Text style={styles.ghostTxt}>{t("login_phone")}</Text>
            </Pressable>

            <Text style={styles.legal}>© {new Date().getFullYear()} ViaAce Xpress</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  hero: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "800", color: colors.onSurface, textAlign: "center", marginTop: spacing.md },
  sub: { fontSize: 14, color: colors.onSurfaceSecondary, textAlign: "center", marginTop: spacing.sm },
  heroImg: { width: 220, height: 180, marginTop: spacing.lg },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.md },
  googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, height: 52, borderRadius: radius.md },
  googleTxt: { fontSize: 15, fontWeight: "700", color: colors.onSurface },
  divider: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: spacing.sm },
  line: { flex: 1, height: 1, backgroundColor: colors.divider },
  dividerTxt: { color: colors.muted, fontSize: 12 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.lg, color: colors.onSurface, backgroundColor: colors.surface },
  primaryBtn: { backgroundColor: colors.brandPrimary, height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center", ...shadow.cta },
  primaryTxt: { fontSize: 15, fontWeight: "800", color: colors.onBrandPrimary, letterSpacing: 0.5 },
  ghostBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48 },
  ghostTxt: { color: colors.onSurface, fontWeight: "600" },
  legal: { textAlign: "center", color: colors.muted, marginTop: spacing.xl, fontSize: 12 },
});

