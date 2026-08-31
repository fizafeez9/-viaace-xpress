import React, { useEffect } from "react";
import { StyleSheet, View, Image, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
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
  
  const glowAnimation = useSharedValue(0.5);

  useEffect(() => {
    if (loading) return;

    glowAnimation.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    const timer = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [user, loading, router, glowAnimation]);

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
      <View style={styles.logoContainer}>
        <Animated.View style={[styles.logoWrapper, animatedGlowStyle]}>
          <Image
            source={require("../assets/E1489C85-0D74-4932-9F61-F2CB04301804.png")}
            style={styles.logoImage}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Latar belakang kelabu gelap berona tekstur pepejal yang sepadan dengan tema
    backgroundColor: "#1c1c1e",
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
  logoImage: {
    width: 380,
    height: 130,
    resizeMode: "contain",
  },
});
