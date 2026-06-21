import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text } from "react-native";
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

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <Screen><LoadingState /></Screen>;

  return (
    <Screen>
      <Title>Friends</Title>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        <Card>
          <Field value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="Add by username" />
          <ErrorText message={error} />
          <Button title="Add friend" loading={saving} onPress={addFriend} />
        </Card>
        {friends.length === 0 ? <EmptyState icon="👯" title="Drinking is social." text="Add your first friend. The group chat can recover later." /> : null}
        {friends.map((item) => (
          <Card key={item.id}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>{item.friend.name}</Text>
            <Muted>@{item.friend.username} · {item.status}</Muted>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
