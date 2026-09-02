import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useRider } from "@/src/context/RiderContext";
import { BrandLogo } from "@/src/components/BrandLogo";

export default function RiderLogin() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const { loginRider } = useRider();
  const router = useRouter();

  const submit = async (val?: string) => {
    setErr("");
    setBusy(true);
    try {
      await loginRider((val || code).trim().toUpperCase());
      router.replace("/rider/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Login gagal");
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable testID="rider-back" onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
            </Pressable>
            <View style={{ flex: 1 }} />
          </View>

          <LinearGradient colors={[colors.brandTertiary, colors.surface]} style={styles.hero}>
            <BrandLogo width={200} />
            <View style={styles.badge}>
              <Ionicons name="bicycle" size={14} color="#000" />
              <Text style={styles.badgeTxt}>RIDER APP</Text>
            </View>
            <Text style={styles.title}>Log Masuk Rider</Text>
            <Text style={styles.sub}>Masukkan kod rider untuk terima order</Text>
          </LinearGradient>

          <View style={styles.body}>
            <TextInput
              testID="rider-code-input"
              value={code}
              onChangeText={(v) => { setCode(v.toUpperCase()); setErr(""); }}
              placeholder="RIDER01"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              style={styles.input}
            />
            {!!err && <Text style={styles.errTxt}>{err}</Text>}
            <Pressable testID="rider-login-btn" onPress={() => submit()} disabled={busy || !code} style={[styles.cta, (!code || busy) && { opacity: 0.6 }]}>
              <Text style={styles.ctaTxt}>{busy ? "..." : "LOG MASUK"}</Text>
            </Pressable>

            <Text style={styles.help}>Akaun demo:</Text>
            <View style={styles.demoRow}>
              {["RIDER01", "RIDER02", "RIDER03"].map((c) => (
                <Pressable key={c} testID={`demo-${c}`} onPress={() => submit(c)} style={styles.demoChip}>
                  <Text style={styles.demoTxt}>{c}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg },
  hero: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, alignItems: "center" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.brandPrimary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, marginTop: spacing.md },
  badgeTxt: { fontSize: 10, fontWeight: "900", color: "#000", letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: "900", color: colors.onSurface, marginTop: spacing.md },
  sub: { fontSize: 13, color: colors.onSurfaceSecondary, marginTop: 4 },
  body: { padding: spacing.xl, gap: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 54, paddingHorizontal: spacing.lg, color: colors.onSurface, fontSize: 18, fontWeight: "800", letterSpacing: 2, textAlign: "center" },
  errTxt: { color: colors.error, fontSize: 13 },
  cta: { backgroundColor: colors.brandPrimary, height: 54, borderRadius: radius.md, alignItems: "center", justifyContent: "center", ...shadow.cta },
  ctaTxt: { fontWeight: "900", color: colors.onBrandPrimary, letterSpacing: 1 },
  help: { fontSize: 12, color: colors.muted, marginTop: spacing.lg, textAlign: "center" },
  demoRow: { flexDirection: "row", gap: spacing.sm, justifyContent: "center" },
  demoChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  demoTxt: { fontSize: 12, fontWeight: "700", color: colors.onSurface, letterSpacing: 1 },
});
