import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useLang } from "@/src/context/LanguageContext";
import { useAuth } from "@/src/context/AuthContext";
import { BrandLogo } from "@/src/components/BrandLogo";

const Item: React.FC<{ icon: any; label: string; onPress?: () => void; testID?: string }> = ({ icon, label, onPress, testID }) => (
  <Pressable testID={testID} onPress={onPress} style={styles.item}>
    <Ionicons name={icon} size={20} color={colors.onSurface} />
    <Text style={styles.itemTxt}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
  </Pressable>
);

export default function Menu() {
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <BrandLogo />
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={styles.profile}>
          <View style={styles.avatar}><Ionicons name="person" size={26} color="#000" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Item testID="menu-orders" icon="clipboard-outline" label={t("tab_orders")} onPress={() => { router.back(); router.push("/(tabs)/tempahan"); }} />
          <View style={styles.sep} />
          <Item testID="menu-notif" icon="notifications-outline" label={t("notifications")} onPress={() => { router.back(); router.push("/notifications"); }} />
          <View style={styles.sep} />
          <Item testID="menu-help" icon="help-circle-outline" label={t("help_title")} onPress={() => { router.back(); router.push("/(tabs)/bantuan"); }} />
        </View>
        <View style={styles.card}>
          <View style={styles.item}>
            <Ionicons name="language-outline" size={20} color={colors.onSurface} />
            <Text style={styles.itemTxt}>{t("language")}</Text>
            <View style={styles.langRow}>
              {(["ms", "en"] as const).map((L) => (
                <Pressable key={L} testID={`menu-lang-${L}`} onPress={() => setLang(L)} style={[styles.langOpt, lang === L && styles.langActive]}>
                  <Text style={[styles.langTxt, lang === L && styles.langTxtActive]}>{L.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Pressable testID="menu-logout" onPress={async () => { await logout(); router.replace("/login"); }} style={styles.item}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.itemTxt, { color: colors.error }]}>{t("logout")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  profile: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.brandTertiary, padding: spacing.lg, borderRadius: radius.lg },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "800", color: colors.onSurface },
  email: { fontSize: 12, color: colors.onSurfaceSecondary, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, ...shadow.card, overflow: "hidden" },
  item: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, height: 52 },
  itemTxt: { flex: 1, fontWeight: "700", color: colors.onSurface },
  sep: { height: 1, backgroundColor: colors.divider, marginLeft: 44 },
  langRow: { flexDirection: "row", backgroundColor: colors.surfaceSecondary, borderRadius: radius.pill, padding: 3 },
  langOpt: { paddingHorizontal: 10, height: 26, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  langActive: { backgroundColor: colors.brandPrimary },
  langTxt: { fontSize: 11, fontWeight: "800", color: colors.onSurfaceSecondary },
  langTxtActive: { color: colors.onBrandPrimary },
});
