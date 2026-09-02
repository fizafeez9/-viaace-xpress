import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    try { 
      await loginWithGoogle(); 
      router.replace("/(tabs)"); 
    } finally { 
      setBusy(false); 
    }
  };

  const doGuest = async () => {
    setBusy(true);
    try { 
      await loginMock(guestName.trim() || "Tetamu"); 
      router.replace("/(tabs)"); 
    } finally { 
      setBusy(false); 
    }
  };

  return (
    <SafeAreaView style={styles.safe} testID="login-screen">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          <View style={styles.headerContainer}>
            <BrandLogo width={220} height={65} />
            <Text style={styles.title}>Selamat Datang</Text>
            <Text style={styles.sub}>Log masuk ke akaun ViaAce Xpress anda untuk mula menempah penghantaran.</Text>
          </View>

          <View style={styles.formContainer}>
            <Pressable
              testID="login-google-button"
              onPress={doGoogle}
              disabled={busy}
              style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="logo-google" size={20} color="#111" />
              <Text style={styles.googleTxt}>{t("login_google")}</Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerTxt}>atau</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                testID="guest-name-input"
                placeholder="Nama anda"
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
                testID="login-rider-button"
                onPress={() => router.push("/rider/login")}
                style={styles.ghostBtn}
              >
                <Ionicons name="bicycle-outline" size={18} color={colors.onSurface} />
                <Text style={styles.ghostTxt}>{t("login_rider")}</Text>
              </Pressable>

              <Pressable
                testID="login-phone-button"
                disabled
                style={[styles.ghostBtn, { opacity: 0.5 }]}
              >
                <Ionicons name="call-outline" size={18} color={colors.onSurface} />
                <Text style={styles.ghostTxt}>{t("login_phone")}</Text>
              </Pressable>
            </View>

            <Text style={styles.legal}>© {new Date().getFullYear()} ViaAce Xpress. Hak cipta terpelihara.</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scrollContainer: { flexGrow: 1, justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  headerContainer: { alignItems: "center", marginTop: spacing.xl },
  title: { fontSize: 26, fontWeight: "800", color: colors.onSurface, textAlign: "center", marginTop: spacing.xl, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: colors.onSurfaceSecondary, textAlign: "center", marginTop: spacing.sm, paddingHorizontal: spacing.md, lineHeight: 20 },
  formContainer: { width: "100%", marginVertical: spacing.xl },
  googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, height: 52, borderRadius: radius.md, ...shadow.cta },
  googleTxt: { fontSize: 15, fontWeight: "700", color: colors.onSurface },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: colors.divider },
  dividerTxt: { color: colors.muted, fontSize: 13, fontWeight: "500" },
  inputGroup: { gap: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 50, paddingHorizontal: spacing.lg, color: colors.onSurface, backgroundColor: colors.surface, fontSize: 15 },
  primaryBtn: { backgroundColor: colors.brandPrimary, height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center", ...shadow.cta },
  primaryTxt: { fontSize: 15, fontWeight: "800", color: colors.onBrandPrimary, letterSpacing: 0.5 },
  ghostBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.border, height: 48, borderRadius: radius.md, backgroundColor: colors.surfaceSecondary },
  ghostTxt: { fontSize: 14, fontWeight: "700", color: colors.onSurface },
  legal: { textAlign: "center", color: colors.muted, marginTop: spacing.xxl, fontSize: 12 },
});
