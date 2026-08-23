import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, radius } from "@/src/theme/tokens";
import { useLang } from "@/src/context/LanguageContext";
import { useAuth } from "@/src/context/AuthContext";

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { authFetch } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [msgs, setMsgs] = useState<any[]>([]);
  const [txt, setTxt] = useState("");
  const list = useRef<FlatList>(null);

  const load = async () => {
    const r = await authFetch(`/api/orders/${id}/chat`);
    if (r.ok) setMsgs(await r.json());
  };
  useEffect(() => { load(); }, [id]);

  const send = async () => {
    if (!txt.trim()) return;
    const val = txt.trim();
    setTxt("");
    const r = await authFetch(`/api/orders/${id}/chat`, { method: "POST", body: JSON.stringify({ text: val }) });
    if (r.ok) {
      const added = await r.json();
      setMsgs((m) => [...m, ...added]);
      setTimeout(() => list.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Chat • #{id}</Text>
        <View style={{ width: 26 }} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <FlatList
          ref={list}
          data={msgs}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, flexGrow: 1 }}
          renderItem={({ item }) => {
            const mine = item.sender === "user";
            return (
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                <Text style={[styles.bubbleTxt, mine && { color: "#000" }]}>{item.text}</Text>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>{t("chat_ph")}</Text>}
        />
        <View style={styles.inputRow}>
          <TextInput
            testID="chat-input"
            value={txt}
            onChangeText={setTxt}
            placeholder={t("chat_ph")}
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Pressable testID="chat-send" onPress={send} style={styles.sendBtn}>
            <Ionicons name="send" size={18} color="#000" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  title: { fontSize: 16, fontWeight: "800", color: colors.onSurface },
  bubble: { maxWidth: "80%", padding: spacing.md, borderRadius: radius.lg },
  bubbleMine: { alignSelf: "flex-end", backgroundColor: colors.brandPrimary, borderBottomRightRadius: 4 },
  bubbleOther: { alignSelf: "flex-start", backgroundColor: colors.surfaceSecondary, borderBottomLeftRadius: 4 },
  bubbleTxt: { color: colors.onSurface, fontSize: 14 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
  input: { flex: 1, height: 46, borderRadius: radius.pill, backgroundColor: colors.surfaceSecondary, paddingHorizontal: spacing.lg, color: colors.onSurface },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
});
