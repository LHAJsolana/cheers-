import { router } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { Button, Card, ErrorText, Field, Label, Muted, Screen, Title } from "@/components/ui";
import { endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function ProfileScreen() {
  const { user, updateUser, signOut } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [weightKg, setWeightKg] = useState(String(user?.weightKg ?? 75));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setError("");
    try {
      const result = await endpoints.updateMe({
        name,
        username,
        weightKg,
        gender: user?.gender ?? "",
        drinkingGoal: user?.drinkingGoal ?? "TRACK_ONLY",
        notificationStyle: user?.notificationStyle ?? "FUNNY",
        privacyDefault: user?.privacyDefault ?? "FRIENDS",
      });
      updateUser(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await signOut();
    router.replace("/welcome");
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
        <Title>Profile</Title>
        <Muted>One more? The app is judging silently.</Muted>
        <Card>
          <Label>Account</Label>
          <Field value={name} onChangeText={setName} placeholder="Name" />
          <Field value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="Username" />
          <Field value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" placeholder="Weight kg" />
          <ErrorText message={error} />
          <Button title="Save profile" loading={loading} onPress={save} />
          <Button title="Friends" secondary onPress={() => router.push("/friends")} />
          <Button title="Logout" secondary onPress={logout} />
        </Card>
      </ScrollView>
    </Screen>
  );
}
