import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useLang } from "@/src/context/LanguageContext";
import { useAuth } from "@/src/context/AuthContext";

export default function Rate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { authFetch } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    await authFetch(`/api/orders/${id}/rate`, { method: "POST", body: JSON.stringify({ stars, comment }) });
    setDone(true);
    setTimeout(() => router.replace("/(tabs)/tempahan"), 900);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <Ionicons name="checkmark-circle" size={72} color={colors.success} />
        <Text style={styles.title}>{t("rate_title")}</Text>
        <Text style={styles.sub}>{t("rate_sub")}</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} testID={`star-${n}`} onPress={() => setStars(n)} hitSlop={8}>
              <Ionicons name={n <= stars ? "star" : "star-outline"} size={44} color={colors.warning} />
            </Pressable>
          ))}
        </View>
        <TextInput
          testID="rate-comment"
          value={comment}
          onChangeText={setComment}
          multiline
          placeholder={t("add_comment")}
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Pressable testID="rate-submit" onPress={submit} disabled={done} style={styles.cta}>
          <Text style={styles.ctaTxt}>{done ? t("thanks") : t("submit")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg },
  body: { flex: 1, alignItems: "center", paddingHorizontal: spacing.xl, gap: spacing.md, paddingTop: spacing.xl },
  title: { fontSize: 22, fontWeight: "900", color: colors.onSurface, marginTop: spacing.md },
  sub: { fontSize: 14, color: colors.onSurfaceSecondary, textAlign: "center" },
  starsRow: { flexDirection: "row", gap: spacing.sm, marginVertical: spacing.lg },
  input: { width: "100%", minHeight: 90, borderRadius: radius.lg, backgroundColor: colors.surfaceSecondary, padding: spacing.lg, color: colors.onSurface, textAlignVertical: "top" },
  cta: { width: "100%", height: 54, borderRadius: radius.md, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center", marginTop: spacing.lg, ...shadow.cta },
  ctaTxt: { fontWeight: "900", color: colors.onBrandPrimary, fontSize: 15 },
});
