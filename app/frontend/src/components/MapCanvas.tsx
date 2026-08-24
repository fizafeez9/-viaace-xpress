import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme/tokens";

// Import react-native-maps safely for native platforms
let MapView: any, Marker: any, Polyline: any, PROVIDER_GOOGLE: any;
try {
  const M = require("react-native-maps");
  MapView = M.default;
  Marker = M.Marker;
  Polyline = M.Polyline;
  PROVIDER_GOOGLE = M.PROVIDER_GOOGLE;
} catch {}

type Coord = { lat: number; lng: number } | null | undefined;
type Props = { rider: Coord; pickup: Coord; dropoff: Coord };

export default function MapCanvas({ rider, pickup, dropoff }: Props) {
  const defaultRegion = {
    latitude: rider?.lat ?? 3.139,
    longitude: rider?.lng ?? 101.6869,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  if (!MapView) {
    return <View style={StyleSheet.absoluteFill} />;
  }

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={defaultRegion}
      region={rider ? { latitude: rider.lat, longitude: rider.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 } : defaultRegion}
      provider={PROVIDER_GOOGLE}
    >
      {rider && (
        <Marker coordinate={{ latitude: rider.lat, longitude: rider.lng }}>
          <View style={styles.riderPin}>
            <Ionicons name="bicycle" size={16} color="#000" />
          </View>
        </Marker>
      )}
      {pickup?.lat != null && (
        <Marker coordinate={{ latitude: pickup.lat, longitude: pickup.lng }} pinColor="#FFD60A" />
      )}
      {dropoff?.lat != null && (
        <Marker coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }} pinColor="#000" />
      )}
      {rider && pickup?.lat != null && dropoff?.lat != null && (
        <Polyline
          coordinates={[
            { latitude: rider.lat, longitude: rider.lng },
            { latitude: pickup.lat, longitude: pickup.lng },
            { latitude: dropoff.lat, longitude: dropoff.lng },
          ]}
          strokeColor={colors.brandPrimary}
          strokeWidth={4}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  riderPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
});
