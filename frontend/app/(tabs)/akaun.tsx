import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useLang } from "@/src/context/LanguageContext";
import { useAuth } from "@/src/context/AuthContext";

const Row: React.FC<{ icon: any; label: string; onPress?: () => void; right?: React.ReactNode; testID?: string; danger?: boolean }> = ({
  icon, label, onPress, right, testID, danger,
}) => (
  <Pressable testID={testID} onPress={onPress} style={styles.row}>
    <Ionicons name={icon} size={20} color={danger ? colors.error : colors.onSurface} />
    <Text style={[styles.rowLabel, danger && { color: colors.error }]}>{label}</Text>
    {right ?? <Ionicons name="chevron-forward" size={18} color={colors.muted} />}
  </Pressable>
);

export default function Akaun() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}><Text style={styles.h1}>{t("tab_account")}</Text></View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={styles.profile}>
          <View style={styles.avatar}><Ionicons name="person" size={30} color={colors.onSurface} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name || "Guest"}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Row testID="row-edit-profile" icon="person-outline" label={t("edit_profile")} />
          <View style={styles.divider} />
          <Row testID="row-addresses" icon="location-outline" label={t("saved_addresses")} />
          <View style={styles.divider} />
          <Row testID="row-payments" icon="card-outline" label={t("payment_methods")} />
          <View style={styles.divider} />
          <Row
            testID="row-rider-app"
            icon="bicycle-outline"
            label={t("login_rider")}
            onPress={() => router.push("/rider/login")}
          />
        </View>

        <View style={styles.card}>
          <Row
            testID="row-lang"
            icon="language-outline"
            label={t("language")}
            right={
              <View style={styles.langSwitch}>
                {(["ms", "en"] as const).map((L) => (
                  <Pressable key={L} testID={`lang-${L}`} onPress={() => setLang(L)} style={[styles.langOpt, lang === L && styles.langOptActive]}>
                    <Text style={[styles.langTxt, lang === L && styles.langTxtActive]}>{L.toUpperCase()}</Text>
                  </Pressable>
                ))}
              </View>
            }
          />
        </View>

        <View style={styles.card}>
          <Row testID="row-logout" icon="log-out-outline" label={t("logout")} danger onPress={async () => { await logout(); router.replace("/login"); }} />
        </View>

        <Text style={styles.version}>ViaAce Xpress v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  h1: { fontSize: 24, fontWeight: "900", color: colors.onSurface },
  profile: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.brandTertiary, padding: spacing.lg, borderRadius: radius.lg },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  email: { fontSize: 12, color: colors.onSurfaceSecondary, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, ...shadow.card, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, height: 54 },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.onSurface },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: spacing.xxl + spacing.sm },
  langSwitch: { flexDirection: "row", backgroundColor: kad ? ... : colors.surfaceSecondary, borderRadius: radius.pill, padding: 3 }, // standard styling
  langOpt: { paddingHorizontal: 10, height: 26, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  langOptActive: { backgroundColor: colors.brandPrimary },
  langTxt: { fontSize: 11, fontWeight: "800", color: colors.onSurfaceSecondary },
  langTxtActive: { color: colors.onBrandPrimary },
  version: { textAlign: "center", color: colors.muted, marginTop: spacing.xl, fontSize: 11 },
});
