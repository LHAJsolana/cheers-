import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { Button, Card, ErrorText, Field, Muted, Screen, Title } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      await signUp(name, email, password);
      router.replace("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Title>Create account</Title>
      <Muted>No chaos logged yet. That can change.</Muted>
      <Card>
        <Field value={name} onChangeText={setName} placeholder="Name" />
        <Field value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" />
        <Field value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
        <ErrorText message={error} />
        <Button title="Start tracking" loading={loading} onPress={submit} />
      </Card>
      <Text onPress={() => router.push("/login")} style={{ color: colors.neon, fontWeight: "800", textAlign: "center" }}>Already have an account? Login</Text>
    </Screen>
  );
}
