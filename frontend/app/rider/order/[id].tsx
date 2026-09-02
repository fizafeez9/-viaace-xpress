import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useRider } from "@/src/context/RiderContext";

const NEXT_STATUS: Record<string, { next: string; label: string } | null> = {
  accepted: { next: "picked_up", label: "AMBIL BUNGKUSAN" },
  picked_up: { next: "in_transit", label: "MULA HANTAR" },
  in_transit: { next: "delivered", label: "TANDA DIHANTAR" },
  delivered: null,
};

export default function RiderOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { riderFetch, rider } = useRider();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const locTimer = useRef<any>(null);

  const load = useCallback(async () => {
    // Riders don't have GET /orders/{id}, use pending/mine list
    const r = await riderFetch(`/api/rider/orders/mine`);
    if (r.ok) {
      const list = await r.json();
      const found = list.find((o: any) => o.id === id);
      if (found) { setOrder(found); return; }
    }
    const p = await riderFetch(`/api/rider/orders/pending`);
    if (p.ok) {
      const list = await p.json();
      const found = list.find((o: any) => o.id === id);
      if (found) setOrder(found);
    }
  }, [id, riderFetch]);

  useEffect(() => { load(); }, [load]);

  // Simulate live GPS: nudge rider location every 4s toward pickup/dest
  useEffect(() => {
    if (!order || !rider) return;
    if (!["accepted", "picked_up", "in_transit"].includes(order.status)) return;
    locTimer.current = setInterval(async () => {
      const rl = order.rider_location || { lat: 3.14, lng: 101.69 };
      const target = ["accepted"].includes(order.status)
        ? order.pickup
        : (order.stops?.[0] || order.pickup);
      if (target?.lat == null) return;
      const next = {
        lat: rl.lat + (target.lat - rl.lat) * 0.15,
        lng: rl.lng + (target.lng - rl.lng) * 0.15,
      };
      await riderFetch(`/api/rider/orders/${id}/location`, {
        method: "POST",
        body: JSON.stringify(next),
      }).catch(() => {});
      setOrder((o: any) => o ? { ...o, rider_location: next } : o);
    }, 4000);
    return () => clearInterval(locTimer.current);
  }, [order?.status, id, rider, riderFetch]);

  const accept = async () => {
    setBusy(true);
    try {
      const r = await riderFetch(`/api/rider/orders/${id}/accept`, { method: "POST" });
      if (r.ok) await load();
      else {
        const e = await r.json().catch(() => ({}));
        Alert.alert("Ralat", e.detail || "Gagal terima order");
      }
    } finally { setBusy(false); }
  };

  const advance = async () => {
    if (!order) return;
    const step = NEXT_STATUS[order.status];
    if (!step) return;
    setBusy(true);
    try {
      const r = await riderFetch(`/api/rider/orders/${id}/status`, {
        method: "POST", body: JSON.stringify({ status: step.next }),
      });
      if (r.ok) await load();
    } finally { setBusy(false); }
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}><Text style={{ padding: 20 }}>Memuatkan…</Text></SafeAreaView>
    );
  }

  const isMine = order.rider?.rider_id === rider?.rider_id;
  const nextStep = NEXT_STATUS[order.status];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>#{order.id}</Text>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={[styles.card, { backgroundColor: colors.surfaceTertiary }]}>
          <Text style={styles.statusBig}>{order.status.toUpperCase().replace("_", " ")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>📍 Pickup</Text>
          <Text style={styles.addr}>{order.pickup?.address}</Text>
          <View style={styles.sep} />
          <Text style={styles.section}>🏁 Destinasi</Text>
          {order.stops?.map((s: any, i: number) => (
            <Text key={i} style={styles.addr}>{s.address}</Text>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.kv}><Text style={styles.k}>Saiz</Text><Text style={styles.v}>{order.size?.toUpperCase()}</Text></View>
          <View style={styles.kv}><Text style={styles.k}>Berat</Text><Text style={styles.v}>{order.weight} kg</Text></View>
          <View style={styles.kv}><Text style={styles.k}>Kenderaan</Text><Text style={styles.v}>{order.vehicle === "motor" ? "Motor" : "Kereta"}</Text></View>
          <View style={styles.kv}><Text style={styles.k}>Jarak</Text><Text style={styles.v}>{order.quote?.distance_km} km</Text></View>
          <View style={styles.kv}><Text style={styles.k}>Bayaran</Text><Text style={styles.v}>{order.payment_method === "cash" ? "Tunai" : order.payment_method === "card" ? "Kad" : "TnG"}</Text></View>
          {order.notes && (
            <>
              <View style={styles.sep} />
              <Text style={styles.k}>Nota pelanggan</Text>
              <Text style={styles.v}>{order.notes}</Text>
            </>
          )}
          <View style={styles.sep} />
          <View style={styles.kv}>
            <Text style={styles.total}>Pendapatan</Text>
            <Text style={styles.totalV}>RM {(order.final_total || order.quote?.total || 0).toFixed(2)}</Text>
          </View>
        </View>

        {order.rider_location && (
          <View style={styles.card}>
            <Text style={styles.section}>📡 Lokasi Semasa (live)</Text>
            <Text style={styles.addr}>
              {order.rider_location.lat.toFixed(5)}, {order.rider_location.lng.toFixed(5)}
            </Text>
            <Text style={styles.hint}>Dikemaskini secara automatik setiap 4 saat.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {order.status === "searching" ? (
          <Pressable testID="rider-accept-btn" onPress={accept} disabled={busy} style={styles.cta}>
            <Text style={styles.ctaTxt}>TERIMA ORDER</Text>
          </Pressable>
        ) : isMine && nextStep ? (
          <Pressable testID="rider-advance-btn" onPress={advance} disabled={busy} style={styles.cta}>
            <Text style={styles.ctaTxt}>{nextStep.label}</Text>
          </Pressable>
        ) : (
          <View style={[styles.cta, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.ctaTxt, { color: colors.onSurfaceSecondary }]}>
              {order.status === "delivered" ? "SELESAI" : "MENUNGGU"}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  title: { fontSize: 15, fontWeight: "800", color: colors.onSurface },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  statusBig: { fontSize: 18, fontWeight: "900", color: colors.onSurface, textAlign: "center", letterSpacing: 1 },
  section: { fontSize: 12, fontWeight: "800", color: colors.onSurfaceSecondary, marginBottom: 4 },
  addr: { fontSize: 14, color: colors.onSurface, fontWeight: "600" },
  sep: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  kv: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  k: { color: colors.onSurfaceSecondary, fontSize: 13 },
  v: { color: colors.onSurface, fontSize: 13, fontWeight: "700" },
  total: { color: colors.onSurface, fontSize: 15, fontWeight: "800" },
  totalV: { color: colors.success, fontSize: 20, fontWeight: "900" },
  hint: { fontSize: 11, color: colors.muted, marginTop: 6 },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.surface },
  cta: { backgroundColor: colors.brandPrimary, height: 54, borderRadius: radius.md, alignItems: "center", justifyContent: "center", ...shadow.cta },
  ctaTxt: { fontWeight: "900", color: colors.onBrandPrimary, letterSpacing: 1 },
});
