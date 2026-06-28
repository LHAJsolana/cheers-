import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { EmptyState, LoadingState } from "@/components/data-state";
import { Card, Muted, Screen, Title } from "@/components/ui";
import { endpoints, type Activity } from "@/lib/api";
import { colors } from "@/lib/theme";

const reactions = [
  ["CHEERS", "🍻 Cheers"],
  ["LEGENDARY", "🔥 Legendary"],
  ["CHAOS", "😂 Chaos"],
  ["RIP_TOMORROW", "💀 RIP"],
  ["RESPECT", "🫡 Respect"],
];

const presetComments = [
  "Elite order",
  "Hydrate, legend",
  "Wallet took damage",
  "Main character behavior",
  "That spot looks dangerous",
  "Respectfully chaotic",
];

export default function FeedScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const result = await endpoints.feed();
      setActivities(result.activities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load feed.");
    } finally {
      setLoading(false);
    }
  }

  async function react(activityId: string, type: string) {
    await endpoints.react(activityId, type);
    await load();
  }

  async function comment(activityId: string, text: string) {
    await endpoints.comment(activityId, text);
    await load();
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <Screen><LoadingState /></Screen>;
  if (error) return <Screen><EmptyState icon="🧠" title="Feed tripped." text={error} action="Retry" onPress={load} /></Screen>;

  return (
    <Screen>
      <Title>Feed</Title>
      <ScrollView keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.neon} />} contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        {activities.length === 0 ? <EmptyState icon="🪩" title="No chaos yet." text="Start a session and give the feed something to gossip about." /> : null}
        {activities.map((activity) => <FeedCard key={activity.id} activity={activity} onReact={react} onComment={comment} />)}
      </ScrollView>
    </Screen>
  );
}

function FeedCard({
  activity,
  onReact,
  onComment,
}: {
  activity: Activity;
  onReact: (activityId: string, type: string) => void;
  onComment: (activityId: string, text: string) => void;
}) {
  return (
    <Card>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: colors.neon, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.ink, fontWeight: "900" }}>{initials(activity.user.name)}</Text>
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={{ color: colors.text, fontWeight: "900" }}>{activity.user.name}</Text>
          <Text style={{ color: colors.text, fontSize: 15 }}>{activity.message}</Text>
          <Muted>{new Date(activity.createdAt).toLocaleString()}</Muted>
          {activity.drinkLog ? (
            <View style={{ backgroundColor: "rgba(255,255,255,0.06)", padding: 10, borderRadius: 14, gap: 8 }}>
              {activity.drinkLog.drinkPhotoUrl ? <Image source={{ uri: activity.drinkLog.drinkPhotoUrl }} style={{ width: "100%", height: 190, borderRadius: 12 }} /> : null}
              {activity.drinkLog.placePhotoUrl ? <Image source={{ uri: activity.drinkLog.placePhotoUrl }} style={{ width: "100%", height: 190, borderRadius: 12 }} /> : null}
              <Text style={{ color: colors.text, fontWeight: "900" }}>{activity.drinkLog.drinkName}</Text>
              <Muted>{activity.drinkLog.volumeMl} ml · {activity.drinkLog.abv}% · {activity.drinkLog.location ?? "mystery location"}</Muted>
            </View>
          ) : null}
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {reactions.map(([type, label]) => {
          const count = activity.reactions.filter((reaction) => reaction.type === type).length;
          return <Text key={type} onPress={() => onReact(activity.id, type)} style={pillStyle}>{label} {count || ""}</Text>;
        })}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {presetComments.map((text) => <Text key={text} onPress={() => onComment(activity.id, text)} style={pillStyle}>{text}</Text>)}
      </View>
      {activity.comments.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {activity.comments.map((comment) => <Text key={comment.id} style={commentStyle}>{comment.user.name}: {comment.text}</Text>)}
        </View>
      ) : null}
    </Card>
  );
}

const pillStyle = {
  color: colors.text,
  backgroundColor: "rgba(255,255,255,0.1)",
  paddingHorizontal: 10,
  paddingVertical: 8,
  borderRadius: 999,
  fontWeight: "800" as const,
};

const commentStyle = {
  color: colors.text,
  backgroundColor: "rgba(124,255,107,0.12)",
  paddingHorizontal: 10,
  paddingVertical: 8,
  borderRadius: 999,
  fontWeight: "800" as const,
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
