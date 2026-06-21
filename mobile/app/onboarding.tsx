import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button, Card, ErrorText, Field, Label, Muted, Screen, Title } from "@/components/ui";
import { endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function OnboardingScreen() {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState(user?.username ?? "");
  const [weightKg, setWeightKg] = useState(String(user?.weightKg ?? 75));
  const [notificationStyle, setNotificationStyle] = useState("FUNNY");
  const [drinkingGoal, setDrinkingGoal] = useState("TRACK_ONLY");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return <Redirect href="/welcome" />;
  if (user.onboardingCompleted) return <Redirect href="/(tabs)/home" />;

  async function finish() {
    setLoading(true);
    setError("");
    try {
      const result = await endpoints.updateMe({ username, weightKg, notificationStyle, drinkingGoal, onboardingCompleted: true });
      updateUser(result.user);
      router.replace("/(tabs)/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not finish onboarding.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={{ flex: 1, height: 8, borderRadius: 99, backgroundColor: item <= step ? colors.neon : "rgba(255,255,255,0.1)" }} />
        ))}
      </View>
      {step === 1 && (
        <Card style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 56 }}>🍻</Text>
          <Title>Welcome to Cheers</Title>
          <Muted>Track your nights, calories, spending, and funny memories.</Muted>
          <Button title="Let's go" onPress={() => setStep(2)} />
        </Card>
      )}
      {step === 2 && (
        <Card>
          <Label>Your vibe</Label>
          <Title>Set your basics</Title>
          <Field value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="Username" />
          <Field value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" placeholder="Weight kg" />
          <Choice value={notificationStyle} setValue={setNotificationStyle} options={[["SERIOUS", "Serious"], ["FUNNY", "Funny"], ["CHAOS", "Chaos"]]} />
          <Button title="Next" onPress={() => setStep(3)} />
        </Card>
      )}
      {step === 3 && (
        <Card>
          <Label>Goal</Label>
          <Title>What are we tracking?</Title>
          <Choice value={drinkingGoal} setValue={setDrinkingGoal} options={[["TRACK_ONLY", "Just tracking"], ["REDUCE_DRINKING", "Drink less"], ["SOBER_STREAK", "Sober streak"], ["SOCIAL_DISCOVERY", "Social nights"]]} />
          <ErrorText message={error} />
          <Button title="Finish" loading={loading} onPress={finish} />
          <Button title="Back" secondary onPress={() => setStep(2)} />
        </Card>
      )}
    </Screen>
  );
}

function Choice({ value, setValue, options }: { value: string; setValue: (value: string) => void; options: [string, string][] }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map(([option, label]) => (
        <Text key={option} onPress={() => setValue(option)} style={{ color: value === option ? colors.ink : colors.text, backgroundColor: value === option ? colors.neon : "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, fontWeight: "900" }}>
          {label}
        </Text>
      ))}
    </View>
  );
}
