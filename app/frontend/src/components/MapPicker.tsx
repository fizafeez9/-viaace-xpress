import React, { useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

type Props = {
  center: { lat: number; lng: number };
  onRegionChange: (r: { lat: number; lng: number }) => void;
};

export default function MapPicker({ center, onRegionChange }: Props) {
  const ref = useRef<MapView>(null);
  const region = { latitude: center.lat, longitude: center.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 };
  return (
    <MapView
      ref={ref}
      style={StyleSheet.absoluteFill}
      initialRegion={region}
      provider={PROVIDER_GOOGLE}
      onRegionChangeComplete={(r) => onRegionChange({ lat: r.latitude, lng: r.longitude })}
    />
  );
}
