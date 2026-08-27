import React, { useEffect } from "react";
import { StyleSheet, View, ImageBackground, Platform, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { BrandLogo } from "@/src/components/BrandLogo";

const { width: screenWidth } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Timer 6 saat sebelum masuk ke login/tabs
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
      <ImageBackground
        // Laluan diselaraskan mengikut struktur folder sebenar kau
        source={require("../assets/IMG_5346.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.logoContainer}>
          {/* Saiz logo yang besar, megah & selari dengan lebar skrin */}
          <BrandLogo width={Math.min(screenWidth * 0.85, 420)} height={145} />
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
    // Kesan neon glow keemasan yang terang pada teks hitam dan logo
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0px 0px 20px rgba(255, 215, 0, 0.95)) drop-shadow(0px 0px 40px rgba(255, 165, 0, 0.7))',
    }),
  },
});
