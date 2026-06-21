import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { Button, Card, ErrorText, Field, Label, Screen, Title } from "@/components/ui";
import { endpoints } from "@/lib/api";
import { colors } from "@/lib/theme";

const drinkTypes = ["BEER", "WINE", "WHISKY", "VODKA", "GIN", "RUM", "TEQUILA", "COCKTAIL", "OTHER"];

export default function LogScreen() {
  const [drinkType, setDrinkType] = useState("BEER");
  const [drinkName, setDrinkName] = useState("");
  const [volumeMl, setVolumeMl] = useState("330");
  const [abv, setAbv] = useState("5");
  const [price, setPrice] = useState("0");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [checkIn, setCheckIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!drinkName.trim()) {
      setError("Name the drink first. The app needs gossip.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await endpoints.logDrink({
        drinkType,
        drinkName,
        volumeMl,
        abv,
        price,
        location,
        notes,
        loggedAt: new Date().toISOString(),
        visibility: "FRIENDS",
        checkIn,
      });
      router.push("/(tabs)/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log drink.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
        <Title>Log drink</Title>
        <Card>
          <Label>Drink type</Label>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {drinkTypes.map((type) => <Pill key={type} active={drinkType === type} label={type.toLowerCase()} onPress={() => setDrinkType(type)} />)}
          </View>
          <Field value={drinkName} onChangeText={setDrinkName} placeholder="Mojito, lager, house wine..." />
          <Field value={volumeMl} onChangeText={setVolumeMl} keyboardType="numeric" placeholder="Volume ml" />
          <Field value={abv} onChangeText={setAbv} keyboardType="numeric" placeholder="ABV %" />
          <Field value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Price" />
          <Field value={location} onChangeText={setLocation} placeholder="Location/bar" />
          <Field value={notes} onChangeText={setNotes} placeholder="Notes" />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>Check in here</Text>
            <Switch value={checkIn} onValueChange={setCheckIn} thumbColor={checkIn ? colors.neon : colors.muted} />
          </View>
          <ErrorText message={error} />
          <Button title="Log drink" loading={loading} onPress={submit} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Pill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <Text onPress={onPress} style={{ color: active ? colors.ink : colors.text, backgroundColor: active ? colors.neon : "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, fontWeight: "900", textTransform: "capitalize" }}>{label}</Text>;
}
