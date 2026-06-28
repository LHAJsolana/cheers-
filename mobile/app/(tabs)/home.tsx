import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Linking, RefreshControl, ScrollView, Text, View } from "react-native";
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
  if (error) return <Screen><EmptyState icon="!" title="Tiny backend wobble." text={error} action="Retry" onPress={load} /></Screen>;
  if (!data) return null;

  const noDrinks = data.stats.drinksThisWeek === 0 && !data.lastDrink;
  const hasTonight = Boolean(data.openSession || data.lastDrink);

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.neon} />} contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
        <Card>
          <Label>{hasTonight ? "Tonight mode" : "Home"}</Label>
          <Title>{noDrinks ? "Your night starts here." : hasTonight ? "Your night, live." : "Hydration is character development."}</Title>
          <Muted>{noDrinks ? "No chaos logged yet. Respectfully suspicious." : hasTonight ? "Fast checks for drinks, spend, safety, and getting home." : "Weekend Mode: pending."}</Muted>
        </Card>
        {noDrinks ? <EmptyState icon="+" title="Your night starts here." text="Log your first drink and the recap card wakes up." action="Log first drink" onPress={() => router.push("/(tabs)/log")} /> : null}
        {hasTonight ? <TonightMode data={data} /> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Mini label="Drinks" value={String(data.stats.drinksThisWeek)} />
          <Mini label="Calories" value={String(data.stats.caloriesThisWeek)} />
          <Mini label="Spent" value={`$${data.stats.spentThisWeek.toFixed(0)}`} />
          <Mini label="Streak" value={`${data.stats.soberStreak}d`} />
        </View>
        <Card>
          <Label>Weekly recap</Label>
          <Title>{data.recap.summary}</Title>
          <Muted>Favorite: {data.recap.favoriteDrink ?? "none yet"} / Place: {data.recap.favoriteLocation ?? "still exploring"}</Muted>
        </Card>
        <Card style={data.safety.urgent ? { borderColor: colors.ember, backgroundColor: "rgba(255,138,61,0.12)" } : undefined}>
          <Label>Safety</Label>
          <Title>{data.safety.urgent ? "Do Not Drive" : data.safety.status}</Title>
          <Text style={{ color: colors.ink, backgroundColor: colors.ember, borderRadius: 12, overflow: "hidden", padding: 10, textAlign: "center", fontWeight: "900" }}>
            Do not drive after drinking.
          </Text>
          <Muted>{data.safety.urgent ? "Skip the jokes here. Get a ride, water, and food." : data.safety.tip}</Muted>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function TonightMode({ data }: { data: DashboardPayload }) {
  const session = data.openSession;
  const lastDrinkAt = data.lastDrink ? new Date(data.lastDrink.loggedAt) : null;
  const minutesSinceLastDrink = lastDrinkAt ? Math.max(0, Math.round((Date.now() - lastDrinkAt.getTime()) / 60000)) : null;
  const lastDrinkLabel = minutesSinceLastDrink === null
    ? "No drink logged yet"
    : minutesSinceLastDrink < 60
      ? `${minutesSinceLastDrink} min ago`
      : `${Math.floor(minutesSinceLastDrink / 60)}h ${minutesSinceLastDrink % 60}m ago`;
  const fallbackCalories = data.lastDrink?.caloriesEstimate ?? estimateCalories(data.lastDrink?.drinkType, data.lastDrink?.volumeMl, data.lastDrink?.abv);

  return (
    <Card style={{ borderColor: data.safety.urgent ? colors.ember : colors.neon, backgroundColor: data.safety.urgent ? "rgba(255,138,61,0.12)" : "rgba(124,255,107,0.1)" }}>
      <Label>Live session</Label>
      <Title>{session?.title ?? "Recent night"}</Title>
      <Muted>{session?.location ?? data.lastDrink?.location ?? "Location not set"} / Last drink {lastDrinkLabel}</Muted>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <TonightStat label="Drinks" value={String(session?.totalDrinks ?? (data.lastDrink ? 1 : 0))} />
        <TonightStat label="Spent" value={`$${(session?.totalSpent ?? data.lastDrink?.price ?? 0).toFixed(0)}`} />
        <TonightStat label="Calories" value={String(Math.round(session?.totalCalories ?? fallbackCalories))} />
        <TonightStat label="BAC est." value={`${data.safety.bac.toFixed(3)}%`} />
      </View>
      <Text style={{ color: colors.ink, backgroundColor: colors.ember, borderRadius: 12, overflow: "hidden", padding: 10, textAlign: "center", fontWeight: "900" }}>
        Do not drive after drinking.
      </Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Action title="Log drink" onPress={() => router.push("/(tabs)/log")} />
        <Action title="Call ride" secondary onPress={() => Linking.openURL("https://m.uber.com/")} />
      </View>
    </Card>
  );
}

function TonightStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: "47%", borderRadius: 16, backgroundColor: "rgba(0,0,0,0.22)", padding: 12 }}>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: "900" }}>{value}</Text>
    </View>
  );
}

function Action({ title, onPress, secondary }: { title: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Text
      onPress={onPress}
      style={{
        flex: 1,
        color: secondary ? colors.text : colors.ink,
        backgroundColor: secondary ? "rgba(255,255,255,0.12)" : colors.neon,
        borderRadius: 999,
        paddingVertical: 13,
        textAlign: "center",
        fontWeight: "900",
        overflow: "hidden",
      }}
    >
      {title}
    </Text>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <Card style={{ width: "47%" }}><Muted>{label}</Muted><Text style={{ color: colors.text, fontSize: 26, fontWeight: "900" }}>{value}</Text></Card>;
}

function estimateCalories(drinkType?: string, volumeMl = 0, abv = 0) {
  const alcoholGrams = volumeMl * (abv / 100) * 0.789;
  const alcoholCalories = alcoholGrams * 7;
  const multiplier: Record<string, number> = {
    BEER: 1.55,
    WINE: 1.15,
    WHISKY: 1.05,
    VODKA: 1.05,
    GIN: 1.05,
    RUM: 1.15,
    TEQUILA: 1.05,
    COCKTAIL: 1.75,
    OTHER: 1.25,
  };

  return Math.round(alcoholCalories * (multiplier[drinkType ?? "OTHER"] ?? multiplier.OTHER));
}
