import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useRider } from "@/src/context/RiderContext";

const STATUS_LABEL: Record<string, string> = {
  searching: "Menunggu",
  accepted: "Diterima",
  picked_up: "Diambil",
  in_transit: "Dalam hantaran",
  delivered: "Dihantar",
  cancelled: "Dibatalkan",
};
const STATUS_COLOR: Record<string, string> = {
  searching: colors.warning,
  accepted: colors.info,
  picked_up: colors.info,
  in_transit: colors.info,
  delivered: colors.success,
  cancelled: colors.error,
};

export default function RiderDashboard() {
  const { rider, loading, riderFetch, logoutRider } = useRider();
  const router = useRouter();
  const [tab, setTab] = useState<"pending" | "mine">("pending");
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const path = tab === "pending" ? "/api/rider/orders/pending" : "/api/rider/orders/mine";
    const r = await riderFetch(path);
    if (r.ok) setOrders(await r.json());
  }, [tab, riderFetch]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { load(); }, [tab, load]);

  if (loading) return null;
  if (!rider) return <Redirect href="/rider/login" />;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.riderCard}>
          <Image source={{ uri: rider.photo }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.riderName}>{rider.name}</Text>
            <Text style={styles.riderMeta}>
              <Ionicons name="star" size={11} color={colors.warning} /> {rider.rating} · {rider.plate}
            </Text>
          </View>
          <Pressable
            testID="rider-logout"
            onPress={async () => { await logoutRider(); router.replace("/login"); }}
            style={styles.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
          </Pressable>
        </View>
      </View>

      <View style={styles.segRow}>
        {(["pending", "mine"] as const).map((k) => (
          <Pressable
            key={k}
            testID={`rider-tab-${k}`}
            onPress={() => setTab(k)}
            style={[styles.seg, tab === k && styles.segActive]}
          >
            <Text style={[styles.segTxt, tab === k && styles.segTxtActive]}>
              {k === "pending" ? "Order Baru" : "Order Saya"}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-outline" size={56} color={colors.muted} />
            <Text style={styles.emptyTxt}>
              {tab === "pending" ? "Tiada order tersedia. Tarik ke bawah untuk refresh." : "Tiada order aktif."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            testID={`rider-order-${item.id}`}
            onPress={() => router.push(`/rider/order/${item.id}`)}
            style={[styles.card, tab === "mine" && item.status !== "delivered" && styles.cardActive]}
          >
            <View style={styles.cardTop}>
              <Text style={styles.oid}>#{item.id}</Text>
              <View style={[styles.statusPill, { backgroundColor: (STATUS_COLOR[item.status] || colors.muted) + "20" }]}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] || colors.muted }]} />
                <Text style={[styles.statusTxt, { color: STATUS_COLOR[item.status] || colors.muted }]}>
                  {STATUS_LABEL[item.status]}
                </Text>
              </View>
            </View>
            <View style={{ marginTop: spacing.sm, gap: 4 }}>
              <Text style={styles.locLine} numberOfLines={1}>
                <Ionicons name="ellipse" size={9} color={colors.brandPrimary} /> {item.pickup?.address || "-"}
              </Text>
              <Text style={styles.locLine} numberOfLines={1}>
                <Ionicons name="ellipse" size={9} color={colors.brandSecondary} /> {item.stops?.[0]?.address || "-"}
              </Text>
            </View>
            <View style={styles.cardBottom}>
              <View style={styles.tagRow}>
                <Ionicons name={item.vehicle === "motor" ? "bicycle" : "car"} size={14} color={colors.onSurface} />
                <Text style={styles.tagTxt}>{item.size?.toUpperCase()} · {item.weight} kg</Text>
              </View>
              <Text style={styles.total}>RM {item.final_total?.toFixed?.(2) || item.quote?.total?.toFixed?.(2) || "0.00"}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { padding: spacing.lg },
  riderCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.brandTertiary, padding: spacing.md, borderRadius: radius.lg },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceSecondary },
  riderName: { fontSize: 15, fontWeight: "800", color: colors.onSurface },
  riderMeta: { fontSize: 11, color: colors.onSurfaceSecondary, marginTop: 2 },
  logoutBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  segRow: { flexDirection: "row", marginHorizontal: spacing.lg, backgroundColor: colors.surfaceSecondary, borderRadius: radius.pill, padding: 4 },
  seg: { flex: 1, height: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
  segActive: { backgroundColor: colors.brandPrimary },
  segTxt: { fontSize: 12, fontWeight: "800", color: colors.onSurfaceSecondary },
  segTxtActive: { color: colors.onBrandPrimary },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.divider, ...shadow.card },
  cardActive: { borderColor: colors.borderStrong, borderWidth: 2 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  oid: { fontWeight: "800", color: colors.onSurface, fontSize: 13 },
  statusPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, height: 22, borderRadius: radius.pill, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 10, fontWeight: "800" },
  locLine: { fontSize: 12, color: colors.onSurfaceSecondary },
  cardBottom: { marginTop: spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tagTxt: { fontSize: 11, fontWeight: "700", color: colors.onSurfaceSecondary },
  total: { fontSize: 18, fontWeight: "900", color: colors.onSurface },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: spacing.md, paddingHorizontal: spacing.xl },
  emptyTxt: { color: colors.muted, fontSize: 13, textAlign: "center" },
});
