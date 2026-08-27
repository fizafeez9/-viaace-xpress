import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ResizeMode, Video } from "expo-av";
import { useAuth } from "@/src/context/AuthContext";
import { colors } from "@/src/theme/tokens";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const videoRef = useRef<Video>(null);
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

  // Tetapkan masa kepada 6500ms (6.5 saat) memandangkan durasi video ialah 6 saat
  useEffect(() => {
    if (loading) return;

    const safetyTimer = setTimeout(() => {
      navigateNext();
    }, 6500); 

    return () => clearTimeout(safetyTimer);
  }, [user, loading, hasNavigated]);

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && status.didJustFinish) {
      navigateNext();
    }
  };

  return (
    <View style={styles.container} testID="splash-screen">
      <Video
        ref={videoRef}
        source={require("@/assets/videos/intro.mp4")} 
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isMuted={true} // Diperlukan supaya Safari iPhone boleh auto-play video
        isLooping={false}
        useNativeControls={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
});
