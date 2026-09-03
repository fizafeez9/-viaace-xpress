import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useLang } from "@/src/context/LanguageContext";
import { useOrderDraft, Size, Weight, Vehicle } from "@/src/context/OrderDraftContext";
import { useAuth } from "@/src/context/AuthContext";
import { BrandLogo } from "@/src/components/BrandLogo";

const KL = { lat: 3.139, lng: 101.6869 };

type FavAddr = { id: string; label: string; address: string; lat?: number; lng?: number; icon?: string };

export default function Home() {
  const { t } = useLang();
  const router = useRouter();
  const { draft, setDraft } = useOrderDraft();
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [favs, setFavs] = useState<FavAddr[]>([]);

  const loadFavs = async () => {
    try {
      const r = await authFetch("/api/addresses");
      if (r.ok) setFavs(await r.json());
    } catch {}
  };
  useFocusEffect(useCallback(() => { loadFavs(); }, []));

  const useFav = (f: FavAddr, target: "pickup" | "dest") => {
    Haptics.selectionAsync();
    const loc = { label: target === "pickup" ? "Pickup" : "Destinasi", address: f.address, lat: f.lat, lng: f.lng };
    if (target === "pickup") setDraft((d) => ({ ...d, pickup: loc }));
    else setDraft((d) => { const stops = [...d.stops]; stops[0] = loc; return { ...d, stops }; });
  };

  const setSize = (s: Size) => { Haptics.selectionAsync(); setDraft((d) => ({ ...d, size: s })); };
  const setWeight = (w: Weight) => { Haptics.selectionAsync(); setDraft((d) => ({ ...d, weight: w })); };
  const setVehicle = (v: Vehicle) => { Haptics.selectionAsync(); setDraft((d) => ({ ...d, vehicle: v })); };

  const useMyLocation = () => {
    setDraft((d) => ({ ...d, pickup: { label: "Pickup", address: "Lokasi Saya (KL Sentral)", lat: KL.lat, lng: KL.lng } }));
  };
  const addStop = () => {
    setDraft((d) => ({ ...d, stops: [...d.stops, { label: `Henti ${d.stops.length + 1}`, address: "" }] }));
  };

  const check = async () => {
    if (!draft.pickup.address || !draft.stops[0]?.address) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const withCoords = (loc: any, seed: number) => ({
        ...loc,
        lat: loc.lat ?? KL.lat + Math.sin(seed) * 0.03,
        lng: loc.lng ?? KL.lng + Math.cos(seed) * 0.03,
      });
      const pickup = withCoords(draft.pickup, 1);
      const stops = draft.stops.map((s, i) => withCoords(s, i + 2));
      const r = await authFetch("/api/quote", {
        method: "POST",
        body: JSON.stringify({ pickup, stops, size: draft.size, weight: draft.weight, vehicle: draft.vehicle }),
      });
      const q = await r.json();
      setDraft((d) => ({ ...d, pickup, stops }));
      router.push({ pathname: "/order/quote", params: { q: JSON.stringify(q) } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable testID="menu-btn" hitSlop={12} onPress={() => router.push("/menu")}>
            <Ionicons name="menu" size={26} color={colors.onSurface} />
          </Pressable>
          <BrandLogo />
          <Pressable testID="notifications-btn" hitSlop={12} onPress={() => router.push("/notifications")}>
            <View>
              <Ionicons name="notifications-outline" size={24} color={colors.onSurface} />
              <View style={styles.dot} />
            </View>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={[colors.brandTertiary, "#FFFDF3"]} style={styles.hero}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{t("tagline_1")}</Text>
              <Text style={styles.heroTitle}>{t("tagline_2")}</Text>
              <Text style={styles.heroSub}>
                {t("tagline_sub")} <Text style={{ color: colors.brandPrimary, fontWeight: "800" }}>ViaAce Xpress</Text>.
              </Text>
            </View>
          </LinearGradient>

          {/* Favourites */}
          {favs.length > 0 && (
            <View style={styles.favSection}>
              <Text style={styles.favTitle}>⭐ {t("favorites")}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.favRow}
              >
                {favs.map((f) => (
                  <Pressable
                    key={f.id}
                    testID={`fav-${f.id}`}
                    onPress={() => useFav(f, "pickup")}
                    onLongPress={() => useFav(f, "dest")}
                    style={styles.favChip}
                  >
                    <Ionicons name={(f.icon || "location") as any} size={16} color={colors.brandSecondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.favChipLabel} numberOfLines={1}>{f.label}</Text>
                      <Text style={styles.favChipAddr} numberOfLines={1}>{f.address}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={styles.favHint}>Ketik untuk pickup • tekan-lama untuk destinasi</Text>
            </View>
          )}

          <View style={styles.card}>
            <View style={styles.locationsBlock}>
              <View style={styles.locRow}>
                <View style={styles.timelineCol}>
                  <Ionicons name="location" size={20} color={colors.brandPrimary} />
                  <View style={styles.timelineLine} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepLabel}>{t("step_from")}</Text>
                  <View style={styles.inputRow}>
                    <Pressable
                      testID="pickup-input"
                      onPress={() => router.push({ pathname: "/location-picker", params: { field: "pickup" } })}
                      style={[styles.inputPressable, { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 46, paddingHorizontal: spacing.md, justifyContent: "center", backgroundColor: colors.surface }]}
                    >
                      <Text style={[styles.inputTxt, !draft.pickup.address && styles.placeholderText]} numberOfLines={1}>
                        {draft.pickup.address || t("ph_pickup")}
                      </Text>
                    </Pressable>
                    <Pressable testID="my-location-btn" onPress={useMyLocation} style={styles.rightBtn}>
                      <Ionicons name="locate" size={18} color={colors.onSurface} />
                      <Text style={styles.rightBtnTxt}>{t("my_location")}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {draft.stops.map((stop, idx) => (
                <View key={idx} style={styles.locRow}>
                  <View style={styles.timelineCol}>
                    <Ionicons name="location" size={20} color={colors.brandSecondary} />
                    {idx < draft.stops.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepLabel}>
                      {idx === 0 ? t("step_to") : `${idx + 2}. Henti ${idx + 1}`}
                    </Text>
                    <View style={styles.inputRow}>
                      <Pressable
                        testID={idx === 0 ? "dest-input" : `stop-${idx}-input`}
                        onPress={() => router.push({ pathname: "/location-picker", params: { field: idx === 0 ? "stop-0" : `stop-${idx}` } })}
                        style={[styles.inputPressable, { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 46, paddingHorizontal: spacing.md, justifyContent: "center", backgroundColor: colors.surface }]}
                      >
                        <Text style={[styles.inputTxt, !stop.address && styles.placeholderText]} numberOfLines={1}>
                          {stop.address || t("ph_dest")}
                        </Text>
                      </Pressable>
                      {idx === 0 && (
                        <Pressable testID="add-stop-btn" onPress={addStop} style={styles.rightBtn}>
                          <Ionicons name="add-circle-outline" size={18} color={colors.onSurface} />
                          <Text style={styles.rightBtnTxt}>{t("add_stop")}</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.section}>{t("step_size")}</Text>
            <View style={styles.row3}>
              {(["small", "medium", "large"] as Size[]).map((s) => (
                <Pressable
                  key={s}
                  testID={`size-${s}`}
                  onPress={() => setSize(s)}
                  style={[styles.optCard, draft.size === s && styles.optCardActive]}
                >
                  {draft.size === s && (
                    <View style={styles.checkBadge}><Ionicons name="checkmark" size={12} color="#000" /></View>
                  )}
                  <Text style={styles.boxEmoji}>📦</Text>
                  <Text style={styles.optTitle}>{t(s as any)}</Text>
                  <Text style={styles.optSub}>{t((s + "_sub") as any)}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.section}>{t("step_weight")}</Text>
            <View style={styles.chips}>
              {(["<5", "5-10", "10-20", "20+"] as Weight[]).map((w) => (
                <Pressable
                  key={w}
                  testID={`weight-${w}`}
                  onPress={() => setWeight(w)}
                  style={[styles.chip, draft.weight === w && styles.chipActive]}
                >
                  <Text style={[styles.chipTxt, draft.weight === w && styles.chipTxtActive]}>{w} kg</Text>
                  {draft.weight === w && <Ionicons name="checkmark-circle" size={14} color={colors.brandPrimary} style={{ marginLeft: 4 }} />}
                </Pressable>
              ))}
            </View>

            <Text style={styles.section}>{t("step_vehicle")}</Text>
            <View style={styles.row2}>
              {(["motor", "kereta"] as Vehicle[]).map((v) => (
                <Pressable
                  key={v}
                  testID={`vehicle-${v}`}
                  onPress={() => setVehicle(v)}
                  style={[styles.vCard, draft.vehicle === v && styles.optCardActive]}
                >
                  {draft.vehicle === v && (
                    <View style={styles.checkBadge}><Ionicons name="checkmark" size={12} color="#000" /></View>
                  )}
                  <Image
                    source={{ uri: v === "motor"
                      ? "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=200&fit=crop&auto=format"
                      : "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&fit=crop&auto=format" }}
                    style={styles.vImg}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optTitle}>{t(v as any)}</Text>
                    <Text style={styles.optSub}>{t((v + "_sub") as any)}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <Pressable
              testID="check-price-btn"
              disabled={loading}
              onPress={check}
              style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.ctaTxt}>{loading ? "..." : t("check_price")}</Text>
              <Ionicons name="chevron-forward" size={20} color="#000" />
            </Pressable>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  dot: { position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: { flexDirection: "row", padding: spacing.lg, borderRadius: radius.lg, alignItems: "center", ...shadow.card, marginBottom: spacing.md },
  heroTitle: { fontSize: 22, fontWeight: "800", color: colors.onSurface, lineHeight: 28 },
  heroSub: { fontSize: 13, color: colors.onSurfaceSecondary, marginTop: spacing.sm, lineHeight: 18 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.divider, ...shadow.card },
  locationsBlock: { gap: spacing.md },
  locRow: { flexDirection: "row", gap: spacing.sm },
  timelineCol: { width: 24, alignItems: "center" },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 4 },
  stepLabel: { fontSize: 15, fontWeight: "700", color: colors.onSurface, marginBottom: 6 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  inputPressable: { flexDirection: "row", alignItems: "center", gap: 8 },
  inputTxt: { flex: 1, fontSize: 14, color: colors.onSurface },
  placeholderText: { color: colors.muted },
  rightBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  rightBtnTxt: { fontSize: 12, fontWeight: "700", color: colors.onSurface },
  section: { fontSize: 15, fontWeight: "700", color: colors.onSurface, marginTop: spacing.xl, marginBottom: spacing.md },
  row3: { flexDirection: "row", gap: spacing.sm },
  row2: { flexDirection: "row", gap: spacing.sm },
  optCard: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, alignItems: "center", backgroundColor: colors.surface, minHeight: 110 },
  optCardActive: { backgroundColor: colors.surfaceTertiary, borderColor: colors.borderStrong, borderWidth: 2 },
  boxEmoji: { fontSize: 30, marginBottom: 4 },
  optTitle: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  optSub: { fontSize: 11, color: colors.onSurfaceSecondary, textAlign: "center", marginTop: 2 },
  checkBadge: { position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center", zIndex: 1 },
  chips: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  chip: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, height: 42, borderRadius: radius.md, backgroundColor: colors.surface, minWidth: 76, justifyContent: "center" },
  chipActive: { backgroundColor: colors.surfaceTertiary, borderColor: colors.borderStrong, borderWidth: 2 },
  chipTxt: { fontSize: 13, fontWeight: "700", color: colors.onSurface },
  chipTxtActive: { color: colors.onSurface },
  vCard: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, backgroundColor: colors.surface },
  vImg: { width: 60, height: 40, borderRadius: 8, backgroundColor: colors.surfaceSecondary },
  cta: { marginTop: spacing.xl, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.brandPrimary, height: 54, borderRadius: radius.md, ...shadow.cta },
  ctaTxt: { fontSize: 15, fontWeight: "900", color: colors.onBrandPrimary, letterSpacing: 1, marginRight: 8 },
  favSection: { marginBottom: spacing.md },
  favTitle: { fontSize: 14, fontWeight: "800", color: colors.onSurface, marginBottom: spacing.sm },
  favRow: { gap: spacing.sm, paddingRight: spacing.lg },
  favChip: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, maxWidth: 220, minWidth: 140, ...shadow.card, flexShrink: 0 },
  favChipLabel: { fontSize: 12, fontWeight: "800", color: colors.onSurface },
  favChipAddr: { fontSize: 10, color: colors.onSurfaceSecondary, marginTop: 1 },
  favHint: { fontSize: 10, color: colors.muted, marginTop: 6 },
});
