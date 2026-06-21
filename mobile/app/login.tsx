import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { Button, Card, ErrorText, Field, Muted, Screen, Title } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("taha@cheers.local");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const user = await signIn(email, password);
      router.replace(user.onboardingCompleted ? "/(tabs)/home" : "/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Title>Welcome back</Title>
      <Muted>Your wallet has concerns. Let&apos;s review the evidence.</Muted>
      <Card>
        <Field value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" />
        <Field value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
        <ErrorText message={error} />
        <Button title="Login" loading={loading} onPress={submit} />
      </Card>
      <Text onPress={() => router.push("/signup")} style={{ color: colors.neon, fontWeight: "800", textAlign: "center" }}>New here? Sign up</Text>
    </Screen>
  );
}
