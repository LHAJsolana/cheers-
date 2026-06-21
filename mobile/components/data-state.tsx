import { ActivityIndicator, Text, View } from "react-native";
import { Button, Card, Muted } from "@/components/ui";
import { colors } from "@/lib/theme";

export function LoadingState({ label = "Loading the vibes..." }: { label?: string }) {
  return <View style={{ padding: 24, alignItems: "center", gap: 12 }}><ActivityIndicator color={colors.neon} /><Muted>{label}</Muted></View>;
}

export function EmptyState({ icon, title, text, action, onPress }: { icon: string; title: string; text: string; action?: string; onPress?: () => void }) {
  return (
    <Card style={{ alignItems: "center" }}>
      <Text style={{ fontSize: 42 }}>{icon}</Text>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: "900", textAlign: "center" }}>{title}</Text>
      <Muted>{text}</Muted>
      {action ? <Button title={action} onPress={onPress} /> : null}
    </Card>
  );
}
