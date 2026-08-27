import React, { useEffect } from "react";
import { StyleSheet, View, ImageBackground, Dimensions, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { BrandLogo } from "@/src/components/BrandLogo";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

// --- Komponen Kesan Neon Glow ---
const NeonGlowLogo = ({ width, height }: { width: number; height: number }) => {
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    // Animasi pulse glow
    glowIntensity.value = withTiming(1.5, {
      duration: 2500,
      easing: Easing.inOut(Easing.ease),
    });
  }, []);

  // Untuk Web
  if (Platform.OS === 'web') {
    return (
      <View style={styles.logoContainer}>
        <View style={{
          filter: 'drop-shadow(0px 0px 20px rgba(255, 215, 0, 0.9)) drop-shadow(0px 0px 40px rgba(255, 165, 0, 0.7))',
        }}>
          <BrandLogo width={width} height={height} />
        </View>
      </View>
    );
  }

  // Untuk Native (iOS/Android)
  const animatedProps = useAnimatedProps(() => ({
    style: {
      shadowColor: "#FFD700",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7 + glowIntensity.value * 0.2,
      shadowRadius: 20 + glowIntensity.value * 5,
      elevation: 10 + glowIntensity.value * 5,
    }
  }));

  return (
    <View style={styles.logoContainer}>
      <Animated.View animatedProps={animatedProps}>
         <BrandLogo width={width} height={height} />
      </Animated.View>
    </View>
  );
};

// --- Halaman Utama (Index.tsx) ---
export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Timer 6 saat sejajar dengan durasi intro
    const timer = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <View style={styles.container} testID="splash-screen">
      {/* 1. Latar Belakang Tekstur Gelap */}
      <ImageBackground
        source={require("@/assets/assets/IMG_5346.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* 2. Logo Bersaiz Besar (850x290) dengan Kesan Glowing */}
        <NeonGlowLogo width={850} height={290} />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
