import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useLang } from "@/src/context/LanguageContext";
import { useOrderDraft } from "@/src/context/OrderDraftContext";
import { useAuth } from "@/src/context/AuthContext";

export default function Quote() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const quote = useMemo(() => { try { return JSON.parse(q as string); } catch { return null; } }, [q]);
  const { draft } = useOrderDraft();
  const { authFetch } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [pay, setPay] = useState<"card" | "tng">("card");
  const [busy, setBusy] = useState(false);

  const place = async () => {
    if (!quote) return;
    setBusy(true);
    try {
      const r = await authFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          pickup: draft.pickup, stops: draft.stops, size: draft.size, weight: draft.weight,
          vehicle: draft.vehicle, payment_method: pay, notes: draft.notes, quote,
        }),
      });
      const order = await r.json();
      router.replace(`/order/tracking/${order.id}`);
    } finally { setBusy(false); }
  };

  if (!quote) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ padding: 20 }}>Invalid quote</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable testID="back-btn" hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>{t("quote_title")}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 120 }}>
        <View style={styles.card}>
          <Text style={styles.section}>{t("quote_summary")}</Text>
          <View style={styles.locRow}>
            <Ionicons name="ellipse" size={12} color={colors.brandPrimary} />
            <Text style={styles.loc} numberOfLines={2}>{draft.pickup.address}</Text>
          </View>
          {draft.stops.map((s, i) => (
            <View key={i} style={styles.locRow}>
              <Ionicons name="ellipse" size={12} color={colors.brandSecondary} />
              <Text style={styles.loc} numberOfLines={2}>{s.address}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.tagRow}>
            <View style={styles.tag}><Text style={styles.tagTxt}>{draft.size.toUpperCase()}</Text></View>
            <View style={styles.tag}><Text style={styles.tagTxt}>{draft.weight} kg</Text></View>
            <View style={styles.tag}><Text style={styles.tagTxt}>{draft.vehicle === "motor" ? "Motor" : "Kereta"}</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.kv}><Text style={styles.k}>{t("base_fare")}</Text><Text style={styles.v}>RM {quote.base_fare.toFixed(2)}</Text></View>
          <View style={styles.kv}><Text style={styles.k}>{t("distance_fare")} ({quote.distance_km} km)</Text><Text style={styles.v}>RM {quote.distance_fare.toFixed(2)}</Text></View>
          <View style={styles.kv}><Text style={styles.k}>{t("surcharge")}</Text><Text style={styles.v}>RM {quote.size_surcharge.toFixed(2)}</Text></View>
          <View style={styles.kv}><Text style={styles.k}>{t("eta")}</Text><Text style={styles.v}>~{quote.eta_min} min</Text></View>
          <View style={styles.divider} />
          <View style={styles.kv}><Text style={styles.total}>{t("total")}</Text><Text style={styles.totalV}>RM {quote.total.toFixed(2)}</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>{t("payment_method")}</Text>
          {([
            { k: "card", i: "card-outline", l: t("pay_card") },
            { k: "tng", i: "wallet-outline", l: t("pay_tng") },
          ] as const).map((o) => (
            <Pressable
              key={o.k}
              testID={`pay-${o.k}`}
              onPress={() => setPay(o.k)}
              style={[styles.payRow, pay === o.k && styles.payRowActive]}
            >
              <Ionicons name={o.i as any} size={22} color={colors.onSurface} />
              <Text style={styles.payLabel}>{o.l}</Text>
              <Ionicons
                name={pay === o.k ? "radio-button-on" : "radio-button-off"}
                size={22}
                color={pay === o.k ? colors.brandPrimary : colors.muted}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          testID="place-order-btn"
          disabled={busy}
          onPress={place}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.ctaTxt}>{busy ? "..." : `${t("place_order")}  •  RM ${quote.total.toFixed(2)}`}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  title: { fontSize: 17, fontWeight: "800", color: colors.onSurface },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  section: { fontSize: 14, fontWeight: "800", color: colors.onSurface, marginBottom: spacing.md },
  locRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: 4 },
  loc: { flex: 1, color: colors.onSurface, fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  tagRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  tag: { backgroundColor: colors.surfaceTertiary, paddingHorizontal: 10, height: 26, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  tagTxt: { fontSize: 11, fontWeight: "700", color: colors.onSurfaceTertiary },
  kv: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  k: { color: colors.onSurfaceSecondary, fontSize: 13 },
  v: { color: colors.onSurface, fontSize: 13, fontWeight: "700" },
  total: { color: colors.onSurface, fontSize: 15, fontWeight: "800" },
  totalV: { color: colors.onSurface, fontSize: 20, fontWeight: "900" },
  payRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.md, height: 52, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, marginBottom: spacing.sm },
  payRowActive: { backgroundColor: colors.surfaceTertiary, borderColor: colors.borderStrong, borderWidth: 2 },
  payLabel: { flex: 1, fontWeight: "700", color: colors.onSurface },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, padding: spacing.lg, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.divider },
  cta: { backgroundColor: colors.brandPrimary, height: 54, borderRadius: radius.md, alignItems: "center", justifyContent: "center", ...shadow.cta },
  ctaTxt: { fontWeight: "900", color: colors.onBrandPrimary, fontSize: 14, letterSpacing: 0.5 },
});
