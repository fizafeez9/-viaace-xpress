import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, shadow } from "@/src/theme/tokens";
import { useLang } from "@/src/context/LanguageContext";

export default function Bantuan() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: t("faq_1_q"), a: t("faq_1_a") },
    { q: t("faq_2_q"), a: t("faq_2_a") },
    { q: t("faq_3_q"), a: t("faq_3_a") },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}><Text style={styles.h1}>{t("help_title")}</Text></View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {faqs.map((f, i) => (
          <Pressable key={i} testID={`faq-${i}`} onPress={() => setOpen(open === i ? null : i)} style={styles.card}>
            <View style={styles.qRow}>
              <Text style={styles.q}>{f.q}</Text>
              <Ionicons name={open === i ? "chevron-up" : "chevron-down"} size={20} color={colors.onSurface} />
            </View>
            {open === i && <Text style={styles.a}>{f.a}</Text>}
          </Pressable>
        ))}
        <Pressable
          testID="contact-btn"
          onPress={() => Linking.openURL("mailto:support@viaace.my")}
          style={styles.contactBtn}
        >
          <Ionicons name="mail-outline" size={18} color="#000" />
          <Text style={styles.contactTxt}>{t("contact_us")}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  h1: { fontSize: 24, fontWeight: "900", color: colors.onSurface },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.divider, ...shadow.card },
  qRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  q: { flex: 1, fontWeight: "800", color: colors.onSurface, fontSize: 14 },
  a: { marginTop: spacing.sm, color: colors.onSurfaceSecondary, fontSize: 13, lineHeight: 19 },
  contactBtn: { marginTop: spacing.md, backgroundColor: colors.brandPrimary, height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, ...shadow.cta },
  contactTxt: { fontWeight: "800", color: colors.onBrandPrimary },
});
