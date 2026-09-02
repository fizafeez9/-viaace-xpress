import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, { useAnimatedMarker, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { colors } from "@/src/theme/tokens";

type Coord = { lat: number; lng: number } | null | undefined;
type Props = { rider: Coord; pickup: Coord; dropoff: Coord };

export default function MapCanvas({ rider, pickup, dropoff }: Props) {
  const center = rider || pickup || { lat: 3.139, lng: 101.6869 };
  const region = { latitude: center.lat, longitude: center.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  const animLat = useSharedValue(rider?.lat ?? center.lat);
  const animLng = useSharedValue(rider?.lng ?? center.lng);

  useEffect(() => {
    if (rider) {
      animLat.value = withTiming(rider.lat, { duration: 1000, easing: Easing.out(Easing.ease) });
      animLng.value = withTiming(rider.lng, { duration: 1000, easing: Easing.out(Easing.ease) });
    }
  }, [rider, animLat, animLng]);

  const animatedMarkerProps = useAnimatedMarker({
    latitude: animLat,
    longitude: animLng,
  });

  return (
    <MapView style={StyleSheet.absoluteFill} initialRegion={region} region={region} provider={PROVIDER_GOOGLE}>
      {rider && (
        <Marker.Animated {...animatedMarkerProps}>
          <View style={styles.riderPin}><Ionicons name="bicycle" size={16} color="#000" /></View>
        </Marker.Animated>
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
