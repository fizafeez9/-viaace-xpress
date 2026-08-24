import React, { useState } from "react";
import { View, Text, StyleSheet, PanResponder } from "react-native";
import { colors, spacing } from "@/src/theme/tokens";

type Props = {
  center: { lat: number; lng: number };
  onRegionChange: (r: { lat: number; lng: number }) => void;
};

export default function MapPicker({ center, onRegionChange }: Props) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setOrigin(offset),
    onPanResponderMove: (_, g) => {
      const next = { x: origin.x + g.dx, y: origin.y + g.dy };
      setOffset(next);
      onRegionChange({ lat: center.lat - g.dy * 0.0002, lng: center.lng + g.dx * 0.0002 });
    },
  });

  return (
    <View style={styles.wrap} {...responder.panHandlers}>
      <View style={[styles.tile, { transform: [{ translateX: offset.x % 40 }, { translateY: offset.y % 40 }] }]} />
      <Text style={styles.hint}>Seret peta untuk gerakkan pin (fallback web)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#EAF2E8", overflow: "hidden" },
  tile: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#EEEDE0",
    opacity: 0.7,
  },
  hint: { position: "absolute", bottom: spacing.md, alignSelf: "center", color: colors.muted, fontSize: 11 },
});
