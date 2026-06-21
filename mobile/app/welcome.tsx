import { router } from "expo-router";
import { Text, View } from "react-native";
import { Button, Card, Muted, Screen, Title } from "@/components/ui";
import { colors } from "@/lib/theme";

export default function WelcomeScreen() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: 18 }}>
        <Text style={{ fontSize: 64 }}>🍻</Text>
        <Title>Cheers</Title>
        <Muted>Track the night. Remember the vibes. Hydration is character development.</Muted>
        <Card>
          <Text style={{ color: colors.text, fontWeight: "900", fontSize: 18 }}>Friday-night testable.</Text>
          <Muted>Log drinks, react to friends, copy a recap, and do not drive after drinking.</Muted>
        </Card>
        <Button title="Start tracking" onPress={() => router.push("/signup")} />
        <Button title="Login" secondary onPress={() => router.push("/login")} />
      </View>
    </Screen>
  );
}
