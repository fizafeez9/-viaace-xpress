import React, { useEffect } from "react";
import { StyleSheet, View, Image, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Timer ditetapkan tepat kepada 4 saat sebelum ke skrin seterusnya
    const timer = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <View style={styles.container} testID="splash-screen">
      {/* Lapisan tekstur organik gaya konkrit gelap kasar (Grunge/Concrete Noise) */}
      {Platform.OS === 'web' && (
        <View style={styles.concreteTextureOverlay} pointerEvents="none">
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <filter id="noiseFilter">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="0.8" 
                numOctaves="4" 
                stitchTiles="stitch" 
              />
              <feColorMatrix 
                type="matrix" 
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" 
              />
            </filter>
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            filter: 'url(#noiseFilter)',
            opacity: 0.85
          }} />
        </View>
      )}

      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/E1489C85-0D74-4932-9F61-F2CB04301804.png")}
          style={styles.logoImage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Warna asas kelabu gelap konkrit persis dalam gambar rujukan
    backgroundColor: "#1c1e21",
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === 'web' && {
      backgroundImage: 'radial-gradient(circle at center, #26292e 0%, #151719 100%)',
    } as any),
  },
  concreteTextureOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 1,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  logoImage: {
    width: 380,
    height: 130,
    resizeMode: "contain",
  },
});
