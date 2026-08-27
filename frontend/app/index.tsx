import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { BrandLogo } from "@/src/components/BrandLogo";
import { colors } from "@/src/theme/tokens";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  Easing 
} from "react-native-reanimated";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Shared values untuk animasi skala dan kelegapan logo
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (loading) return;

    // Jalankan animasi masuk (fade-in & zoom)
    opacity.value = withTiming(1, { duration: 800, easing: Easing.ease });
    scale.value = withSequence(
      withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) })
    );

    // Timer 6 saat sepadan dengan durasi intro yang kau mahu
    const timer = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [user, loading, router, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      shadowColor: colors.brandPrimary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: opacity.value * 0.8,
      shadowRadius: 20,
      elevation: 10,
    };
  });

  return (
    <View style={styles.container} testID="splash-screen">
      <Animated.View style={animatedStyle}>
        <BrandLogo width={280} height={90} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
});
