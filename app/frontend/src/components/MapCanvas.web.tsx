import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/src/theme/tokens";

type Coord = { lat: number; lng: number } | null | undefined;
type Props = { rider: Coord; pickup: Coord; dropoff: Coord };

export default function MapCanvas({ rider, pickup, dropoff }: Props) {
  // Simple visual placeholder for web preview
  return (
    <View style={styles.wrap}>
      <View style={styles.grid} />
      <View style={styles.center}>
        <Ionicons name="map" size={48} color={colors.brandPrimary} />
        <Text style={styles.tl}>Peta langsung tersedia dalam Expo Go / build native</Text>
        {rider && <Text style={styles.line}>🏍  Rider: {rider.lat.toFixed(3)}, {rider.lng.toFixed(3)}</Text>}
        {pickup && <Text style={styles.line}>📍 Pickup: {pickup.lat.toFixed(3)}, {pickup.lng.toFixed(3)}</Text>}
        {dropoff && <Text style={styles.line}>🏁 Destinasi: {dropoff.lat.toFixed(3)}, {dropoff.lng.toFixed(3)}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#EAF2E8", alignItems: "center", justifyContent: "center" },
  grid: { ...StyleSheet.absoluteFillObject, opacity: 0.35, backgroundColor: "#EEEDE0" },
  center: { alignItems: "center", padding: spacing.lg, gap: 6 },
  tl: { color: colors.onSurfaceSecondary, fontSize: 12, marginTop: 8, textAlign: "center" },
  line: { color: colors.onSurface, fontSize: 12, fontWeight: "700" },
});
