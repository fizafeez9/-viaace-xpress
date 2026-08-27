import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { BrandLogo } from "@/src/components/BrandLogo";
import { colors } from "@/src/theme/tokens";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    // Beri masa sedikit (cth: 3 saat) untuk paparkan logo splash, baru buat keputusan laluan
    const timer = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <View style={styles.container} testID="splash-screen">
      <BrandLogo width={260} height={80} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: colors.surface 
  },
});
