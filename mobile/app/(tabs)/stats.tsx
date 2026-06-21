import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { EmptyState, LoadingState } from "@/components/data-state";
import { Card, Label, Muted, Screen, Title } from "@/components/ui";
import { endpoints, type StatsPayload } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function StatsScreen() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setStats(await endpoints.stats());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load stats.");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <Screen><LoadingState /></Screen>;
  if (error) return <Screen><EmptyState icon="🫠" title="Stats tripped." text={error} action="Retry" onPress={load} /></Screen>;
  if (!stats) return null;

  return (
    <Screen>
      <Title>{stats.weeklyDrinks ? "Patterns without the lecture" : "Stats unlock after your first night out."}</Title>
      <ScrollView keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.neon} />} contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        {stats.weeklyDrinks === 0 ? <EmptyState icon="📊" title="No stats yet." text="Your charts are stretching. Give them a night out." /> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Mini label="Drinks" value={String(stats.weeklyDrinks)} />
          <Mini label="Calories" value={String(stats.weeklyCalories)} />
          <Mini label="Spent" value={`$${stats.weeklySpending.toFixed(0)}`} />
          <Mini label="Free days" value={`${stats.alcoholFreeDays.freeDays}/${stats.alcoholFreeDays.totalDays}`} />
        </View>
        <Card>
          <Label>Favorites</Label>
          <Muted>Drink: {stats.mostDrinkType ?? "None yet"}</Muted>
          <Muted>Location: {stats.mostVisitedLocation ?? "None yet"}</Muted>
        </Card>
        <Card>
          <Label>Achievements</Label>
          {stats.achievements.length === 0 ? <Muted>No badges yet. First Round is waiting.</Muted> : stats.achievements.map((item) => <Text key={item.id} style={{ color: colors.text, fontWeight: "900" }}>{item.title}</Text>)}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <Card style={{ width: "47%" }}><Muted>{label}</Muted><Text style={{ color: colors.text, fontSize: 26, fontWeight: "900" }}>{value}</Text></Card>;
}
