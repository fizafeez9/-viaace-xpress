import React, { useEffect } from "react";
import { StyleSheet, View, Image, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Timer ditetapkan kepada 4 saat sebelum ke skrin seterusnya
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
      {/* Lapisan tambahan tekstur kasar gaya permukaan jalan raya untuk persekitaran web */}
      {Platform.OS === 'web' && (
        <View style={styles.noiseOverlay} pointerEvents="none" />
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
    backgroundColor: "#161719", // Warna asas kelabu gelap jalan raya
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === 'web' && {
      // Menghasilkan tekstur bintik-bintik kasar (asphalt/road texture) menggunakan CSS radial & linear grain
      backgroundImage: `
        radial-gradient(rgba(255, 255, 255, 0.04) 15%, transparent 16%),
        radial-gradient(rgba(0, 0, 0, 0.6) 15%, transparent 16%),
        linear-gradient(to bottom, #1c1d20 0%, #121315 100%)
      `,
      backgroundSize: '24px 24px, 24px 24px, 100% 100%',
      backgroundPosition: '0 0, 12px 12px, 0 0',
    } as any),
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    // Tambahan lapisan kesan bintik halus (noise)
    ...(Platform.OS === 'web' && {
      backgroundImage: 'repeating-radial-gradient(circle at 0 0, transparent 0, #000 2px, transparent 3px)',
      backgroundSize: '6px 6px',
    } as any),
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
