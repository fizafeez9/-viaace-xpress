import React, { useEffect } from "react";
import { StyleSheet, View, ImageBackground, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { BrandLogo } from "@/src/components/BrandLogo";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from "react-native-reanimated";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Shared value untuk animasi denyutan cahaya (glow) yang bergerak
  const glowAnimation = useSharedValue(0.5);

  useEffect(() => {
    if (loading) return;

    // Jalankan animasi cahaya berdenyut secara berulang
    glowAnimation.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1, // -1 bermaksud ulang selamanya
      true // 'true' membolehkan ia turun naik (fade in & out) dengan lancar
    );

    // Timer ditetapkan kepada 4 saat (4000ms) seperti yang kau minta
    const timer = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [user, loading, router, glowAnimation]);

  // Gaya animasi cahaya bergerak untuk platform web
  const animatedGlowStyle = useAnimatedStyle(() => {
    const blur1 = 15 + glowAnimation.value * 20;
    const blur2 = 30 + glowAnimation.value * 35;
    const opacity = 0.6 + glowAnimation.value * 0.4;

    if (Platform.OS === 'web') {
      return {
        // @ts-ignore
        filter: `drop-shadow(0px 0px ${blur1}px rgba(255, 215, 0, ${opacity})) drop-shadow(0px 0px ${blur2}px rgba(255, 165, 0, ${opacity * 0.7}))`,
      };
    }
    return {};
  });

  return (
    <View style={styles.container} testID="splash-screen">
      <ImageBackground
        source={require("../assets/IMG_5346.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.logoContainer}>
          {/* Saiz dikembalikan kepada saiz rujukan asal yang cantik & seimbang */}
          <Animated.View style={[styles.logoWrapper, animatedGlowStyle]}>
            <BrandLogo width={360} height={125} />
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
