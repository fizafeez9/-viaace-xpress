import React, { useEffect, useState } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { colors } from "@/src/theme/tokens";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [hasNavigated, setHasNavigated] = useState(false);

  const navigateNext = () => {
    if (hasNavigated) return;
    setHasNavigated(true);

    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/login");
    }
  };

  useEffect(() => {
    if (loading) return;

    // Tempoh masa sejajar dengan durasi video (6 saat = 6000ms)
    const timer = setTimeout(() => {
      navigateNext();
    }, 6000);

    return () => clearTimeout(timer);
  }, [user, loading, hasNavigated]);

  // Jika dibuka melalui pelayar web (Safari/Chrome), kita guna elemen video HTML asli yang pasti boleh autoplay
  if (Platform.OS === "web") {
    return (
      <View style={styles.container} testID="splash-screen">
        <video
          autoPlay
          muted
          playsInline
          onEnded={navigateNext}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            backgroundColor: "#000",
          }}
          src={require("@/assets/videos/intro.mp4")}
        />
      </View>
    );
  }

  // Untuk aplikasi native (iOS/Android app sebenar), kita boleh guna expo-av jika perlu
  return (
    <View style={styles.container} testID="splash-screen">
      {/* Fallback jika bukan web */}
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
