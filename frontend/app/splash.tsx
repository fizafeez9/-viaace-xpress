import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { BrandLogo } from "@/src/components/BrandLogo";
import { colors } from "@/src/theme/tokens";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Tetapkan masa paparan splash screen (contoh: 2 saat / 2000ms)
    const timer = setTimeout(() => {
      // Selepas 2 saat, arahkan terus ke page login
      router.replace("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Di sini kau boleh letak BrandLogo atau tambah animasi reanimated */}
      <BrandLogo width={260} height={80} />
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
});
