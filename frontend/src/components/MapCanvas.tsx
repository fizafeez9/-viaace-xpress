import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { colors } from "@/src/theme/tokens";

type Coord = { lat: number; lng: number } | null | undefined;
type Props = { rider: Coord; pickup: Coord; dropoff: Coord };

// Smoothly interpolate the rider marker between server updates.
export default function MapCanvas({ rider, pickup, dropoff }: Props) {
  const center = rider || pickup || { lat: 3.139, lng: 101.6869 };
  const region = { latitude: center.lat, longitude: center.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 };
  const [smooth, setSmooth] = useState(rider);
  const raf = useRef<any>(null);

  useEffect(() => {
    if (!rider) return;
    // animate from current 'smooth' toward the new 'rider' over ~1s
    const start = smooth || rider;
    const target = rider;
    const t0 = Date.now();
    const dur = 900;
    const step = () => {
      const p = Math.min(1, (Date.now() - t0) / dur);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setSmooth({
        lat: start.lat + (target.lat - start.lat) * eased,
        lng: start.lng + (target.lng - start.lng) * eased,
      });
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rider?.lat, rider?.lng]);

  const pos = smooth || rider;

  return (
    <MapView style={StyleSheet.absoluteFill} initialRegion={region} provider={PROVIDER_GOOGLE}>
      {pos && (
        <Marker coordinate={{ latitude: pos.lat, longitude: pos.lng }} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.riderPin}><Ionicons name="bicycle" size={16} color="#000" /></View>
        </Marker>
      )}
      {pickup && <Marker coordinate={{ latitude: pickup.lat, longitude: pickup.lng }} pinColor="#FFD60A" />}
      {dropoff && <Marker coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }} pinColor="#000" />}
      {pos && pickup && dropoff && (
        <Polyline
          coordinates={[
            { latitude: pos.lat, longitude: pos.lng },
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
