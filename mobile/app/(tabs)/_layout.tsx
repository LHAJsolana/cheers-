import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function TabLayout() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.ink }}><ActivityIndicator color={colors.neon} /></View>;
  if (!user) return <Redirect href="/welcome" />;
  if (!user.onboardingCompleted) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: "#050816",
          borderTopColor: "rgba(255,255,255,0.1)",
          height: 72,
          paddingTop: 8,
          paddingBottom: 12,
        },
        tabBarActiveBackgroundColor: colors.neon,
        tabBarLabelStyle: { fontWeight: "900", fontSize: 11 },
        tabBarItemStyle: { borderRadius: 16, marginHorizontal: 4 },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={19} /> }} />
      <Tabs.Screen name="log" options={{ title: "Log", tabBarIcon: ({ color }) => <Ionicons name="beer" color={color} size={19} /> }} />
      <Tabs.Screen name="feed" options={{ title: "Feed", tabBarIcon: ({ color }) => <Ionicons name="radio" color={color} size={19} /> }} />
      <Tabs.Screen name="stats" options={{ title: "Stats", tabBarIcon: ({ color }) => <Ionicons name="bar-chart" color={color} size={19} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color }) => <Ionicons name="person" color={color} size={19} /> }} />
    </Tabs>
  );
}
