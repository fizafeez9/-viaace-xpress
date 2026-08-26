import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";

export const BrandLogo: React.FC<{ width?: number; height?: number }> = ({ width = 120, height = 36 }) => {
  return (
    <View style={styles.wrap} testID="brand-logo">
      <Image
        source={require("../../assets/84E5DCE8-6EE3-441A-A5BD-6C50E5CC4692.png")}
        style={{ width, height }}
        contentFit="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
