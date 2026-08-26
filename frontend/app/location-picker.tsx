import React, { useState, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useLang } from "@/src/context/LanguageContext";
import { useOrderDraft } from "@/src/context/OrderDraftContext";
import MapPicker from "@/src/components/MapPicker";

const KL_PLACES: { name: string; sub: string; lat: number; lng: number }[] = [
  { name: "KL Sentral", sub: "Stesen Sentral Kuala Lumpur", lat: 3.1339, lng: 101.6869 },
  { name: "KLCC / Petronas Twin Towers", sub: "Jln Ampang, KL", lat: 3.1578, lng: 101.7117 },
  { name: "Mid Valley Megamall", sub: "Lingkaran Syed Putra, KL", lat: 3.1180, lng: 101.6772 },
  { name: "Sunway Pyramid", sub: "Bandar Sunway, Petaling Jaya", lat: 3.0723, lng: 101.6069 },
  { name: "1 Utama Shopping Centre", sub: "Bandar Utama, PJ", lat: 3.1500, lng: 101.6155 },
  { name: "Bangsar Village", sub: "Jln Telawi, Bangsar", lat: 3.1300, lng: 101.6706 },
  { name: "Pavilion Kuala Lumpur", sub: "Bukit Bintang, KL", lat: 3.1494, lng: 101.7135 },
  { name: "The Curve", sub: "Mutiara Damansara, PJ", lat: 3.1583, lng: 101.6083 },
  { name: "Setia Alam", sub: "Shah Alam, Selangor", lat: 3.1058, lng: 101.4586 },
  { name: "Cyberjaya", sub: "Sepang, Selangor", lat: 2.9188, lng: 101.6520 },
  { name: "Putrajaya Sentral", sub: "Putrajaya", lat: 2.9451, lng: 101.7079 },
  { name: "KLIA Terminal 1", sub: "Sepang, Selangor", lat: 2.7456, lng: 101.7099 },
  { name: "IOI City Mall", sub: "Putrajaya", lat: 2.9700, lng: 101.7127 },
  { name: "USJ Taipan", sub: "Subang Jaya, Selangor", lat: 3.0442, lng: 101.5875 },
  { name: "Ampang Point", sub: "Ampang, Selangor", lat: 3.1499, lng: 101.7627 },
  { name: "Taman Tun Dr Ismail", sub: "TTDI, KL", lat: 3.1400, lng: 101.6303 },
  { name: "Cheras Leisure Mall", sub: "Cheras, KL", lat: 3.0817, lng: 101.7295 },
  { name: "Kepong Baru", sub: "Kepong, KL", lat: 3.2135, lng: 101.6371 },
];

