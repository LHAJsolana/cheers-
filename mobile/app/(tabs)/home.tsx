import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { EmptyState, LoadingState } from "@/components/data-state";
import { Card, Label, Muted, Screen, Title } from "@/components/ui";
import { endpoints, type DashboardPayload } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function HomeScreen() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setData(await endpoints.dashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <Screen><LoadingState /></Screen>;
  if (error) return <Screen><EmptyState icon="🫠" title="Tiny backend wobble." text={error} action="Retry" onPress={load} /></Screen>;
  if (!data) return null;

  const noDrinks = data.stats.drinksThisWeek === 0 && !data.lastDrink;

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.neon} />} contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
        <Card>
          <Label>Home</Label>
          <Title>{noDrinks ? "Your night starts here." : "Hydration is character development."}</Title>
          <Muted>{noDrinks ? "No chaos logged yet. Respectfully suspicious." : "Weekend Mode: pending."}</Muted>
        </Card>
        {noDrinks ? <EmptyState icon="🍻" title="Your night starts here." text="Log your first drink and the recap card wakes up." action="Log first drink" onPress={() => router.push("/(tabs)/log")} /> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Mini label="Drinks" value={String(data.stats.drinksThisWeek)} />
          <Mini label="Calories" value={String(data.stats.caloriesThisWeek)} />
          <Mini label="Spent" value={`$${data.stats.spentThisWeek.toFixed(0)}`} />
          <Mini label="Streak" value={`${data.stats.soberStreak}d`} />
        </View>
        <Card>
          <Label>Weekly recap</Label>
          <Title>{data.recap.summary}</Title>
          <Muted>Favorite: {data.recap.favoriteDrink ?? "none yet"} · Place: {data.recap.favoriteLocation ?? "still exploring"}</Muted>
        </Card>
        <Card>
          <Label>Safety</Label>
          <Title>{data.safety.status}</Title>
          <Text style={{ color: colors.ember, fontWeight: "900" }}>Do not drive after drinking.</Text>
          <Muted>{data.safety.tip}</Muted>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <Card style={{ width: "47%" }}><Muted>{label}</Muted><Text style={{ color: colors.text, fontSize: 26, fontWeight: "900" }}>{value}</Text></Card>;
}
