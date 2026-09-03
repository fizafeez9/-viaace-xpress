import React, { useEffect } from "react";
import { StyleSheet, View, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

const { width, height } = Dimensions.get("window");

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
    width: width,
    height: height,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 280,
    height: 100,
    resizeMode: "contain",
  },
});
