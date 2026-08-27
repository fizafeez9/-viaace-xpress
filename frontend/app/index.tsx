import React, { useState, useRef } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { ResizeMode, Video } from "expo-av";
import { useAuth } from "@/src/context/AuthContext";
import { colors } from "@/src/theme/tokens";

const { width, DimensionsHeight } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const videoRef = useRef<Video>(null);
  const [isVideoFinished, setIsVideoFinished] = useState(false);

  // Fungsi yang dipanggil apabila video selesai dimainkan
  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish && !isVideoFinished) {
      setIsVideoFinished(true);
      
      // Selepas video habis, buat keputusan laluan ikut status auth
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }
  };

  return (
    <View style={styles.container} testID="splash-screen">
      <Video
        ref={videoRef}
        // Gantikan laluan ini mengikut lokasi fail video kau
        source={require("@/assets/videos/intro.mp4")} 
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
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
