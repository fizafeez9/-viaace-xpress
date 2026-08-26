import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useLang } from "@/src/context/LanguageContext";
import { useAuth } from "@/src/context/AuthContext";

// Conditional import for react-native-maps (avoid web crash)
let MapView: any, Marker: any, Polyline: any, PROVIDER_GOOGLE: any;
if (Platform.OS !== "web") {
  try {
    const M = require("react-native-maps");
    MapView = M.default;
    Marker = M.Marker;
    Polyline = M.Polyline;
    PROVIDER_GOOGLE = M.PROVIDER_GOOGLE;
  } catch {}
}

const STEPS = ["searching", "accepted", "picked_up", "in_transit", "delivered"] as const;

export default function Tracking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { authFetch } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const timer = useRef<any>(null);

  const load = async () => {
    const r = await authFetch(`/api/orders/${id}`);
    if (r.ok) setOrder(await r.json());
  };
  useEffect(() => {
    load();
    timer.current = setInterval(load, 5000);
    return () => clearInterval(timer.current);
  }, [id]);

  const stepIdx = order ? STEPS.indexOf(order.status) : -1;

  const region = useMemo(() => {
    if (!order?.rider_location) return { latitude: 3.139, longitude: 101.6869, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    return {
      latitude: order.rider_location.lat,
      longitude: order.rider_location.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [order?.rider_location]);

  const cancel = async () => {
    Alert.alert("Batalkan Tempahan?", "Anda pasti mahu membatalkan tempahan ini?", [
      { text: t("cancel"), style: "cancel" },
      { text: t("ok"), style: "destructive", onPress: async () => {
        await authFetch(`/api/orders/${id}/cancel`, { method: "POST" });
        load();
      }},
    ]);
  };

  const onDelivered = () => router.replace(`/order/rate/${id}`);

  return (
    <View style={styles.wrap} testID="tracking-screen">
      {/* Map background */}
      {MapView && order?.rider_location ? (
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          region={region}
          provider={PROVIDER_GOOGLE}
        >
          <Marker coordinate={{ latitude: order.rider_location.lat, longitude: order.rider_location.lng }}>
            <View style={styles.riderPin}><Ionicons name="bicycle" size={16} color="#000" /></View>
          </Marker>
          {order.pickup?.lat != null && (
            <Marker coordinate={{ latitude: order.pickup.lat, longitude: order.pickup.lng }} pinColor="#FFD60A" />
          )}
          {order.stops?.[0]?.lat != null && (
            <Marker coordinate={{ latitude: order.stops[0].lat, longitude: order.stops[0].lng }} pinColor="#000" />
          )}
          {order.pickup?.lat != null && order.stops?.[0]?.lat != null && (
            <Polyline
              coordinates={[
                { latitude: order.rider_location.lat, longitude: order.rider_location.lng },
                { latitude: order.pickup.lat, longitude: order.pickup.lng },
                { latitude: order.stops[0].lat, longitude: order.stops[0].lng },
              ]}
              strokeColor={colors.brandPrimary}
              strokeWidth={4}
            />
          )}
        </MapView>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.mapFallback]}>
          <Ionicons name="map-outline" size={48} color={colors.muted} />
          <Text style={{ color: colors.muted, marginTop: 8 }}>Peta tidak tersedia di web preview</Text>
        </View>
      )}

      <SafeAreaView edges={["top"]} style={styles.topBar}>
        <Pressable testID="back-btn" onPress={() => router.replace("/(tabs)/tempahan")} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <View style={styles.oidPill}>
          <Text style={styles.oidTxt}>#{id}</Text>
        </View>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      {/* Bottom sheet-like card */}
      <SafeAreaView edges={["bottom"]} style={styles.sheet}>
        <View style={styles.grabber} />
        <View style={styles.statusBanner}>
          <View style={styles.statusIndicator} />
          <Text style={styles.statusText}>{order ? t(order.status as any) : "…"}</Text>
        </View>

        {/* Rider info */}
        {order?.rider && stepIdx >= 1 && (
          <View style={styles.riderRow}>
            <Image source={{ uri: order.rider.photo }} style={styles.riderAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.riderName}>{order.rider.name}</Text>
              <Text style={styles.riderMeta}>
                <Ionicons name="star" size={12} color={colors.warning} /> {order.rider.rating} • {order.rider.plate}
              </Text>
            </View>
            <Pressable testID="call-btn" style={styles.roundBtn}>
              <Ionicons name="call" size={18} color="#000" />
            </Pressable>
            <Pressable testID="chat-btn" onPress={() => router.push(`/order/chat/${id}`)} style={styles.roundBtn}>
              <Ionicons name="chatbubble" size={18} color="#000" />
            </Pressable>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.timeline}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.tlItem}>
              <View style={[styles.tlDot, i <= stepIdx && styles.tlDotDone]}>
                {i <= stepIdx && <Ionicons name="checkmark" size={12} color="#000" />}
              </View>
              <Text style={[styles.tlTxt, i <= stepIdx && styles.tlTxtDone]}>{t(s as any)}</Text>
              {i < STEPS.length - 1 && <View style={[styles.tlLine, i <= stepIdx && styles.tlLineDone]} />}
            </View>
          ))}
        </View>

        {order?.status === "delivered" ? (
          <Pressable testID="rate-btn" onPress={onDelivered} style={styles.primaryBtn}>
            <Text style={styles.primaryTxt}>{t("rate_title")}</Text>
          </Pressable>
        ) : order?.status === "cancelled" ? (
          <View style={[styles.primaryBtn, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.primaryTxt, { color: colors.onSurfaceSecondary }]}>{t("cancelled")}</Text>
          </View>
        ) : (
          <Pressable testID="cancel-btn" onPress={cancel} style={styles.cancelBtn}>
            <Text style={styles.cancelTxt}>{t("cancel_order")}</Text>
          </Pressable>
        )}
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surfaceSecondary },
  mapFallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceSecondary },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", ...shadow.card },
  oidPill: { paddingHorizontal: spacing.md, height: 34, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", ...shadow.card },
  oidTxt: { fontSize: 12, fontWeight: "800", color: colors.onSurface },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, gap: spacing.md, ...shadow.cta },
  grabber: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.divider, marginBottom: spacing.sm },
  statusBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surfaceTertiary, padding: spacing.md, borderRadius: radius.md },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandPrimary },
  statusText: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  riderRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.divider },
  riderAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceSecondary },
  riderName: { fontWeight: "800", color: colors.onSurface },
  riderMeta: { fontSize: 12, color: colors.onSurfaceSecondary, marginTop: 2 },
  roundBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  timeline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
  tlItem: { alignItems: "center", flexDirection: "row" },
  tlDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  tlDotDone: { backgroundColor: colors.brandPrimary },
  tlTxt: { fontSize: 9, color: colors.muted, position: "absolute", top: 26, width: 60, textAlign: "center", marginLeft: -19 },
  tlTxtDone: { color: colors.onSurface, fontWeight: "700" },
  tlLine: { width: 20, height: 2, backgroundColor: colors.divider, marginHorizontal: 2 },
  tlLineDone: { backgroundColor: colors.brandPrimary },
  primaryBtn: { marginTop: spacing.lg, backgroundColor: colors.brandPrimary, height: 50, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  primaryTxt: { fontWeight: "900", color: colors.onBrandPrimary },
  cancelBtn: { marginTop: spacing.lg, height: 50, borderRadius: radius.md, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.error },
  cancelTxt: { fontWeight: "800", color: colors.error },
  riderPin: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#000" },
});
