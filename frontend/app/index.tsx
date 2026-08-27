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

  // Paksa video dimainkan menggunakan rujukan (ref) sejurus komponen dipaparkan
  useEffect(() => {
    if (loading) return;

    const playVideo = async () => {
      try {
        if (videoRef.current) {
          await videoRef.current.playAsync();
        }
      } catch (error) {
        console.log("Error playing video:", error);
      }
    };

    playVideo();

    // Safety timer 6.5 saat untuk beralih skrin
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
        isMuted={true}
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
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
});
