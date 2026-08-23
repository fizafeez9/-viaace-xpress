import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Platform } from "react-native";
import { colors } from "@/src/theme/tokens";
import { useLang } from "@/src/context/LanguageContext";
import { useAuth } from "@/src/context/AuthContext";
import { Redirect } from "expo-router";

export default function TabsLayout() {
  const { t } = useLang();
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  const iconFor = (name: string, focused: boolean) => (
    <Ionicons
      name={name as any}
      size={22}
      color={focused ? colors.brandSecondary : colors.muted}
    />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandSecondary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tab_home"),
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeBadge : undefined}>
              {iconFor(focused ? "home" : "home-outline", focused)}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tempahan"
        options={{
          title: t("tab_orders"),
          tabBarIcon: ({ focused }) => iconFor(focused ? "clipboard" : "clipboard-outline", focused),
        }}
      />
      <Tabs.Screen
        name="bantuan"
        options={{
          title: t("tab_help"),
          tabBarIcon: ({ focused }) => iconFor(focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline", focused),
        }}
      />
      <Tabs.Screen
        name="akaun"
        options={{
          title: t("tab_account"),
          tabBarIcon: ({ focused }) => iconFor(focused ? "person" : "person-outline", focused),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeBadge: {
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
});
