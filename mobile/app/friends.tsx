import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { EmptyState, LoadingState } from "@/components/data-state";
import { Button, Card, ErrorText, Field, Muted, Screen, Title } from "@/components/ui";
import { endpoints, type Friend } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const result = await endpoints.friends();
      setFriends(result.friends);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load friends.");
    } finally {
      setLoading(false);
    }
  }

  async function addFriend() {
    setSaving(true);
    setError("");
    try {
      await endpoints.addFriend(username);
      setUsername("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add friend.");
    } finally {
      setSaving(false);
    }
  }

  async function respond(friendshipId: string, action: "accept" | "reject") {
    setError("");
    try {
      await endpoints.respondFriend(friendshipId, action);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update friend request.");
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <Screen><LoadingState /></Screen>;

  const incoming = friends.filter((item) => item.direction === "incoming" && item.status === "PENDING");
  const accepted = friends.filter((item) => item.status === "ACCEPTED");
  const outgoing = friends.filter((item) => item.direction === "outgoing" && item.status === "PENDING");

  return (
    <Screen>
      <Title>Friends</Title>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        <Card>
          <Field value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="Add by username" />
          <ErrorText message={error} />
          <Button title="Add friend" loading={saving} onPress={addFriend} />
        </Card>
        <FriendGroup title="Incoming requests" empty="No incoming requests." items={incoming} onRespond={respond} />
        <FriendGroup title="Friends" empty="No accepted friends yet." items={accepted} />
        <FriendGroup title="Sent requests" empty="No pending sent requests." items={outgoing} />
      </ScrollView>
    </Screen>
  );
}

function FriendGroup({
  title,
  empty,
  items,
  onRespond,
}: {
  title: string;
  empty: string;
  items: Friend[];
  onRespond?: (friendshipId: string, action: "accept" | "reject") => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>{title}</Text>
      {items.length === 0 ? <EmptyState icon="👯" title={empty} text="Accepted friends can see friends-only drink posts." /> : null}
      {items.map((item) => (
        <Card key={item.id}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>{item.friend.name}</Text>
          <Muted>@{item.friend.username} · {item.status}</Muted>
          {onRespond ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button title="Accept" onPress={() => onRespond(item.id, "accept")} />
              <Button title="Reject" secondary onPress={() => onRespond(item.id, "reject")} />
            </View>
          ) : null}
        </Card>
      ))}
    </View>
  );
}
