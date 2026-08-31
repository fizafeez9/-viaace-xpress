import React, { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { ResizeMode, Video } from "expo-av";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleNavigate = () => {
    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/login");
    }
  };

  useEffect(() => {
    if (loading) return;

    // Keselamatan fallback timer (contoh: 6 saat) jika video tamat lebih awal atau lambat
    const timer = setTimeout(() => {
      handleNavigate();
    }, 6000);

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <View style={styles.container} testID="splash-screen">
      <Video
        source={require("../assets/videos/intro.mov")}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && status.didJustFinish) {
            handleNavigate();
          }
        }}
      />
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
  video: {
    width: width,
    height: height,
    position: "absolute",
  },
});
