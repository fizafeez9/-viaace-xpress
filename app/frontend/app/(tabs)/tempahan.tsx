import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useLang } from "@/src/context/LanguageContext";
import { useAuth } from "@/src/context/AuthContext";

const STATUS_COLOR: Record<string, string> = {
  searching: colors.warning,
  accepted: colors.info,
  picked_up: colors.info,
  in_transit: colors.info,
  delivered: colors.success,
  cancelled: colors.error,
};

export default function Tempahan() {
  const { t, lang } = useLang();
  const { authFetch } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"active" | "past">("active");
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const r = await authFetch("/api/orders");
    const data = await r.json();
    setOrders(Array.isArray(data) ? data : []);
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  const filtered = orders.filter((o) =>
    tab === "active" ? !["delivered", "cancelled"].includes(o.status) : ["delivered", "cancelled"].includes(o.status),
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.h1}>{t("tab_orders")}</Text>
      </View>
      <View style={styles.segRow}>
        {(["active", "past"] as const).map((k) => (
          <Pressable
            key={k}
            testID={`seg-${k}`}
            onPress={() => setTab(k)}
            style={[styles.seg, tab === k && styles.segActive]}
          >
            <Text style={[styles.segTxt, tab === k && styles.segTxtActive]}>{t(k as any)}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={64} color={colors.muted} />
            <Text style={styles.emptyTxt}>{t("empty_orders")}</Text>
            <Pressable style={styles.emptyBtn} onPress={() => router.push("/(tabs)")}>
              <Text style={styles.emptyBtnTxt}>{t("place_first")}</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            testID={`order-${item.id}`}
            onPress={() => router.push(`/order/tracking/${item.id}`)}
            style={[styles.card, item.status !== "delivered" && item.status !== "cancelled" && styles.activeCard]}
          >
            <View style={styles.cardTop}>
              <Text style={styles.oid}>#{item.id}</Text>
              <View style={[styles.statusPill, { backgroundColor: (STATUS_COLOR[item.status] || colors.muted) + "20" }]}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] || colors.muted }]} />
                <Text style={[styles.statusTxt, { color: STATUS_COLOR[item.status] || colors.muted }]}>
                  {t(item.status as any)}
                </Text>
              </View>
            </View>
            <View style={{ marginTop: spacing.sm, gap: 4 }}>
              <Text style={styles.locLine} numberOfLines={1}>
                <Ionicons name="ellipse" size={10} color={colors.brandPrimary} /> {item.pickup?.address || "-"}
              </Text>
              <Text style={styles.locLine} numberOfLines={1}>
                <Ionicons name="ellipse" size={10} color={colors.brandSecondary} /> {item.stops?.[0]?.address || "-"}
              </Text>
            </View>
            <View style={styles.cardBottom}>
              <Text style={styles.total}>RM {item.quote?.total?.toFixed?.(2) || "0.00"}</Text>
              <Text style={styles.meta}>{new Date(item.created_at).toLocaleString(lang === "ms" ? "ms-MY" : "en-MY")}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  h1: { fontSize: 24, fontWeight: "900", color: colors.onSurface },
  segRow: { flexDirection: "row", marginHorizontal: spacing.lg, backgroundColor: colors.surfaceSecondary, borderRadius: radius.pill, padding: 4 },
  seg: { flex: 1, height: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
  segActive: { backgroundColor: colors.brandPrimary },
  segTxt: { fontSize: 13, fontWeight: "700", color: colors.onSurfaceSecondary },
  segTxtActive: { color: colors.onBrandPrimary },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.divider, ...shadow.card },
  activeCard: { borderColor: colors.borderStrong, borderWidth: 2 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  oid: { fontWeight: "800", color: colors.onSurface },
  statusPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, height: 24, borderRadius: radius.pill, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 11, fontWeight: "800" },
  locLine: { fontSize: 12, color: colors.onSurfaceSecondary },
  cardBottom: { marginTop: spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  total: { fontSize: 18, fontWeight: "900", color: colors.onSurface },
  meta: { fontSize: 11, color: colors.muted },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: spacing.md },
  emptyTxt: { color: colors.onSurfaceSecondary, fontSize: 14 },
  emptyBtn: { marginTop: spacing.md, backgroundColor: colors.brandPrimary, paddingHorizontal: spacing.xl, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  emptyBtnTxt: { fontWeight: "800", color: colors.onBrandPrimary },
});
