import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useLang } from "@/src/context/LanguageContext";
import { useAuth } from "@/src/context/AuthContext";

export default function Notifications() {
  const { authFetch } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const r = await authFetch("/api/notifications");
      if (r.ok) setItems(await r.json());
    })();
  }, []);
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>{t("notifications")}</Text>
        <View style={{ width: 26 }} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => (
          <View style={[styles.card, item.unread && { borderColor: colors.borderStrong, borderWidth: 2 }]}>
            <View style={styles.iconWrap}><Ionicons name="notifications" size={18} color="#000" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nTitle}>{item.title}</Text>
              <Text style={styles.nBody}>{item.body}</Text>
              <Text style={styles.nDate}>{new Date(item.created_at).toLocaleString(lang === "ms" ? "ms-MY" : "en-MY")}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  title: { fontSize: 17, fontWeight: "800", color: colors.onSurface },
  card: { flexDirection: "row", gap: spacing.md, backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, ...shadow.card },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  nTitle: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  nBody: { fontSize: 12, color: colors.onSurfaceSecondary, marginTop: 4 },
  nDate: { fontSize: 10, color: colors.muted, marginTop: 6 },
});
