import React, { useEffect } from "react";
import { StyleSheet, View, Dimensions, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

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

    // Masa paparan imej splash (contoh: 2.5 saat) sebelum beralih ke halaman seterusnya
    const timer = setTimeout(() => {
      handleNavigate();
    }, 2500);

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <View style={styles.container} testID="splash-screen">
      <ImageBackground
        source={require("../assets/IMG_5492.jpeg")}
        style={styles.image}
        resizeMode="cover"
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
  image: {
    width: width,
    height: height,
    position: "absolute",
  },
});
