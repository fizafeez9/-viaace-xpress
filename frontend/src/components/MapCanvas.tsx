import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { colors } from "@/src/theme/tokens";

type Coord = { lat: number; lng: number } | null | undefined;
type Props = { rider: Coord; pickup: Coord; dropoff: Coord };

export default function MapCanvas({ rider, pickup, dropoff }: Props) {
  const center = rider || pickup || { lat: 3.139, lng: 101.6869 };
  const region = { latitude: center.lat, longitude: center.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 };
  return (
    <MapView style={StyleSheet.absoluteFill} initialRegion={region} region={region} provider={PROVIDER_GOOGLE}>
      {rider && (
        <Marker coordinate={{ latitude: rider.lat, longitude: rider.lng }}>
          <View style={styles.riderPin}><Ionicons name="bicycle" size={16} color="#000" /></View>
        </Marker>
      )}
      {pickup && <Marker coordinate={{ latitude: pickup.lat, longitude: pickup.lng }} pinColor="#FFD60A" />}
      {dropoff && <Marker coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }} pinColor="#000" />}
      {rider && pickup && dropoff && (
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
  riderPin: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#000" },
});