export default function LocationPicker() {
  const { field } = useLocalSearchParams<{ field: string }>();
  const router = useRouter();
  const { t } = useLang();
  const { setDraft } = useOrderDraft();
  const [query, setQuery] = useState("");
  const [coord, setCoord] = useState<{ lat: number; lng: number }>({ lat: 3.139, lng: 101.6869 });
  const [address, setAddress] = useState("");
  const [mode, setMode] = useState<"search" | "map">("search");

  const isPickup = field === "pickup";
  const stopIdx = !isPickup && field?.startsWith("stop-") ? parseInt(field.split("-")[1], 10) : -1;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return KL_PLACES;
    return KL_PLACES.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q),
    );
  }, [query]);

  const pick = (item: { name: string; sub: string; lat: number; lng: number }) => {
    setCoord({ lat: item.lat, lng: item.lng });
    setAddress(`${item.name}, ${item.sub}`);
    setMode("map");
  };

  const confirm = () => {
    const loc = { label: isPickup ? "Pickup" : "Destinasi", address: address || query, lat: coord.lat, lng: coord.lng };
    if (isPickup) {
      setDraft((d) => ({ ...d, pickup: { ...d.pickup, ...loc } }));
    } else if (stopIdx >= 0) {
      setDraft((d) => {
        const stops = [...d.stops];
        stops[stopIdx] = { ...(stops[stopIdx] || {}), ...loc };
        return { ...d, stops };
      });
    }
    router.back();
  };

  const onRegionChange = useCallback((region: { lat: number; lng: number }) => {
    setCoord(region);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable testID="loc-back" onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>
          {isPickup ? "Pilih Lokasi Pickup" : "Pilih Destinasi"}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          testID="loc-search"
          value={query}
          onChangeText={(v) => { setQuery(v); setMode("search"); }}
          placeholder="Cari alamat, kawasan, atau nama tempat"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <View style={styles.tabs}>
        <Pressable
          testID="tab-search"
          onPress={() => setMode("search")}
          style={[styles.tab, mode === "search" && styles.tabActive]}
        >
          <Ionicons name="list" size={16} color={mode === "search" ? colors.onSurface : colors.muted} />
          <Text style={[styles.tabTxt, mode === "search" && styles.tabTxtActive]}>Senarai</Text>
        </Pressable>
        <Pressable
          testID="tab-map"
          onPress={() => setMode("map")}
          style={[styles.tab, mode === "map" && styles.tabActive]}
        >
          <Ionicons name="map" size={16} color={mode === "map" ? colors.onSurface : colors.muted} />
          <Text style={[styles.tabTxt, mode === "map" && styles.tabTxtActive]}>Peta</Text>
        </Pressable>
      </View>

      {mode === "search" ? (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <FlatList
            data={filtered}
            keyExtractor={(i, idx) => i.name + idx}
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable testID={`loc-item-${item.name}`} onPress={() => pick(item)} style={styles.item}>
                <View style={styles.itemIcon}>
                  <Ionicons name="location" size={18} color={colors.brandSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSub}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTxt}>Tiada hasil. Cuba tukar ke Peta untuk letak pin sendiri.</Text>
              </View>
            }
          />
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1 }}>
          <MapPicker center={coord} onRegionChange={onRegionChange} />
          <View style={styles.centerPin} pointerEvents="none">
            <Ionicons name="location" size={40} color={colors.brandSecondary} />
          </View>
          <View style={styles.coordCard}>
            <Ionicons name="pin" size={16} color={colors.brandPrimary} />
            <Text style={styles.coordTxt} numberOfLines={1}>
              {address || `${coord.lat.toFixed(5)}, ${coord.lng.toFixed(5)}`}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <TextInput
          testID="loc-address"
          value={address}
          onChangeText={setAddress}
          placeholder="Alamat penuh (contoh: No 12, Jln Setia 1)"
          placeholderTextColor={colors.muted}
          style={styles.addrInput}
        />
        <Pressable
          testID="loc-confirm"
          onPress={confirm}
          disabled={!address && !query}
          style={({ pressed }) => [styles.cta, (!address && !query) && { opacity: 0.5 }, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.ctaTxt}>PILIH LOKASI INI</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  title: { fontSize: 16, fontWeight: "800", color: colors.onSurface },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: spacing.lg, marginTop: spacing.md, paddingHorizontal: spacing.md, height: 46, borderRadius: radius.md, backgroundColor: colors.surfaceSecondary },
  searchInput: { flex: 1, fontSize: 14, color: colors.onSurface },
  tabs: { flexDirection: "row", marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.surfaceSecondary, padding: 3, borderRadius: radius.pill },
  tab: { flex: 1, height: 34, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: radius.pill },
  tabActive: { backgroundColor: colors.brandPrimary },
  tabTxt: { fontSize: 12, fontWeight: "700", color: colors.muted },
  tabTxtActive: { color: colors.onBrandPrimary },
  item: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.divider },
  itemIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  itemName: { fontWeight: "800", color: colors.onSurface, fontSize: 14 },
  itemSub: { fontSize: 12, color: colors.onSurfaceSecondary, marginTop: 2 },
  empty: { alignItems: "center", paddingTop: 40 },
  emptyTxt: { color: colors.muted, textAlign: "center", paddingHorizontal: spacing.xl },
  centerPin: { position: "absolute", top: "50%", left: "50%", marginLeft: -20, marginTop: -40, alignItems: "center" },
  coordCard: { position: "absolute", top: spacing.md, left: spacing.lg, right: spacing.lg, flexDirection: "row", gap: 8, alignItems: "center", padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, ...shadow.card },
  coordTxt: { flex: 1, fontSize: 12, color: colors.onSurface, fontWeight: "600" },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.divider, gap: spacing.sm, backgroundColor: colors.surface },
  addrInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 46, paddingHorizontal: spacing.md, color: colors.onSurface },
  cta: { backgroundColor: colors.brandPrimary, height: 50, borderRadius: radius.md, alignItems: "center", justifyContent: "center", ...shadow.cta },
  ctaTxt: { fontWeight: "900", color: colors.onBrandPrimary, letterSpacing: 0.5 },
});
