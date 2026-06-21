import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.ink }}><ActivityIndicator color={colors.neon} /></View>;
  }
  if (!user) return <Redirect href="/welcome" />;
  if (!user.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/home" />;
}
